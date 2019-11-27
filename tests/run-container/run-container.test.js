const path = require('path');
const {
    dockerSetChromiumConfig,
    dockerRunChromium
} = require('../../lib/index');

const dockerComposePath = path.join(__dirname, './config/docker-compose.yml');
const dockerFilePath = path.join(__dirname, './config/Dockerfile');

describe('runContainer', async () => {
    it('runs container and provides websocket uri', async () => {
        // setup getConfig mock in config module
        jest.mock('../../src/config');
        const config = require('../../src/config');

        config.getConfig.mockImplementation(() => ({
            dockerComposePath,
            dockerFilePath
        }));

        jest.setTimeout(300000); // give it 5 minutes to download image/run container

        // app code
        await dockerSetChromiumConfig({
            flags: [' -–ignore-certificate-errors']
        });

        const webSocketUri = await dockerRunChromium();

        // assertions
        expect(webSocketUri).toContain('ws://');
    });
});
