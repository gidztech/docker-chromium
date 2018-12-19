# docker-chromium

[![Build Status](https://travis-ci.org/gidztech/docker-chromium.svg?branch=master)](https://travis-ci.org/gidztech/docker-chromium)
**Node library for controlling a Chromium instance running in a Docker container **

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
    dockerSetChromiumVersion,
    dockerRunChromium,
    dockerShutdownChromium
} = require("docker-chromium");

(async () => {
    await dockerSetChromiumVersion("123456");
    const webSocketUri = await dockerRunChromium();
    // do some stuff
    await dockerShutdownChromium();
})();
```

## How it works

`docker-chromium` will pull a pre-build Docker image and start the container, with a version of Chromium specified by you. You will then be able to receive a WebSocket URI to connect to the instance in your application. If the pre-built image is unavailable or corrupt (rare case), a backup mechanism is in place, which builds the image from scratch locally.
