const request = require('request-promise-native');

const { getConfig } = require('../src/config');

const { dockerComposePath, dockerFilePath } = getConfig();

const { promisify } = require('util');
const fs = require('fs');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const { CONSOLE_PREFIX, runCommand } = require('../src/utils');

require('colors');

let serviceToBuild = 'chromium';
let chromiumAdditionalArgs;

const dockerBuild = async () => {
    try {
        console.log(`${CONSOLE_PREFIX} Building Docker image...`.green);
        await runCommand('docker-compose', [
            '-f',
            `"${dockerComposePath}"`,
            'build',
            `--build-arg CHROMIUM_ADDITIONAL_ARGS="${chromiumAdditionalArgs}"`,
            '--pull',
            serviceToBuild
        ]);
        console.log(`${CONSOLE_PREFIX} Successfully built Docker image`.green);
    } catch (error) {
        throw new Error(
            `${CONSOLE_PREFIX} Failed to build Docker image \n\nInternal Error: \n\n${error}`
        );
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

const contactChromium = async ({ config, maxAttempts, retryInterval }) => {
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
                    }, retryInterval);
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

const dockerConfig = async ({ flags, revision }) => {
    chromiumAdditionalArgs = flags || process.env.CHROMIUM_ADDITIONAL_ARGS;

    if (chromiumAdditionalArgs) {
        console.log(
            `${CONSOLE_PREFIX} Setting Chromium flags to ${chromiumAdditionalArgs}...`
                .green
        );
    }
    if (revision) {
        const latestTag = `rev-${revision}`;

        console.log(
            `${CONSOLE_PREFIX} Setting Chromium version to ${latestTag}...`
                .green
        );

        // patch Dockerfile
        const data = await readFile(dockerFilePath, { encoding: 'utf-8' });
        const previousTag = data.match(/REV=(.*)/)[1]; // get everything after revision on same line
        const newData = data.replace(previousTag, revision);
        await writeFile(dockerFilePath, newData, {
            encoding: 'utf-8'
        });
    } else {
        return null;
    }
};

const dockerRun = async ({ maxAttempts, retryInterval } = {}) => {
    maxAttempts = maxAttempts || process.env.DOCKER_CHROMIUM_MAX_ATTEMPTS || 5;
    retryInterval =
        retryInterval || process.env.DOCKER_CHROMIUM_RETRY_INTERVAL || 500;

    await dockerBuild();
    await dockerUp();

    const res = await contactChromium({
        config: {
            uri: `http://localhost:9222/json/version`,
            json: true,
            resolveWithFullResponse: true
        },
        maxAttempts,
        retryInterval
    });

    const webSocketUri = res.body.webSocketDebuggerUrl;
    console.log(
        `${CONSOLE_PREFIX} Connected to WebSocket URL: ${webSocketUri}`.green
    );

    return webSocketUri;
};

module.exports = {
    dockerSetChromiumConfig: dockerConfig,
    dockerRunChromium: dockerRun,
    dockerShutdownChromium: dockerDown
};
