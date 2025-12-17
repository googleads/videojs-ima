/**
 * Copyright 2025 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Note: the plugin only supports HLS streams currently.
const sampleStreams = {
  hls_vod: {
    streamType: 'vod',
    cmsId: '2548831',
    videoId: 'tears-of-steel',
    format: 'hls',
  },
  hls_live: {
    streamType: 'live',
    assetKey: 'c-rArva4ShKVIAkNfy6HUQ',
    format: 'hls',
  },
};

const player = videojs('video-dai');
const imaOptions = {};

/**
 * Called to build a stream and call videojs-player.imaDai().
 * @param {!Object} streamInfo The stream information object.
 */
const initStream = (streamInfo) => {
  let stream;
  switch (streamInfo.streamType) {
  case 'live':
    stream = new window.videojsIma.LiveStream(
      streamInfo.format,
      streamInfo.assetKey);
    break;
  case 'vod':
    stream = new window.videojsIma.VodStream(
      streamInfo.format,
      streamInfo.cmsId,
      streamInfo.videoId);
    break;
  default:
    console.error('Stream type error.');
    return;
  }

  player.on('stream-manager', (response) => {
    streamManagerLoadedCallback(response.StreamManager);
  });
  player.imaDai(stream, imaOptions);
};

/**
 * Registers stream event listeners once the StreamManager is ready.
 * @param {!google.ima.dai.api.StreamManager} streamManager of current stream.
 */
const streamManagerLoadedCallback = (streamManager) => {
  const events = [
    google.ima.dai.api.StreamEvent.Type.LOADED,
    google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
    google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED,
    google.ima.dai.api.StreamEvent.Type.AD_PERIOD_STARTED,
    google.ima.dai.api.StreamEvent.Type.AD_PERIOD_ENDED,
    google.ima.dai.api.StreamEvent.Type.CLICK,
    google.ima.dai.api.StreamEvent.Type.VIDEO_CLICKED,
    google.ima.dai.api.StreamEvent.Type.CUEPOINTS_CHANGED,
    google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED,
    google.ima.dai.api.StreamEvent.Type.STARTED,
    google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE,
    google.ima.dai.api.StreamEvent.Type.MIDPOINT,
    google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE,
    google.ima.dai.api.StreamEvent.Type.SKIPPED,
    google.ima.dai.api.StreamEvent.Type.COMPLETE,
    google.ima.dai.api.StreamEvent.Type.PAUSED,
    google.ima.dai.api.StreamEvent.Type.RESUMED,
  ];

  const log = document.getElementById('log');
  for (const eventName of events) {
    streamManager.addEventListener(
      eventName,
      (event) => {
        const message = event.type;
        log.innerHTML += message + "<br>";
      });
  }
};

// Initialize the ad container when the video player is clicked, but only the
// first time it's clicked.
let startEvent = 'click';
if (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i)) {
  startEvent = 'touchend';
}

player.on("adserror", (event) => {
  const log = document.getElementById('log');
  log.innerHTML += event.data.AdError + "<br>";
});

player.on("playing", (event) => {
  const log = document.getElementById('log');
  log.innerHTML += event.type + "<br>";
});

player.one(startEvent, () => {
  const searchParams = new URLSearchParams(location.search);
  const streamName = searchParams.get('ad');
  const streamInfo = sampleStreams[streamName];
  initStream(streamInfo);
});
