const request = require('request-promise-native');

const { getConfig } = require('./config');

const {
    dockerComposePath,
    dockerFilePath,
    alternativeDockerFilePath
} = getConfig();

const { promisify } = require('util');
const fs = require('fs');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const { CONSOLE_PREFIX, runCommand } = require('./utils');

require('colors');

let serviceToBuild = 'chromium';

const dockerBuild = async () => {
    let hasTriedAlternative = false;
    try {
        console.log(`${CONSOLE_PREFIX} Building Docker image...`.green);
        await runCommand('docker-compose', [
            '-f',
            `"${dockerComposePath}"`,
            'build',
            `--build-arg CHROMIUM_ADDITIONAL_ARGS="${process.env
                .CHROMIUM_ADDITIONAL_ARGS || '[]'}"`,
            '--pull',
            serviceToBuild
        ]);
        console.log(`${CONSOLE_PREFIX} Successfully built Docker image`.green);
    } catch (error) {
        const unresolvedError = new Error(
            `${CONSOLE_PREFIX} Failed to build Docker image \n\nInternal Error: \n\n${error}`
        );

        if (error.message.includes('failed to build')) {
            // we will assume this error means there's either a problem with the image or it doesn't exist
            // in this case, we will manually build the image from scratch and download Chromium (just once)
            if (!hasTriedAlternative) {
                hasTriedAlternative = true;
                serviceToBuild = 'chromium_alternative';

                console.log(error);
                console.log(
                    `${CONSOLE_PREFIX} Failed to build Docker image from repository, now trying to build from scratch. This will take some time...`
                        .red
                );
                return new Promise(resolve => {
                    setTimeout(async () => {
                        resolve(await dockerBuild());
                    }, 500);
                });
            } else {
                throw unresolvedError;
            }
        } else {
            throw unresolvedError;
        }
    }
};

const dockerUp = async () => {
    try {
        console.log(`${CONSOLE_PREFIX} Starting Docker container...`.green);
        await runCommand('docker-compose', [
            '-f',
            `"${dockerComposePath}"`,
            'up',
            '-d',
            serviceToBuild
        ]);
        console.log(
            `${CONSOLE_PREFIX} Successfully started Docker container`.green
        );
    } catch (error) {
        throw new Error(
            `${CONSOLE_PREFIX} Failed to start Docker container \n\nInternal Error: \n\n${error}`
        );
    }
};

const dockerDown = async () => {
    try {
        console.log(
            `${CONSOLE_PREFIX} Shutting down Docker container...`.green
        );
        await runCommand('docker-compose', [
            '-f',
            `"${dockerComposePath}"`,
            'down'
        ]);
        console.log(
            `${CONSOLE_PREFIX} Successfully shut down Docker container`.green
        );
    } catch (error) {
        throw new Error(
            `${CONSOLE_PREFIX} Failed to shut down Docker container \n\nInternal Error: \n\n${error}`
        );
    }
};

const contactChromium = async ({ config, maxAttempts }) => {
    let count = 1;
    console.log(`${CONSOLE_PREFIX} Contacting Chromium in container...`.green);

    async function tryRequest() {
        try {
            return await request(config);
        } catch (e) {
            count += 1;
            if (count <= maxAttempts) {
                return new Promise(resolve => {
                    setTimeout(async () => {
                        console.log(
                            `${CONSOLE_PREFIX} Attempt #${count}`.yellow
                        );
                        resolve(await tryRequest());
                    }, 500);
                });
            }
            console.log(
                `${CONSOLE_PREFIX} Max number of attempts exceeded. I'm giving up!`
                    .red
            );
            throw e;
        }
    }

    return tryRequest();
};

const dockerSetChromiumVersion = async revision => {
    const latestTag = `rev-${revision}`;

    // patch Dockerfile
    let data = await readFile(dockerFilePath, { encoding: 'utf-8' });
    let previousTag = data.match(/:(.*)/)[1]; // get everything after : on same line
    let newData = data.replace(previousTag, latestTag);
    await writeFile(dockerFilePath, newData, { encoding: 'utf-8' });

    // patch Dockerfile2 (alternative)
    data = await readFile(alternativeDockerFilePath, { encoding: 'utf-8' });
    previousTag = data.match(/REV=(.*)/)[1]; // get everything after revision on same line
    newData = data.replace(previousTag, revision);
    await writeFile(alternativeDockerFilePath, newData, { encoding: 'utf-8' });
};

const dockerRun = async () => {
    await dockerBuild();
    await dockerUp();

    const res = await contactChromium({
        config: {
            uri: `http://localhost:9222/json/version`,
            json: true,
            resolveWithFullResponse: true
        },
        maxAttempts: 5
    });

    const webSocketUri = res.body.webSocketDebuggerUrl;
    console.log(
        `${CONSOLE_PREFIX} Connected to WebSocket URL: ${webSocketUri}`.green
    );

    return webSocketUri;
};

module.exports = {
    dockerSetChromiumVersion,
    dockerRunChromium: dockerRun,
    dockerShutdownChromium: dockerDown
};
