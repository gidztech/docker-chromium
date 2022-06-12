FROM --platform=linux/amd64 ubuntu:20.04

EXPOSE 9222

ARG USE_CLOSEST_UBUNTU_MIRROR
ARG CHROMIUM_ADDITIONAL_ARGS
ENV CHROMIUM_ADDITIONAL_ARGS=${CHROMIUM_ADDITIONAL_ARGS}

ADD entrypoint.sh /usr/bin/entrypoint.sh
ADD import_cert.sh /usr/bin/

# https://www.authentise.com/post/tidy-docker-environment
RUN if [ "$USE_CLOSEST_UBUNTU_MIRROR" = "true" ]; then \
  echo "--> Using closest Ubuntu" && \
  echo "deb mirror://mirrors.ubuntu.com/mirrors.txt focal main restricted universe multiverse" > /etc/apt/sources.list && \
  echo "deb mirror://mirrors.ubuntu.com/mirrors.txt focal-updates main restricted universe multiverse" >> /etc/apt/sources.list && \
  echo "deb mirror://mirrors.ubuntu.com/mirrors.txt focal-security main restricted universe multiverse" >> /etc/apt/sources.list; \
  else \
  echo "--> Using default Ubuntu mirror"; \
  fi

RUN DEBIAN_FRONTEND="noninteractive" apt-get -qqy update && DEBIAN_FRONTEND="noninteractive" apt-get -qqy install libnss3 libnss3-tools libxss1 libfontconfig1 wget ca-certificates apt-transport-https inotify-tools unzip \
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
