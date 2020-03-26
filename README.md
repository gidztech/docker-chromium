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

## API

### dockerSetChromiumConfig

Function which is used to configuration of chromium, before when we run it by ``dockerRunChromium`` function.

##### Example of usage

```javascript
await dockerSetChromiumConfig({
        revision: "123456",
        flags: [' -–ignore-certificate-errors'],
    });
```

##### Arguments

- ``revision: string``
    - **Required**
    - Describes number of version for chromium
    
- ``flags: string[]``
    - *Optional*
    - *Defaults* to ``process.env.CHROMIUM_ADDITIONAL_ARGS``
    - Describes command line flags that Chromium accepts.
    
- ``downloadHost: string``
    - *Optional*
    - *Defaults* to ``process.env.PUPPETEER_DOWNLOAD_HOST || process.env.npm_config_puppeteer_download_host || process.env.npm_package_config_puppeteer_download_host || 'https://storage.googleapis.com'``
    - Describes host address for downloading of Chromium.
    - Describes only the beginning of address, like this rule: ``$CHROMIUM_DOWNLOAD_HOST/chromium-browser-snapshots/Linux_x64/$REV/chrome-linux.zip`` - ``$CHROMIUM_DOWNLOAD_HOST`` describes ``downloadHost`` argument
    - Example: If we run ``dockerSetChromiumConfig({downloadHost: 'https://internal.service.com, revision: 99999})``, it means that Chromium snapshot will be downloaded from *https://internal.service.com/chromium-browser-snapshots/Linux_x64/99999/chrome-linux.zip*

### dockerRunChromium

Function which is used to build and run docker image with downloaded and configured Chromium.

##### Example of usage

```javascript
const webSocketUri = await dockerRunChromium({
    maxAttempts: 10,
    retryInterval: 5000
});
````

##### Arguments

- ``maxAttempts: number``
    - *Optional*
    - *Defaults* to 5
    - Describes number of attempts of connections to Chromium in launched docker.
    
- ``retryInterval: number``
    - *Optional*
    - *Defaults* to 500
    - Describes number of milliseconds between attempts of connections to Chromium in launched docker.
    
##### Returns

- ``Promise<string>``
    - Returns web socket URI to launched Chromium in docker.
    - By this URI we can connect to Chromium and control it.
    
### dockerShutdownChromium

Function which is used to shutdown launched docker with Chromium.

##### Example of usage

```javascript
await dockerShutdownChromium();
```

## Contributors

- [**gidztech**](https://github.com/gidztech)
- [*Fiszcz*](https://github.com/Fiszcz)
- [*luiz*](https://github.com/luiz)
