const { existsSync, mkdirSync, copyFileSync } = require('fs');

const setupChromiumVersionFixtures = () => {
    const configPath = './tests/chromium-version/config';

    if (!existsSync(configPath)) {
        mkdirSync(configPath);
    }
    copyFileSync('./Dockerfile', `${configPath}/Dockerfile`);
    copyFileSync('./Dockerfile2', `${configPath}/Dockerfile2`);
};

const setupRunContainerFixtures = () => {
    const configPath = './tests/run-container/config';

    if (!existsSync(configPath)) {
        mkdirSync(configPath);
    }

    copyFileSync('./docker-compose.yml', `${configPath}/docker-compose.yml`);
    copyFileSync('./Dockerfile', `${configPath}/Dockerfile`);
    copyFileSync('./Dockerfile2', `${configPath}/Dockerfile2`);
    copyFileSync('./entrypoint.sh', `${configPath}/entrypoint.sh`);
    copyFileSync('./import_cert.sh', `${configPath}/import_cert.sh`);
};

setupChromiumVersionFixtures();
setupRunContainerFixtures();
