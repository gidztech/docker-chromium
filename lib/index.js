const request = require('request-promise-native');
const path = require('path');

require('colors');

const { CONSOLE_PREFIX, runCommand } = require('../src/utils');

const {
    DEFAULT_CHROMIUM_REVISION,
    DEFAULT_CHROMIUM_DOWNLOAD_HOST,
    DEFAULT_USE_CLOSEST_UBUNTU_MIRROR
} = require('./defaults');

const dockerComposePath = path.join(__dirname, '../docker/docker-compose.yml');

let serviceToBuild = 'chromium';
let chromiumAdditionalArgs;
let chromiumDownloadHost;
let chromiumRevision;
let shouldUseClosestUbuntuMirror;

const dockerBuild = async () => {
    try {
        console.log(`${CONSOLE_PREFIX} Building Docker image...`.green);
        await runCommand('docker-compose', [
            '-f',
            `"${dockerComposePath}"`,
            'build',
            `--build-arg CHROMIUM_ADDITIONAL_ARGS="${chromiumAdditionalArgs}"`,
            `--build-arg CHROMIUM_DOWNLOAD_HOST=${chromiumDownloadHost}`,
            `--build-arg CHROMIUM_REVISION=${chromiumRevision ||
                DEFAULT_CHROMIUM_REVISION}`,
            `--build-arg DEFAULT_USE_CLOSEST_UBUNTU_MIRROR=${shouldUseClosestUbuntuMirror ||
                DEFAULT_USE_CLOSEST_UBUNTU_MIRROR}`,
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

const dockerConfig = ({
    flags,
    revision,
    downloadHost,
    useClosestUbuntuMirror
}) => {
    shouldUseClosestUbuntuMirror =
        useClosestUbuntuMirror ||
        process.env.USE_CLOSEST_UBUNTU_MIRROR ||
        process.env.npm_config_use_closest_ubuntu_mirror ||
        process.env.npm_package_config_use_closest_ubuntu_mirror;
    console.log(
        `${CONSOLE_PREFIX} Setting Ubuntu to use ${
            useClosestUbuntuMirror ? 'closest' : 'default'
        } mirror for packages...`.green
    );

    chromiumDownloadHost =
        downloadHost ||
        process.env.PUPPETEER_DOWNLOAD_HOST ||
        process.env.npm_config_puppeteer_download_host ||
        process.env.npm_package_config_puppeteer_download_host ||
        DEFAULT_CHROMIUM_DOWNLOAD_HOST;

    console.log(
        `${CONSOLE_PREFIX} Setting Chromium download host to ${chromiumDownloadHost}...`
            .green
    );

    chromiumAdditionalArgs = flags || process.env.CHROMIUM_ADDITIONAL_ARGS;
    if (chromiumAdditionalArgs) {
        console.log(
            `${CONSOLE_PREFIX} Setting Chromium flags to ${chromiumAdditionalArgs}...`
                .green
        );
    }

    if (revision) {
        console.log(
            `${CONSOLE_PREFIX} Setting Chromium version to rev-${revision}...`
                .green
        );

        chromiumRevision = revision;
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
    dockerBuildContainer: dockerBuild,
    dockerRunChromium: dockerRun,
    dockerShutdownChromium: dockerDown
};
