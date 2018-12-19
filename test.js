const {
    dockerSetChromiumVersion,
    dockerRunChromium,
    dockerShutdownChromium
} = require('./index');

(async () => {
    dockerSetChromiumVersion('599821');
    const webSocketUri = await dockerRunChromium();
    console.log(webSocketUri);
    await dockerShutdownChromium();
})();
