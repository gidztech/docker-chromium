const path = require('path');

const getConfig = () => ({
    dockerComposePath: path.join(__dirname, './docker-compose.yml'),
    dockerFilePath: path.join(__dirname, './Dockerfile'),
    alternativeDockerFilePath: path.join(__dirname, './Dockerfile2')
});

module.exports = { getConfig };
