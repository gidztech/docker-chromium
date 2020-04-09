const spawn = require('child_process').spawn;

module.exports = {
    runCommand: (command, args) =>
        new Promise((resolve, reject) => {
            const runCommand = spawn(command, args);

            runCommand.stdout.on('data', data => {
                console.log(data.toString());
            });

            runCommand.stderr.on('data', data => {
                console.log(data.toString());
            });

            runCommand.on('error', error => {
                reject(error);
            });

            runCommand.on('exit', exitCode => {
                if (exitCode === 0) {
                    resolve(exitCode);
                } else {
                    reject(exitCode);
                }
            });
        }),
    CONSOLE_PREFIX: 'Docker Chromium:'
};
