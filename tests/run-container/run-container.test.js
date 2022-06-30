const {
    dockerSetChromiumConfig,
    dockerRunChromium,
    dockerShutdownChromium
} = require('../../lib/index');

describe('runContainer', () => {
    afterAll(async () => {
        await dockerShutdownChromium();
    });

    it('runs container and provides websocket uri', async () => {
        dockerSetChromiumConfig({
            flags: [' -–ignore-certificate-errors'],
            revision: 754306
        });

        const webSocketUri = await dockerRunChromium();

        expect(webSocketUri).toContain('ws://');
    }, 300000);

    it('runs container with a specific image and provides websocket uri', async () => {
        dockerSetChromiumConfig({
            useImage: 'bertuz/docker-chromium:chromium103.0.5060.53-test6',
            flags: [' -–ignore-certificate-errors'],
            revision: 754306
        });

        const webSocketUri = await dockerRunChromium();

        expect(webSocketUri).toContain('ws://');
    }, 300000);
});
