const { copySync } = require('fs-extra');
const dockerPath = './docker';

const setupChromiumVersionFixtures = () => {
    const filterFunc = src => {
        if (src !== 'docker/Dockerfile' || src !== 'docker/Dockerfile_build') {
            return false;
        }
        return true;
    };

    const configPath = './tests/chromium-version/config';
    copySync(dockerPath, configPath, { filter: filterFunc });
};

const setupRunContainerFixtures = () => {
    const configPath = './tests/run-container/config';
    copySync(dockerPath, configPath);
};

setupChromiumVersionFixtures();
setupRunContainerFixtures();
