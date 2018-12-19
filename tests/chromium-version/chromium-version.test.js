const fs = require('fs');
const path = require('path');

const dockerComposePath = path.join(__dirname, './config/docker-compose.yml');
const dockerFilePath = path.join(__dirname, './config/Dockerfile');
const alternativeDockerFilePath = path.join(__dirname, './config/Dockerfile2');

describe('chromiumVersion', async () => {
    it('updates both docker files with the correct tag versions', async () => {
        // setup getConfig mock in config module
        jest.mock('../../config');
        const config = require('../../config');

        config.getConfig.mockImplementation(() => ({
            dockerComposePath,
            dockerFilePath,
            alternativeDockerFilePath
        }));

        // app code
        const { dockerSetChromiumVersion } = require('../../index');
        await dockerSetChromiumVersion('123456');

        const dockerFile1Data = fs
            .readFileSync(dockerFilePath, {
                encoding: 'utf-8'
            })
            .split('\n')[0];

        const dockerFile2Data = fs
            .readFileSync(alternativeDockerFilePath, {
                encoding: 'utf-8'
            })
            .split('\n')[2];

        // assertions
        expect(dockerFile1Data).toEqual(
            'FROM alpeware/chrome-headless-trunk:rev-123456'
        );
        expect(dockerFile2Data).toEqual('ENV REV=123456');
    });
});
