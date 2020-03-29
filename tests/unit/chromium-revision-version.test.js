import {
    dockerBuildContainer,
    dockerSetChromiumConfig,
    dockerShutdownChromium
} from '../../lib';
import { runCommand } from '../../src/utils';
import { DEFAULT_CHROMIUM_REVISION } from '../../lib/defaults';

jest.mock('../../src/utils');

describe('index', () => {
    it('should use default chromium revision version if we do not pass any revision to config function', async () => {
        dockerSetChromiumConfig({});

        await dockerBuildContainer();

        const expectedChromiumRevisionBuildArg = `--build-arg CHROMIUM_REVISION=${DEFAULT_CHROMIUM_REVISION}`;
        expect(runCommand.mock.calls[0][1]).toContain(
            expectedChromiumRevisionBuildArg
        );
    });

    it('should set chromium revision and then run proper command to build docker with given revision', async () => {
        dockerSetChromiumConfig({ revision: 999 });

        await dockerBuildContainer();

        expect(runCommand.mock.calls[0][1]).toContain(
            '--build-arg CHROMIUM_REVISION=999'
        );
    });
});
