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

## How it works

`docker-chromium` pulls a pre-built Docker image running a version of Chromium specified by you from a Docker Hub repository. You can then fetch the WebSocket URI to connect to the instance in your own application. If the pre-built image is unavailable or corrupt (rare case), a backup mechanism is in place, which builds the image from scratch locally instead.
