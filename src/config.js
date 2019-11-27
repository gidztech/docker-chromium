const path = require('path');

const getConfig = () => ({
    dockerComposePath: path.join(__dirname, '../docker/docker-compose.yml'),
    dockerFilePath: path.join(__dirname, '../docker/Dockerfile')
});

module.exports = { getConfig };
