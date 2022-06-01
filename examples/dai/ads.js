/**
 * @fileoverview Description of this file.
 */

const HLS_ASSET_KEY = 'c-rArva4ShKVIAkNfy6HUQ';
const HLS_CMS_ID = '2548831';
const HLS_VIDEO_ID = 'tears-of-steel';

/**
 * Registers UI components and sets up click handlers.
 */
const Ads = function() {
  this.player = videojs('video-player');

  this.liveRadio = document.getElementById('live-radio');
  this.vodRadio = document.getElementById('vod-radio');
  this.liveSample = document.getElementById('sample-live-link');
  this.vodSample = document.getElementById('sample-vod-link');
  this.assetKeyField = document.getElementById('asset-key');
  this.liveApiField = document.getElementById('live-api-key');
  this.cmsIdField = document.getElementById('cms-id');
  this.videoIdField = document.getElementById('video-id');
  this.vodApiField = document.getElementById('vod-api-key');
  this.liveInputs = document.getElementById('live-inputs');
  this.vodInputs = document.getElementById('vod-inputs');
  this.loadButton = document.getElementById('dai-load-button');
  this.console = document.getElementById('ima-sample-console');

  this.liveRadio.checked = true;
  this.onRadioClick('live'); // Defaults page to live stream selected.

  this.liveRadio.addEventListener('click', () => {
    this.onRadioClick('live');
  });
  this.vodRadio.addEventListener('click', () => {
    this.onRadioClick('vod');
  });
  this.liveSample.addEventListener('click', () => {
    this.assetKeyField.value = HLS_ASSET_KEY;
  });
  this.vodSample.addEventListener('click', () => {
    this.cmsIdField.value = HLS_CMS_ID;
    this.videoIdField.value = HLS_VIDEO_ID;
  });
  this.loadButton.addEventListener('click', () => {
    this.initStream();
  });
};

/**
 * Handles changing the UI between live and VOD stream parameters.
 * @param {string} type of the stream, either 'live' or 'vod'.
 */
Ads.prototype.onRadioClick = function(type){
  if (type === 'live') {
    this.liveInputs.style.display = 'block';
    this.vodInputs.style.display = 'none';
  } else if (type === 'vod') {
    this.liveInputs.style.display = 'none';
    this.vodInputs.style.display = 'block';
  }
};

/**
 * Called to build a stream and call videojs-player.imaDai().
 */
Ads.prototype.initStream = function() {
  const imaOptions = {
    fallbackStreamUrl: 'http://storage.googleapis.com/testtopbox-public/video_content/bbb/master.m3u8',
  };

  let stream;
  const streamFormat = 'hls'; // Currently plugin only supports HLS streams.

  if (this.liveRadio.checked === true) {
    stream = new window.videojsIma.LiveStream(
      streamFormat,
      this.assetKeyField.value);
  } else if (this.vodRadio.checked === true) {
    stream = new window.videojsIma.VodStream(
      streamFormat,
      this.cmsIdField.value,
      this.videoIdField.value);
  } else {
    console.error('Stream type error.');
    return;
  }

  this.player.on('stream-manager', (response) => {
    this.streamManagerLoadedCallback(response.StreamManager);
  });

  this.player.imaDai(stream, imaOptions);
  this.loadButton.style.display = 'none';
};

/**
 * Registers stream event listeners once the StreamManager is ready.
 * @param {!google.ima.dai.api.StreamManager} streamManager of current stream.
 */
Ads.prototype.streamManagerLoadedCallback = function(streamManager) {
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

  for (let index = 0; index < events.length; index++) {
    streamManager.addEventListener(
      events[index],
      this.onAdEvent.bind(this));
  }
};

/**
 * Handles stream ad events.
 * @param {!google.ima.dai.api.StreamEvent} event being handled.
 */
Ads.prototype.onAdEvent = function(event) {
  this.log('Ad event: ' + event.type);
};

/**
 * Logs a message to the console.
 * @param {string} message being logged.
 */
Ads.prototype.log = function(message) {
  this.console.innerHTML = this.console.innerHTML + '<br/>' + message;
};
