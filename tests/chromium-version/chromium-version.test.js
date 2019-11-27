const fs = require('fs');
const path = require('path');

const dockerComposePath = path.join(__dirname, './config/docker-compose.yml');
const dockerFilePath = path.join(__dirname, './config/Dockerfile');

describe('chromiumVersion', async () => {
    it('updates both docker files with the correct tag versions', async () => {
        // setup getConfig mock in config module
        jest.mock('../../src/config');
        const config = require('../../src/config');

        config.getConfig.mockImplementation(() => ({
            dockerComposePath,
            dockerFilePath
        }));

        // app code
        const { dockerSetChromiumConfig } = require('../../lib/index');
        await dockerSetChromiumConfig({ revision: '123456' });

        const dockerFileData = fs
            .readFileSync(dockerFilePath, {
                encoding: 'utf-8'
            })
            .split('\n')[2];

        expect(dockerFileData).toEqual('ENV REV=123456');
    });
});
