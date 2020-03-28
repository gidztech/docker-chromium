const {
    dockerSetChromiumConfig,
    dockerRunChromium
} = require('../../lib/index');

describe('runContainer', async () => {
    it('runs container and provides websocket uri', async () => {
        dockerSetChromiumConfig({
            flags: [' -–ignore-certificate-errors'],
            revision: 754306
        });

        const webSocketUri = await dockerRunChromium();

        expect(webSocketUri).toContain('ws://');
    }, 300000);
});
