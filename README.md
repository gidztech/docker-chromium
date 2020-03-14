# docker-chromium

[![Build Status](https://travis-ci.org/gidztech/docker-chromium.svg?branch=master)](https://travis-ci.org/gidztech/docker-chromium)
**Node library for controlling a Chromium instance running in a Docker container**

[![NPM](https://nodei.co/npm/docker-chromium.png)](https://www.npmjs.com/package/docker-chromium)

## Installation

**Requirements:**

-   [`Docker`](https://docs.docker.com/install/)

```
npm install --save docker-chromium
```

## Basic Usage

```javascript
const {
    dockerSetChromiumConfig,
    dockerRunChromium,
    dockerShutdownChromium
} = require("docker-chromium");

(async () => {
    await dockerSetChromiumConfig({
        revision: "123456"
        flags: [' -–ignore-certificate-errors']
    });
    const webSocketUri = await dockerRunChromium();
    // do some other stuff...
    await dockerShutdownChromium();
})();
```

Default is trying to connect to Chromium 5 times with a 500 milisecond interval between each attempt. You can customize timeout/attempts by passing arguments to `dockerRunChromium`:

```javascript
// ...
const webSocketUri = await dockerRunChromium({
    maxAttempts: 10,
    retryInterval: 5000 // 5 seconds
});
```

Or by defining environment variables `DOCKER_CHROMIUM_MAX_ATTEMPTS` and `DOCKER_CHROMIUM_RETRY_INTERVAL`. Passing arguments to `dockerRunChromium` takes precedence over environment variables.

## How it works

`docker-chromium` pulls a pre-built Docker image running a version of Chromium specified by you from a Docker Hub repository. You can then fetch the WebSocket URI to connect to the instance in your own application. If the pre-built image is unavailable or corrupt (rare case), a backup mechanism is in place, which builds the image from scratch locally instead.

### Update

Due to Ubuntu 14.04 LTS transitioning to ESM support, we have had to upgrade the Ubuntu version to 18.04 LTS. The Dockerfile used in the pre-built version in Docker Hub remains on the old version. Until this is changed, we have to disable this option for the time being.
