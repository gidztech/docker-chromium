import { dockerRunChromium, dockerSetChromiumConfig } from '../../lib';
import { runCommand } from '../../src/utils';
import { DEFAULT_CHROMIUM_REVISION } from '../../lib/defaults';

jest.mock('../../src/utils');

describe('index', async () => {
    it('should use default chromium revision version if we do not pass any revision to config function', () => {
        dockerSetChromiumConfig({});

        dockerRunChromium();

        const expectedChromiumRevisionBuildArg = `--build-arg CHROMIUM_REVISION=${DEFAULT_CHROMIUM_REVISION}`;
        expect(runCommand.mock.calls[0][1]).toContain(
            expectedChromiumRevisionBuildArg
        );
    });

    it('should set chromium revision and then run proper command to build docker with given revision', () => {
        dockerSetChromiumConfig({ revision: 999 });

        dockerRunChromium();

        expect(runCommand.mock.calls[0][1]).toContain(
            '--build-arg CHROMIUM_REVISION=999'
        );
    });
});
