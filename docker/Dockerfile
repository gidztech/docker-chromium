FROM ubuntu:18.04

EXPOSE 9222

ARG CHROMIUM_ADDITIONAL_ARGS
ENV CHROMIUM_ADDITIONAL_ARGS=${CHROMIUM_ADDITIONAL_ARGS}

ADD entrypoint.sh /usr/bin/entrypoint.sh
ADD import_cert.sh /usr/bin/

RUN apt-get update -qqy \
  && apt-get -qqy install libnss3 libnss3-tools libfontconfig1 wget ca-certificates apt-transport-https inotify-tools unzip \
  libpangocairo-1.0-0 libx11-xcb-dev libxcomposite-dev libxcursor1 libxdamage1 libxi6 libgconf-2-4 libxtst6 libcups2-dev \
  libxss-dev libxrandr-dev libasound2-dev libatk1.0-dev libgtk-3-dev ttf-ancient-fonts chromium-codecs-ffmpeg-extra libappindicator3-1 \
  iputils-ping iproute2 curl dumb-init \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* && chmod +x /usr/bin/entrypoint.sh
  
ARG CHROMIUM_REVISION
ARG CHROMIUM_DOWNLOAD_HOST
RUN wget --no-check-certificate -q -O chrome.zip $CHROMIUM_DOWNLOAD_HOST/chromium-browser-snapshots/Linux_x64/$CHROMIUM_REVISION/chrome-linux.zip \
  && unzip chrome.zip \
  && rm chrome.zip \
  && ln -s $PWD/chrome-linux/chrome /usr/bin/google-chrome-unstable

RUN google-chrome-unstable --version

RUN mkdir /data
VOLUME /data
ENV HOME=/data DEBUG_ADDRESS=0.0.0.0 DEBUG_PORT=9222

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/usr/bin/entrypoint.sh"]
