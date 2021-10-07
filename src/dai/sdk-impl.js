/**
 * Copyright 2021 Google Inc.
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
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

 /**
  * Implementation of the IMA DAI SDK for the plugin.
  *
  * @param {DaiController} controller Reference to the parent DAI controller.
  *
  * @constructor
  * @struct
  * @final
  */
const SdkImpl = function(controller) {
  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * The videoJS stream player.
   */
   this.streamPlayer = null;

  /**
   * IMA SDK StreamManager
   */
  this.streamManager = null;

  /**
   * IMA stream UI settings.
   */
  /* eslint no-undef: 'error' */
  /* global google */
  this.uiSettings = new google.ima.dai.api.UiSettings();

  /**
   * If the stream is currently in an ad break.
   */
  this.isAdBreak = false
};


/**
 * Creates and initializes the IMA DAI SDK objects.
 */
SdkImpl.prototype.initDai = function() {
  this.streamPlayer = this.controller.getStreamPlayer();
  this.createAdUiDiv();
  if (this.controller.getSettings().locale) {
    this.uiSettings.setLocale(this.controller.getSettings().locale);
  }

  this.streamManager = new google.ima.dai.api.StreamManager(
    this.streamPlayer,
    this.adUiDiv,
    this.uiSettings);

  this.streamPlayer.addEventListener('pause', this.onStreamPause);
  this.streamPlayer.addEventListener('play', this.onStreamPlay);

  this.streamManager.addEventListener(
    [
      google.ima.dai.api.StreamEvent.Type.LOADED,
      google.ima.dai.api.StreamEvent.Type.ERROR,
      google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
      google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED
    ],
    this.onStreamEvent,
    false);

  // Timed metadata is only used for LIVE streams.
  this.streamPlayer.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
    if (this.streamManager && data) {
      // For each ID3 tag in the metadata, pass in the type - ID3, the
      // tag data (a byte array), and the presentation timestamp (PTS).
      data.samples.forEach(function(sample) {
        this.streamManager.processMetadata('ID3', sample.data, sample.pts);
      });
    }
  });

  this.requestStream();
};

/**
 * Creates the ad UI container.
 */
 SdkImpl.prototype.createAdUiDiv = function() {
  const uiDiv = document.createElement('div');
  uiDiv.id = 'ad-ui';
  this.streamPlayer.parentNode.appendChild(uiDiv);
  this.adUiDiv = uiDiv;
};

/**
 * Called on pause to update the ad UI.
 */
SdkImpl.prototype.onStreamPause = function() {
  if (this.isAdBreak) {
    this.streamPlayer.controls = true;
    this.adUiDiv.style.display = 'none';
  }
};

/**
 * Called on play to update the ad UI.
 */
 SdkImpl.prototype.onStreamPlay = function() {
  if (this.isAdBreak) {
    this.streamPlayer.controls = false;
    this.adUiDiv.style.display = 'block';
  }
};

/**
 * Handles IMA events.
 * @param {google.ima.StreamEvent} event the IMA event
 */
 SdkImpl.prototype.onStreamEvent = function(event) {
  switch (event.type) {
    case google.ima.dai.api.StreamEvent.Type.LOADED:
      this.loadUrl(event.getStreamData().url);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      const errorMessage = event.getStreamData().errorMessage;
      window.console.warn('Error loading stream, attempting to play backup stream. '
        + errorMessage);
      const fallbackUrl = this.controller.getSettings().fallbackStreamUrl;
      if (fallbackUrl) {
        this.loadurl(fallbackUrl);
      }
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      this.isAdBreak = true;
      this.streamPlayer.controls = false;
      this.adUiDiv.style.display = 'block';
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      this.isAdBreak = false;
      this.streamPlayer.controls = true;
      this.adUiDiv.style.display = 'none';
      break;
    default:
      break;
  }
};

/**
 * Creates the AdsRequest and request ads through the AdsLoader.
 */
SdkImpl.prototype.requestStream = function() {
  let streamRequest;
  const streamType = this.controller.getSettings().streamType;
  if (streamType === 'vod') {
    streamRequest = new google.ima.dai.api.VODStreamRequest();
    streamRequest.contentSourceId = this.controller.getSettings().cmsId;
    streamRequest.videoId = this.controller.getSettings().videoId;
  } else if (streamType === 'live') {
    streamRequest = new google.ima.dai.api.LiveStreamRequest();
    streamRequest.assetKey = this.controller.getSettings().assetKey;
  } else {
    window.console.warn('No valid stream type selected');
  }
  streamRequest.format = this.controller.getSettings().streamFormat;

  if (this.controller.getSettings().apiKey) {
    streamRequest.apiKey = this.controller.getSettings().apiKey;
  }
  if (this.controller.getSettings().authKey) {
    streamRequest.authKey = this.controller.getSettings().authKey;
  }
  if (this.controller.getSettings().adTagParameters) {
    streamRequest.adTagParameters = this.controller.getSettings().adTagParameters;
  }
  if (this.controller.getSettings().streamActivityMonitorId) {
    streamRequest.streamActivityMonitorId =
      this.controller.getSettings().streamActivityMonitorId;
  }

  if (this.controller.getSettings().omidMode) {
    streamRequest.omidAccessModeRules = {};
    const omidValues = this.controller.getSettings().omidMode;

    if (omidValues.FULL) {
      streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.FULL] =
        omidValues.FULL;
    }
    if (omidValues.DOMAIN) {
      streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.DOMAIN] =
        omidValues.DOMAIN;
    }
    if (omidValues.LIMITED) {
      streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.LIMITED] =
        omidValues.LIMITED;
    }
  }

  this.streamManager.requestStream(streamRequest);
  this.controller.playerWrapper.vjsPlayer.trigger({
    type: 'stream-request',
    StreamRequest: streamRequest,
  });
};

/**
 * Handles ad log messages.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAdLog = function(adEvent) {
  this.controller.onAdLog(adEvent);
};


/**
 * Called when the player is disposed.
 */
SdkImpl.prototype.onPlayerDisposed = function() {
  if (this.streamManager) {
    this.streamManager.reset();
  }
};

/**
 * Returns the instance of the StreamManager.
 * @return {google.ima.StreamManager} The StreamManager being used by the plugin.
 */
SdkImpl.prototype.getStreamManager = function() {
  return this.StreamManager;
};


/**
 * Reset the SDK implementation.
 */
SdkImpl.prototype.reset = function() {
  if (this.StreamManager) {
    this.StreamManager.reset();
  }
};

export default SdkImpl;
