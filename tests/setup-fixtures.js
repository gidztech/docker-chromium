const { existsSync, mkdirSync, copyFileSync } = require('fs');
const dockerPath = './docker';

const setupChromiumVersionFixtures = () => {
    const configPath = './tests/chromium-version/config';

    if (!existsSync(configPath)) {
        mkdirSync(configPath);
    }

    copyFileSync(`${dockerPath}/Dockerfile`, `${configPath}/Dockerfile`);

    copyFileSync(
        `${dockerPath}/Dockerfile_build`,
        `${configPath}/Dockerfile_build`
    );
};

const setupRunContainerFixtures = () => {
    const configPath = './tests/run-container/config';

    if (!existsSync(configPath)) {
        mkdirSync(configPath);
    }

    copyFileSync(
        `${dockerPath}/docker-compose.yml`,
        `${configPath}/docker-compose.yml`
    );

    copyFileSync(`${dockerPath}/Dockerfile`, `${configPath}/Dockerfile`);

    copyFileSync(
        `${dockerPath}/Dockerfile_build`,
        `${configPath}/Dockerfile_build`
    );

    copyFileSync(`${dockerPath}/entrypoint.sh`, `${configPath}/entrypoint.sh`);

    copyFileSync(
        `${dockerPath}/import_cert.sh`,
        `${configPath}/import_cert.sh`
    );
};

setupChromiumVersionFixtures();
setupRunContainerFixtures();
