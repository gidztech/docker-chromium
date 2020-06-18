# docker-chromium

![Tests](https://github.com/gidztech/docker-chromium/workflows/Tests/badge.svg)
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

Function which is used for the configuration of Chromium, before running it with `dockerRunChromium`.

##### Example of usage

```javascript
await dockerSetChromiumConfig({
    revision: '123456',
    flags: [' -–ignore-certificate-errors']
});
```

##### Arguments

-   `revision: string`
    -   **Required**
    -   Describes version number for Chromium
-   `flags: string[]`
    -   _Optional_
    -   _Defaults_ to `process.env.CHROMIUM_ADDITIONAL_ARGS`
    -   Describes command line flags that Chromium accepts.
-   `downloadHost: string`

    -   _Optional_
    -   _Defaults_ to `process.env.PUPPETEER_DOWNLOAD_HOST || process.env.npm_config_puppeteer_download_host || process.env.npm_package_config_puppeteer_download_host || 'https://storage.googleapis.com'`
    -   Describes host address for downloading of Chromium.
    -   Describes only the beginning of address, like this rule: `$CHROMIUM_DOWNLOAD_HOST/chromium-browser-snapshots/Linux_x64/$REV/chrome-linux.zip` - `$CHROMIUM_DOWNLOAD_HOST` describes `downloadHost` argument
    -   Example: If we run `dockerSetChromiumConfig({downloadHost: 'https://internal.service.com, revision: 99999})`, it means that Chromium snapshot will be downloaded from _https://internal.service.com/chromium-browser-snapshots/Linux_x64/99999/chrome-linux.zip_

-   `useClosestUbuntuMirror: boolean`
    -   _Optional_
    -   _Defaults_ to `process.env.USE_CLOSEST_UBUNTU_MIRROR || process.env.npm_config_use_closest_ubuntu_mirror || process.env.npm_package_config_use_closest_ubuntu_mirror|| false`
    -   Flag for setting whether Ubuntu should use the default mirror for fetching packages, or pick the closest mirror depending on location

### dockerRunChromium

Function which is used to build and run the Docker container.

##### Example of usage

```javascript
const webSocketUri = await dockerRunChromium({
    maxAttempts: 10,
    retryInterval: 5000
});
```

##### Arguments

-   `maxAttempts: number`
    -   _Optional_
    -   _Defaults_ to 5
    -   Describes number of attempts to connect to Chromium in the launched container (sometimes it fails).
-   `retryInterval: number`
    -   _Optional_
    -   _Defaults_ to 500
    -   Describes number of milliseconds between attempts to connect to Chromium in the launched container.

##### Returns

-   `Promise<string>`
    -   Returns web socket URI to the launched Chromium in the container.
    -   By using this URI we can connect to Chromium and control it.

### dockerShutdownChromium

Function which is used to shutdown the launched Docker container.

##### Example of usage

```javascript
await dockerShutdownChromium();
```

## Contributors

-   [**gidztech**](https://github.com/gidztech)
-   [_Fiszcz_](https://github.com/Fiszcz)
-   [_luiz_](https://github.com/luiz)
