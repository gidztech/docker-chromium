const {
    dockerSetChromiumConfig,
    dockerRunChromium,
    dockerShutdownChromium
} = require('../../lib/index');
const path = require('path');

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

    it('runs container with a specific dockerfile and provides websocket uri', async () => {
        dockerSetChromiumConfig({
            useDockerBuild: {
                dockerFile: 'Dockerfile',
                contextPath: path.join(__dirname, '/dockerFiles')
            },
            flags: [' -–ignore-certificate-errors'],
            revision: 754306
        });

        const webSocketUri = await dockerRunChromium();

        expect(webSocketUri).toContain('ws://');
    }, 300000);
});
