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

        const webSocketUri = await dockerRunChromium('some random change');

        expect(webSocketUri).toContain('ws://');
    }, 300000);
});
