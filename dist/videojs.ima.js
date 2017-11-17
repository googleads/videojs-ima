/**
 * Copyright 2017 Google Inc.
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
 * Header JavaScript for the final distribution.
 */
(function(factory) {
  if (typeof define === 'function' && define['amd']) {
    define(['video.js', 'videojs-contrib-ads'],
        function(videojs){ factory(window, document, videojs) });
  } else if (typeof exports === 'object' && typeof module === 'object') {
    var vjs = require('video.js');
    require('videojs-contrib-ads');
    factory(window, document, vjs);
  } else {
    factory(window, document, videojs);
  }
})(function(window, document, videojs) {
  "use strict";

  // support es6 style import
  videojs = videojs.default || videojs;

  var init = function(options) {
    this.ima = new ImaPlugin(this, options);
  };

/**
 * Copyright 2017 Google Inc.
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
  * Implementation of the IMA SDK for the plugin.
  *
  * @constructor
  * @struct
  * @final
  */
var SdkImpl = function(controller) {
  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * IMA SDK AdDisplayContainer.
   */
  this.adDisplayContainer;

  /**
   * True if the AdDisplayContainer has been initialized. False otherwise.
   */
  this.adDisplayContainerInitialized = false;

  /**
   * IMA SDK AdsLoader
   */
  this.adsLoader;

  /**
   * IMA SDK AdsManager
   */
  this.adsManager;

  /**
   * IMA SDK AdsRenderingSettings.
   */
  this.adsRenderingSettings = null;

  /**
   * Ad tag URL. Should return VAST, VMAP, or ad rules.
   */
  this.adTagUrl;

  /**
   * VAST, VMAP, or ad rules response. Used in lieu of fetching a response
   * from an ad tag URL.
   */
  this.adsResponse;

  /**
   * Current IMA SDK Ad.
   */
  this.currentAd;

  /**
   * Timer used to track ad progress.
   */
  this.adTrackingTimer;

  /**
   * True if ALL_ADS_COMPLETED has fired, false until then.
   */
  this.allAdsCompleted = false;

  /**
   * True if ads are currently displayed, false otherwise.
   * True regardless of ad pause state if an ad is currently being displayed.
   */
  this.adsActive = false;

  /**
   * True if ad is currently playing, false if ad is paused or ads are not
   * currently displayed.
   */
  this.adPlaying = false;

  /**
   * True if the ad is muted, false otherwise.
   */
  this.adMuted = false;

  /**
   * Listener to be called to trigger manual ad break playback.
   */
  this.adBreakReadyListener = undefined;

  /**
   * Tracks whether or not we have already called adsLoader.contentComplete().
   */
  this.contentCompleteCalled = false;

  /**
   * Stores the dimensions for the ads manager.
   */
  this.adsManagerDimensions = {
    width: 0,
    height: 0
  };

  /**
   * Boolean flag to enable manual ad break playback.
   */
  this.autoPlayAdBreaks = true;
  if (this.controller.getSettings()['autoPlayAdBreaks'] === false) {
    this.autoPlayAdBreaks = false;
  }

  // Set SDK settings from plugin settings.
  if (this.controller.getSettings()['locale']) {
    google.ima.settings.setLocale(this.controller.getSettings()['locale']);
  }
  if (this.controller.getSettings()['disableFlashAds']) {
    google.ima.settings.setDisableFlashAds(
        this.controller.getSettings()['disableFlashAds']);
  }
  if (this.controller.getSettings()['disableCustomPlaybackForIOS10Plus']) {
    google.ima.settings.setDisableCustomPlaybackForIOS10Plus(
        this.controller.getSettings()['disableCustomPlaybackForIOS10Plus']);
  }

  this.initAdObjects();

  if (this.controller.getSettings()['adTagUrl'] ||
      this.controller.getSettings()['adsResponse']) {
    this.requestAds();
  }
};


/**
 * Creates and initializes the IMA SDK objects.
 */
SdkImpl.prototype.initAdObjects = function() {
  this.adDisplayContainer = new google.ima.AdDisplayContainer(
      this.controller.getAdContainerDiv(),
      this.controller.getContentPlayer());

  this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

  this.adsLoader.getSettings().setVpaidMode(
      google.ima.ImaSdkSettings.VpaidMode.ENABLED);
  if (this.controller.getSettings()['vpaidAllowed'] == false) {
    this.adsLoader.getSettings().setVpaidMode(
        google.ima.ImaSdkSettings.VpaidMode.DISABLED);
  }
  if (this.controller.getSettings()['vpaidMode']) {
    this.adsLoader.getSettings().setVpaidMode(
        this.controller.getSettings()['vpaidMode']);
  }

  if (this.controller.getSettings()['locale']) {
    this.adsLoader.getSettings().setLocale(
        this.controller.getSettings['locale']);
  }

  if (this.controller.getSettings()['numRedirects']) {
    this.adsLoader.getSettings().setNumRedirects(
        this.controller.getSettings['numRedirects']);
  }

  this.adsLoader.getSettings().setPlayerType('videojs-ima');
  this.adsLoader.getSettings().setPlayerVersion(ImaPlugin.VERSION);
  this.adsLoader.getSettings().setAutoPlayAdBreaks(this.autoPlayAdBreaks);

  this.adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    this.onAdsManagerLoaded_.bind(this),
    false);
  this.adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    this.onAdsLoaderError_.bind(this),
    false);
};

/**
 * Creates the AdsRequest and request ads through the AdsLoader.
 */
SdkImpl.prototype.requestAds = function() {
  var adsRequest = new google.ima.AdsRequest();
  if (this.controller.getSettings()['adTagUrl']) {
    adsRequest.adTagUrl = this.controller.getSettings()['adTagUrl'];
  } else {
    adsRequest.adsResponse = this.controller.getSettings()['adsResponse'];
  }
  if (this.controller.getSettings()['forceNonLinearFullSlot']) {
    adsRequest.forceNonLinearFullSlot = true;
  }

  adsRequest.linearAdSlotWidth = this.controller.getPlayerWidth();
  adsRequest.linearAdSlotHeight = this.controller.getPlayerHeight();
  adsRequest.nonLinearAdSlotWidth =
      this.controller.getSettings()['nonLinearWidth'] ||
      this.controller.getPlayerWidth();
  adsRequest.nonLinearAdSlotHeight =
      this.controller.getSettings()['nonLinearHeight'] ||
      (this.controller.getPlayerHeight() / 3);

  adsRequest.setAdWillAutoPlay(this.controller.getSettings()['adWillAutoPlay']);

  this.adsLoader.requestAds(adsRequest);
};


/**
 * Listener for the ADS_MANAGER_LOADED event. Creates the AdsManager,
 * sets up event listeners, and triggers the 'adsready' event for
 * videojs-ads-contrib.
 * @private
 */
SdkImpl.prototype.onAdsManagerLoaded_ = function(adsManagerLoadedEvent) {
  this.createAdsRenderingSettings_();

  this.adsManager = adsManagerLoadedEvent.getAdsManager(
      this.controller.getContentPlayheadTracker(), this.adsRenderingSettings);

  this.adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.AD_BREAK_READY,
      this.onAdBreakReady_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      this.onContentPauseRequested_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      this.onContentResumeRequested_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      this.onAllAdsCompleted_.bind(this));

  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      this.onAdLoaded_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      this.onAdStarted_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.CLICK,
      this.onAdPaused_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      this.onAdComplete_.bind(this));
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.SKIPPED,
      this.onAdComplete_.bind(this));

  if (this.isMobile) {
    // Show/hide controls on pause and resume (triggered by tap).
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.PAUSED,
        this.onAdPaused_.bind(this));
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.RESUMED,
        this.onAdResumed_.bind(this));
  }

  if (!this.autoPlayAdBreaks) {
    this.initAdsManager();
  }

  this.controller.onAdsReady();

  if (this.controller.getSettings()['adsManagerLoadedCallback']) {
    this.controller.getSettings()['adsManagerLoadedCallback']();
  }
};


/**
 * Listener for errors fired by the AdsLoader.
 * @param {google.ima.AdErrorEvent} event The error event thrown by the
 *     AdsLoader. See
 *     https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdError.Type
 * @private
 */
SdkImpl.prototype.onAdsLoaderError_ = function(event) {
  window.console.warn('AdsLoader error: ' + event.getError());
  this.controller.onErrorLoadingAds(event);
  if (this.adsManager) {
    this.adsManager.destroy();
  }
};


/**
 * Initialize the ads manager.
 */
SdkImpl.prototype.initAdsManager = function() {
  try {
    var initWidth = this.controller.getPlayerWidth();
    var initHeight = this.controller.getPlayerHeight();
    this.adsManagerDimensions.width = initWidth;
    this.adsManagerDimensions.height = initHeight;
    this.adsManager.init(
        initWidth,
        initHeight,
        google.ima.ViewMode.NORMAL);
    this.adsManager.setVolume(this.controller.getPlayerVolume());
    if (!this.adDisplayContainerInitialized) {
      this.adDisplayContainer.initialize();
      this.adDisplayContainer.initialized = true;
    }
  } catch (adError) {
    this.onAdError_(adError);
  }
}


/**
 * Create AdsRenderingSettings for the IMA SDK.
 * @private
 */
SdkImpl.prototype.createAdsRenderingSettings_ = function() {
  this.adsRenderingSettings = new google.ima.AdsRenderingSettings();
  this.adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete =
      true;
  if (this.controller.getSettings()['adsRenderingSettings']) {
    for (var setting in this.controller.getSettings()['adsRenderingSettings']) {
      this.adsRenderingSettings[setting] =
          this.controller.getSettings()['adsRenderingSettings'][setting];
    }
  }
};

/**
 * Listener for errors thrown by the AdsManager.
 * @param {google.ima.AdErrorEvent} adErrorEvent The error event thrown by
 *     the AdsManager.
 * @private
 */
SdkImpl.prototype.onAdError_ = function(adErrorEvent) {
  var errorMessage =
      adErrorEvent.getError !== undefined ?
          adErrorEvent.getError() : adErrorEvent.stack;
  window.console.warn('Ad error: ' + errorMessage);
  this.adsManager.destroy();
  this.controller.onAdError(adErrorEvent);
};


/**
 * Listener for AD_BREAK_READY. Passes event on to publisher's listener.
 * @param {google.ima.AdEvent} adEvent AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onAdBreakReady_ = function(adEvent) {
  this.adBreakReadyListener(adEvent);
};


/**
 * Pauses the content video and displays the ad container so ads can play.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onContentPauseRequested_ = function(adEvent) {
  this.adsActive = true;
  this.adPlaying = true;
  this.controller.onAdBreakStart(adEvent);
};


/**
 * Resumes content video and hides the ad container.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onContentResumeRequested_ = function(adEvent) {
  this.adsActive = false;
  this.adPlaying = false;
  this.controller.onAdBreakEnd();
  // Hide controls in case of future non-linear ads. They'll be unhidden in
  // content_pause_requested.
};


/**
 * Records that ads have completed and calls contentAndAdsEndedListeners
 * if content is also complete.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onAllAdsCompleted_ = function(adEvent) {
  this.allAdsCompleted = true;
  this.controller.onAllAdsCompleted();
}

/**
 * Starts the content video when a non-linear ad is loaded.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onAdLoaded_ = function(adEvent) {
  if (!adEvent.getAd().isLinear()) {
    this.controller.playContent();
  }
};

/**
 * Starts the interval timer to check the current ad time when an ad starts
 * playing.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onAdStarted_ = function(adEvent) {
  this.currentAd = adEvent.getAd();
  if (this.currentAd.isLinear()) {
    this.adTrackingTimer = setInterval(
        this.onAdPlayheadTrackerInterval_.bind(this), 250);
    this.controller.onLinearAdStart();
  } else {
    this.controller.onNonLinearAdStart();
  }
};


/**
 * Handles an ad click. Puts the player UI in a paused state.
 */
SdkImpl.prototype.onAdPaused_ = function() {
  this.controller.onAdsPaused();
};


/**
 * Syncs controls when an ad resumes.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
SdkImpl.prototype.onAdResumed_ = function(adEvent) {
  this.controller.onAdsResumed();
};

/**
 * Clears the interval timer for current ad time when an ad completes.
 * @private
 */
SdkImpl.prototype.onAdComplete_ = function() {
  if (this.currentAd.isLinear()) {
    clearInterval(this.adTrackingTimer);
  }
};

/**
 * Gets the current time and duration of the ad and calls the method to
 * update the ad UI.
 * @private
 */
SdkImpl.prototype.onAdPlayheadTrackerInterval_ = function() {
  var remainingTime = this.adsManager.getRemainingTime();
  var duration =  this.currentAd.getDuration();
  var currentTime = duration - remainingTime;
  currentTime = currentTime > 0 ? currentTime : 0;
  var isPod = false;
  var totalAds = 0;
  var adPosition;
  if (this.currentAd.getAdPodInfo()) {
    isPod = true;
    adPosition = this.currentAd.getAdPodInfo().getAdPosition();
    totalAds = this.currentAd.getAdPodInfo().getTotalAds();
  }

  this.controller.onAdPlayheadUpdated(
      currentTime, duration, adPosition, totalAds);
};


/**
 * Called by the player wrapper when content completes.
 */
SdkImpl.prototype.onContentComplete = function() {
  if (this.adsLoader) {
    this.adsLoader.contentComplete();
    this.contentCompleteCalled = true;
  }

  if (this.allAdsCompleted) {
    this.controller.onContentAndAdsCompleted();
  }
};


/**
 * Called when the player is disposed.
 */
SdkImpl.prototype.onPlayerDisposed = function() {
  if (this.adTrackingTimer) {
    clearInterval(this.adTrackingTimer);
  }
  if (this.adsManager) {
    this.adsManager.destroy();
    this.adsManager = null;
  }
};


SdkImpl.prototype.onPlayerReadyForPreroll = function() {
  if (this.autoPlayAdBreaks) {
    this.initAdsManager();
    try {
      this.adsManager.start();
    } catch (adError) {
      this.onAdError_(adError);
    }
  }
};


SdkImpl.prototype.onPlayerEnterFullscreen = function() {
  if (this.adsManager) {
    this.adsManager.resize(
        window.screen.width,
        window.screen.height,
        google.ima.ViewMode.FULLSCREEN);
  }
};


SdkImpl.prototype.onPlayerExitFullscreen = function() {
  if (this.adsManager) {
    this.adsManager.resize(
        this.controller.getPlayerWidth(),
        this.controller.getPlayerHeight(),
        google.ima.ViewMode.NORMAL);
  }
};


/**
 * Called when the player volume changes.
 *
 * @param {number} volume The new player volume.
 */
SdkImpl.prototype.onPlayerVolumeChanged = function(volume) {
  if (this.adsManager) {
    this.adsManager.setVolume(volume);
  }

  if (volume == 0) {
    this.adMuted = true;
  } else {
    this.adMuted = false;
  }
};


/**
 * @return {Object} The current ad.
 */
SdkImpl.prototype.getCurrentAd = function() {
  return this.currentAd;
};


/**
 * Sets the listener to be called to trigger manual ad break playback.
 * @param {function} listener The listener to be called to trigger manual ad
 *     break playback.
 */
SdkImpl.prototype.setAdBreakReadyListener = function(listener) {
  this.adBreakReadyListener = listener;
};


/**
 * @return {boolean} True if an ad is currently playing. False otherwise.
 */
SdkImpl.prototype.isAdPlaying = function() {
  return this.adPlaying;
};


/**
 * @return {boolean} True if an ad is currently playing. False otherwise.
 */
SdkImpl.prototype.isAdMuted = function() {
  return this.adMuted;
};


/**
 * Pause ads.
 */
SdkImpl.prototype.pauseAds = function() {
  this.adsManager.pause();
  this.adPlaying = false;
};


/**
 * Resume ads.
 */
SdkImpl.prototype.resumeAds = function() {
  this.adsManager.resume();
  this.adPlaying = true;
};


/**
 * Unmute ads.
 */
SdkImpl.prototype.unmute = function() {
  this.adsManager.setVolume(1);
  this.adMuted = false;
};


/**
 * Mute ads.
 */
SdkImpl.prototype.mute = function() {
  this.adsManager.setVolume(0);
  this.adMuted = true;
};


/**
 * Set the volume of the ads. 0-1.
 *
 * @param {number} volume The new volume.
 */
SdkImpl.prototype.setVolume = function(volume) {
  this.adsManager.setVolume(volume);
  if (volume == 0) {
    this.adMuted = true;
  } else {
    this.adMuted = false;
  }
};


/**
 * Initializes the AdDisplayContainer. On mobile, this must be done as a
 * result of user action.
 */
SdkImpl.prototype.initializeAdDisplayContainer = function() {
  this.adDisplayContainerInitialized = true;
  this.adDisplayContainer.initialize();
};

/**
 * Called by publishers in manual ad break playback mode to start an ad
 * break.
 */
SdkImpl.prototype.playAdBreak = function() {
  if (!this.autoPlayAdBreaks) {
    this.adsManager.start();
  }
};


/**
 * Ads an EventListener to the AdsManager. For a list of available events,
 * see
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type
 * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
 *     listen.
 * @param {function} callback The method to call when the event is fired.
 */
SdkImpl.prototype.addEventListener = function(event, callback) {
  if (this.adsManager) {
    this.adsManager.addEventListener(event, callback);
  }
};


/**
 * Returns the instance of the AdsManager.
 * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
 */
SdkImpl.prototype.getAdsManager = function() {
  return this.adsManager;
};


/**
 * Reset the SDK implementation.
 */
SdkImpl.prototype.reset = function() {
  this.adsActive = false;
  this.adPlaying = false;
  if (this.adTrackingTimer) {
    // If this is called while an ad is playing, stop trying to get that
    // ad's current time.
    clearInterval(this.adTrackingTimer);
  }
  if (this.adsManager) {
    this.adsManager.destroy();
    this.adsManager = null;
  }
  if (this.adsLoader && !this.contentCompleteCalled) {
    this.adsLoader.contentComplete();
  }
  this.contentCompleteCalled = false;
  this.allAdsCompleted = false;
};
/**
 * Copyright 2017 Google Inc.
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
 * Ad UI implementation.
 *
 * @param {Controller} controller Plugin controller.
 * @constructor
 * @struct
 * @final
 */
var AdUi = function(controller) {
  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * Div used as an ad container.
   */
  this.adContainerDiv;

  /**
   * Div used to display ad controls.
   */
  this.controlsDiv;

  /**
   * Div used to display ad countdown timer.
   */
  this.countdownDiv;

  /**
   * Div used to display add seek bar.
   */
  this.seekBarDiv;

  /**
   * Div used to display ad progress (in seek bar).
   */
  this.progressDiv;

  /**
   * Div used to display ad play/pause button.
   */
  this.playPauseDiv;

  /**
   * Div used to display ad mute button.
   */
  this.muteDiv;

  /**
   * Div used by the volume slider.
   */
  this.sliderDiv;

  /**
   * Volume slider level visuals
   */
  this.sliderLevelDiv;

  /**
   * Div used to display ad fullscreen button.
   */
  this.fullscreenDiv;

  /**
   * Bound event handler for onMouseUp.
   */
  this.boundOnMouseUp = this.onMouseUp_.bind(this);

  /**
   * Bound event handler for onMouseMove.
   */
  this.boundOnMouseUp = this.onMouseMove_.bind(this);

  /**
   * Stores data for the ad playhead tracker.
   */
  this.adPlayheadTracker = {
    currentTime: 0,
    duration: 0,
    isPod: false,
    adPosition: 0,
    totalAds: 0
  };

  /**
   * Used to prefix videojs ima controls.
   */
  this.controlPrefix = (this.controller.getSettings().id + '_') || '';

  /**
   * Boolean flag to show or hide the ad countdown timer.
   */
  this.showCountdown = true;
  if (this.controller.getSettings()['showCountdown'] == false) {
    this.showCountdown = false;
  }

  this.createAdContainer_();
};

/**
 * Creates the ad container.
 * @private
 */
AdUi.prototype.createAdContainer_ = function() {
  this.adContainerDiv = document.createElement('div');
  this.assignControlAttributes_(
      this.adContainerDiv, 'ima-ad-container');
  this.adContainerDiv.style.position = "absolute";
  this.adContainerDiv.style.zIndex = 1111;
  this.adContainerDiv.addEventListener(
      'mouseenter',
      this.showAdControls_.bind(this),
      false);
  this.adContainerDiv.addEventListener(
      'mouseleave',
      this.hideAdControls_.bind(this),
      false);
  this.createControls_();
  this.controller.injectAdContainerDiv(this.adContainerDiv);
};


/**
 * Create the controls.
 * @private
 */
AdUi.prototype.createControls_ = function() {
  this.controlsDiv = document.createElement('div');
  this.assignControlAttributes_(this.controlsDiv, 'ima-controls-div');
  this.controlsDiv.style.width = '100%';

  this.countdownDiv = document.createElement('div');
  this.assignControlAttributes_(this.countdownDiv, 'ima-countdown-div');
  this.countdownDiv.innerHTML = this.controller.getSettings()['adLabel'];
  this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';

  this.seekBarDiv = document.createElement('div');
  this.assignControlAttributes_(this.seekBarDiv, 'ima-seek-bar-div');
  this.seekBarDiv.style.width = '100%';

  this.progressDiv = document.createElement('div');
  this.assignControlAttributes_(this.progressDiv, 'ima-progress-div');

  this.playPauseDiv = document.createElement('div');
  this.assignControlAttributes_(this.playPauseDiv, 'ima-play-pause-div');
  this.addClass_(this.playPauseDiv, 'ima-playing');
  this.playPauseDiv.addEventListener(
      'click',
      this.onAdPlayPauseClick_.bind(this),
      false);

  this.muteDiv = document.createElement('div');
  this.assignControlAttributes_(this.muteDiv, 'ima-mute-div');
  this.addClass_(this.muteDiv, 'ima-non-muted');
  this.muteDiv.addEventListener(
      'click',
      this.onAdMuteClick_.bind(this),
      false);

  this.sliderDiv = document.createElement('div');
  this.assignControlAttributes_(this.sliderDiv, 'ima-slider-div');
  this.sliderDiv.addEventListener(
      'mousedown',
      this.onAdVolumeSliderMouseDown_.bind(this),
      false);

  this.sliderLevelDiv = document.createElement('div');
  this.assignControlAttributes_(this.sliderLevelDiv, 'ima-slider-level-div');

  this.fullscreenDiv = document.createElement('div');
  this.assignControlAttributes_(this.fullscreenDiv, 'ima-fullscreen-div');
  this.addClass_(this.fullscreenDiv, 'ima-non-fullscreen');
  this.fullscreenDiv.addEventListener(
      'click',
      this.onAdFullscreenClick_.bind(this),
      false);

  this.adContainerDiv.appendChild(this.controlsDiv);
  this.controlsDiv.appendChild(this.countdownDiv);
  this.controlsDiv.appendChild(this.seekBarDiv);
  this.controlsDiv.appendChild(this.playPauseDiv);
  this.controlsDiv.appendChild(this.muteDiv);
  this.controlsDiv.appendChild(this.sliderDiv);
  this.controlsDiv.appendChild(this.fullscreenDiv);
  this.seekBarDiv.appendChild(this.progressDiv);
  this.sliderDiv.appendChild(this.sliderLevelDiv);
};


/**
 * Listener for clicks on the play/pause button during ad playback.
 * @private
 */
AdUi.prototype.onAdPlayPauseClick_ = function() {
  this.controller.onAdPlayPauseClick();
};


/**
 * Listener for clicks on the play/pause button during ad playback.
 * @private
 */
AdUi.prototype.onAdMuteClick_ = function() {
  this.controller.onAdMuteClick();
};


/**
 * Listener for clicks on the fullscreen button during ad playback.
 * @private
 */
AdUi.prototype.onAdFullscreenClick_ = function() {
  this.controller.toggleFullscreen();
};


/**
 * Show pause and hide play button
 */
AdUi.prototype.onAdsPaused = function() {
  this.addClass_(this.playPauseDiv, 'ima-paused');
  this.removeClass_(this.playPauseDiv, 'ima-playing');
  this.showAdControls_();
};


/**
 * Show pause and hide play button
 */
AdUi.prototype.onAdsResumed = function() {
  this.onAdsPlaying();
  this.showAdControls_();
};


/**
 * Show play and hide pause button
 */
AdUi.prototype.onAdsPlaying = function() {
  this.addClass_(this.playPauseDiv, 'ima-playing');
  this.removeClass_(this.playPauseDiv, 'ima-paused');
};


/**
 * Takes data from the controller to update the UI.
 *
 * @param {number} currentTime Current time of the ad.
 * @param {number} duration Duration of the ad.
 * @param {number} adPosition Index of the ad in the pod.
 * @param {number} totalAds Total number of ads in the pod.
 */
AdUi.prototype.updateAdUi =
    function(currentTime, duration, adPosition, totalAds) {
  var remainingTime = duration - currentTime;
  // Update countdown timer data
  var remainingMinutes = Math.floor(remainingTime / 60);
  var remainingSeconds = Math.floor(remainingTime % 60);
  if (remainingSeconds.toString().length < 2) {
    remainingSeconds = '0' + remainingSeconds;
  }
  var podCount = ': ';
  if (totalAds > 1) {
    podCount = ' (' + adPosition + ' of ' + totalAds + '): ';
  }
  this.countdownDiv.innerHTML =
      this.controller.getSettings()['adLabel'] + podCount +
      remainingMinutes + ':' + remainingSeconds;

  // Update UI
  var playProgressRatio = currentTime / duration;
  var playProgressPercent = playProgressRatio * 100;
  this.progressDiv.style.width = playProgressPercent + '%';
}

/**
 * Handles UI changes when the ad is unmuted.
 */
AdUi.prototype.unmute = function() {
  this.addClass_(this.muteDiv, 'ima-non-muted');
  this.removeClass_(this.muteDiv, 'ima-muted');
  this.sliderLevelDiv.style.width =
      this.controller.getPlayerVolume() * 100 + "%";
};


/**
 * Handles UI changes when the ad is muted.
 */
AdUi.prototype.mute = function() {
  this.addClass_(this.muteDiv, 'ima-muted');
  this.removeClass_(this.muteDiv, 'ima-non-muted');
  this.sliderLevelDiv.style.width = '0%';
};




/* Listener for mouse down events during ad playback. Used for volume.
 * @private
 */
AdUi.prototype.onAdVolumeSliderMouseDown_ = function() {
   document.addEventListener('mouseup', this.boundOnMouseUp, false);
   document.addEventListener('mousemove', this.boundOnMouseMove, false);
};


/* Mouse movement listener used for volume slider.
 * @private
 */
AdUi.prototype.onMouseMove_ = function(event) {
  this.changeVolume_(event);
};


/* Mouse release listener used for volume slider.
 * @private
 */
AdUi.prototype.onMouseUp_ = function(event) {
  this.changeVolume_(event);
  document.removeEventListener('mouseup', this.boundOnMouseUp);
  document.removeEventListener('mousemove', this.boundOnMouseMove);
};


/* Utility function to set volume and associated UI
 * @private
 */
AdUi.prototype.changeVolume_ = function(event) {
  var percent =
      (event.clientX - this.sliderDiv.getBoundingClientRect().left) /
          this.sliderDiv.offsetWidth;
  percent *= 100;
  //Bounds value 0-100 if mouse is outside slider region.
  percent = Math.min(Math.max(percent, 0), 100);
  this.sliderLevelDiv.style.width = percent + "%";
  if (this.percent == 0) {
    this.addClass_(this.muteDiv, 'ima-muted');
    this.removeClass_(this.muteDiv, 'ima-non-muted');
  }
  else
  {
    this.addClass_(this.muteDiv, 'ima-non-muted');
    this.removeClass_(this.muteDiv, 'ima-muted');
  }
  this.controller.setVolume(percent / 100); //0-1
}


/**
 * Handles ad errors.
 */
AdUi.prototype.onAdError = function() {
  this.adContainerDiv.style.display = 'none';
};


/**
 * Handles ad break starting.
 *
 * @param {Object} adEvent The event fired by the IMA SDK.
 */
AdUi.prototype.onAdBreakStart = function(adEvent) {
  this.adContainerDiv.style.display = 'block';

  var contentType = adEvent.getAd().getContentType();
  if ((contentType === 'application/javascript') &&
      !this.controller.getSettings()['showControlsForJSAds']) {
    this.controlsDiv.style.display = 'none';
  } else {
    this.controlsDiv.style.display = 'block';
  }
  this.onAdsPlaying();
  // Start with the ad controls minimized.
  this.hideAdControls_();
};


/**
 * Handles ad break ending.
 */
AdUi.prototype.onAdBreakEnd = function() {
  var currentAd = this.controller.getCurrentAd();
  if (currentAd == null || // hide for post-roll only playlist
      currentAd.isLinear()) { // don't hide for non-linear ads
    this.adContainerDiv.style.display = 'none';
  }
  this.controlsDiv.style.display = 'none';
  this.countdownDiv.innerHTML = '';
}


/**
 * Handles when all ads have finished playing.
 */
AdUi.prototype.onAllAdsCompleted = function() {
  this.adContainerDiv.style.display = 'none';
};


/**
 * Handles when a linear ad starts.
 */
AdUi.prototype.onLinearAdStart = function() {
  // Don't bump container when controls are shown
  this.removeClass_(this.adContainerDiv, 'bumpable-ima-ad-container');
};


/**
 * Handles when a non-linear ad starts.
 */
AdUi.prototype.onNonLinearAdStart = function() {
  // For non-linear ads that show after a linear ad. For linear ads, we show the
  // ad container in onAdBreakStart to prevent blinking in pods.
  this.adContainerDiv.style.display = 'block';
  // Bump container when controls are shown
 addClass_(this.adContainerDiv, 'bumpable-ima-ad-container');
};


/**
 * Called when the player wrapper detects that the player has been resized.
 *
 * @param {number} width The post-resize width of the player.
 * @param {number} height The post-resize height of the player.
 */
AdUi.prototype.onPlayerResize = function(width, height) {
  if (this.adsManager) {
    this.adsManagerDimensions.width = width;
    this.adsManagerDimensions.height = height;
    this.adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
};


AdUi.prototype.onPlayerEnterFullscreen = function() {
  this.addClass_(this.fullscreenDiv, 'ima-fullscreen');
  this.removeClass_(this.fullscreenDiv, 'ima-non-fullscreen');
};


AdUi.prototype.onPlayerExitFullscreen = function() {
  this.addClass_(this.fullscreenDiv, 'ima-non-fullscreen');
  this.removeClass_(this.fullscreenDiv, 'ima-fullscreen');
};


/**
 * Called when the player volume changes.
 *
 * @param {number} volume The new player volume.
 */
AdUi.prototype.onPlayerVolumeChanged = function(volume) {
  if (volume == 0) {
    this.addClass_(this.muteDiv, 'ima-muted');
    this.removeClass_(this.muteDiv, 'ima-non-muted');
    this.sliderLevelDiv.style.width = '0%';
  } else {
    this.addClass_(this.muteDiv, 'ima-non-muted');
    this.removeClass_(this.muteDiv, 'ima-muted');
    this.sliderLevelDiv.style.width = volume * 100 + '%';
  }
};

/**
 * Shows ad controls on mouseover.
 * @private
 */
AdUi.prototype.showAdControls_ = function() {
  this.controlsDiv.style.height = '37px';
  this.playPauseDiv.style.display = 'block';
  this.muteDiv.style.display = 'block';
  this.sliderDiv.style.display = 'block';
  this.fullscreenDiv.style.display = 'block';
};


/**
 * Hide the ad controls.
 * @private
 */
AdUi.prototype.hideAdControls_ = function() {
  this.controlsDiv.style.height = '14px';
  this.playPauseDiv.style.display = 'none';
  this.muteDiv.style.display = 'none';
  this.sliderDiv.style.display = 'none';
  this.fullscreenDiv.style.display = 'none';
};


/**
 * Assigns the unique id and class names to the given element as well as the
 * style class.
 * @param {HTMLElement} element Element that needs the controlName assigned.
 * @param {string} controlName Control name to assign.
 * @private
 */
AdUi.prototype.assignControlAttributes_ = function(element, controlName) {
  element.id = this.controlPrefix + controlName;
  element.className = this.controlPrefix + controlName + ' ' + controlName;
};


/**
 * Returns a regular expression to test a string for the given className.
 * @param className
 * @returns {RegExp}
 * @private
 */
AdUi.prototype.getClassRegexp_ = function(className){
  // Matches on
  // (beginning of string OR NOT word char)
  // classname
  // (negative lookahead word char OR end of string)
  return new RegExp('(^|[^A-Za-z-])' + className +
      '((?![A-Za-z-])|$)', 'gi');
};


/**
 * Returns whether or not the provided element has the provied class in its
 * className.
 * @param element
 * @param className
 * @return {boolean}
 * @private
 */
AdUi.prototype.elementHasClass_ = function(element, className) {
  var classRegexp = this.getClassRegexp_(className);
  return classRegexp.test(element.className);
};


/**
 * Adds a class to the given element if it doesn't already have the class
 * @param element
 * @param classToAdd
 * @private
 */
AdUi.prototype.addClass_ = function(element, classToAdd){
  if(this.elementHasClass_(element, classToAdd)){
    return element;
  }

  return element.className = element.className.trim() + ' ' + classToAdd;
};


/**
 * Removes a class from the given element if it has the given class
 * @param element
 * @param classToRemove
 * @private
 */
AdUi.prototype.removeClass_ = function(element, classToRemove){
  if(!this.elementHasClass_(element, classToRemove)){
    return element;
  }

  var classRegexp = this.getClassRegexp_(classToRemove);
  return element.className =
      element.className.trim().replace(classRegexp, '');
};


/**
 * @return {HTMLElement} The div for the ad container.
 */
AdUi.prototype.getAdContainerDiv = function() {
  return this.adContainerDiv;
};


/**
 * Changes the flag to show or hide the ad countdown timer.
 *
 * @param {boolean} showCountdownIn Show or hide the countdown timer.
 */
AdUi.prototype.setShowCountdown = function(showCountdownIn) {
  this.showCountdown = showCountdownIn;
  this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
};

/**
 * Copyright 2017 Google Inc.
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
  * Wraps the video.js player for the plugin.
  */
var PlayerWrapper = function(player, ads_plugin_settings, controller) {
  /**
   * Instance of the video.js player.
   */
  this.vjsPlayer = player;

  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * Timer used to track content progress.
   */
  this.contentTrackingTimer;

  /**
   * True if our content video has completed, false otherwise.
   */
  this.contentComplete = false;

  /**
   * Handle to interval that repeatedly updates current time.
   */
  this.updateTimeIntervalHandle;

  /**
   * Interval (ms) to check for player resize for fluid support.
   */
  this.updateTimeInterval = 1000;

  /**
   * Handle to interval that repeatedly checks for seeking.
   */
  this.seekCheckIntervalHandle;

  /**
   * Interval (ms) on which to check if the user is seeking through the
   * content.
   */
  this.seekCheckInterval = 1000;

  /**
   * Handle to interval that repeatedly checks for player resize.
   */
  this.resizeCheckIntervalHandle;

  /**
   * Interval (ms) to check for player resize for fluid support.
   */
  this.resizeCheckInterval = 250;

  /**
   * Threshold by which to judge user seeking. We check every 1000 ms to see
   * if the user is seeking. In order for us to decide that they are *not*
   * seeking, the content video playhead must only change by 900-1100 ms
   * between checks. Any greater change and we assume the user is seeking
   * through the video.
   */
  this.seekThreshold = 100;

  /**
   * Content ended listeners passed by the publisher to the plugin. Publishers
   * should allow the plugin to handle content ended to ensure proper support
   * of custom ad playback.
   */
  this.contentEndedListeners = [];

  /**
   * Stores the content source so we can re-populate it manually after a
   * post-roll on iOS.
   */
  this.contentSource = '';

  /**
   * Stores data for the content playhead tracker.
   */
  this.contentPlayheadTracker = {
    currentTime: 0,
    previousTime: 0,
    seeking: false,
    duration: 0
  };

  /**
   * Player dimensions. Used in our resize check.
   */
  this.vjsPlayerDimensions = {
    width: this.getPlayerWidth(),
    height: this.getPlayerHeight()
  };

  /**
   * Video.js control bar.
   */
  this.vjsControls = this.vjsPlayer.getChild('controlBar');

  /**
   * Vanilla HTML5 video player underneath the video.js player.
   */
  this.h5Player =
      document.getElementById(
          this.controller.getSettings()['id']).getElementsByClassName(
              'vjs-tech')[0];

  // Detect inline options
  if(this.h5Player.hasAttribute('autoplay')){
    this.controller.setSetting('adWillAutoPlay', true);
  }

  this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
  this.boundContentEndedListener = this.localContentEndedListener.bind(this);
  this.vjsPlayer.on('ended', this.boundContentEndedListener);
  this.vjsPlayer.on('dispose', this.playerDisposedListener.bind(this));
  this.vjsPlayer.on('readyforpreroll', this.onReadyForPreroll.bind(this));
  this.vjsPlayer.ready(this.onPlayerReady.bind(this));

  player.ads(ads_plugin_settings);
};


/**
 * Set up the intervals we use on the player.
 */
PlayerWrapper.prototype.setUpPlayerIntervals = function() {
  this.updateTimeIntervalHandle =
      setInterval(this.updateCurrentTime_.bind(this), this.updateTimeInterval);
  this.seekCheckIntervalHandle =
      setInterval(this.checkForSeeking_.bind(this), this.seekCheckInterval);
  this.resizeCheckIntervalHandle =
      setInterval(this.checkForResize_.bind(this), this.resizeCheckInterval);
};

/**
 * Updates the current time of the video
 * @private
 */
PlayerWrapper.prototype.updateCurrentTime_ = function() {
  if (!this.contentPlayheadTracker.seeking) {
    this.contentPlayheadTracker.currentTime = this.vjsPlayer.currentTime();
  }
};

/**
 * Detects when the user is seeking through a video.
 * This is used to prevent mid-rolls from playing while a user is seeking.
 *
 * There *is* a seeking property of the HTML5 video element, but it's not
 * properly implemented on all platforms (e.g. mobile safari), so we have to
 * check ourselves to be sure.
 *
 * @private
 */
PlayerWrapper.prototype.checkForSeeking_ = function() {
  var tempCurrentTime = this.vjsPlayer.currentTime();
  var diff =
      (tempCurrentTime - this.contentPlayheadTracker.previousTime) * 1000;
  if (Math.abs(diff) > this.seekCheckInterval + this.seekThreshold) {
    this.contentPlayheadTracker.seeking = true;
  } else {
    this.contentPlayheadTracker.seeking = false;
  }
  this.contentPlayheadTracker.previousTime = this.vjsPlayer.currentTime();
};

/**
 * Detects when the player is resized (for fluid support) and resizes the
 * ads manager to match.
 *
 * @private
 */
PlayerWrapper.prototype.checkForResize_ = function() {
  var currentWidth = this.getPlayerWidth();
  var currentHeight = this.getPlayerHeight();

  if (currentWidth != this.vjsPlayerDimensions.width ||
      currentHeight != this.vjsPlayerDimensions.height) {
    this.vjsPlayerDimensions.width = currentWidth;
    this.vjsPlayerDimensions.height = currentHeight;
    this.controller.onPlayerResize();
  }
};

/**
 * Local content ended listener for contentComplete.
 */
PlayerWrapper.prototype.localContentEndedListener = function() {
  if (!this.contentComplete) {
    this.contentComplete = true;
    this.controller.onContentComplete();
  }
  
  for (var index in this.contentEndedListeners) {
    this.contentEndedListeners[index]();
  }

  clearInterval(this.updateTimeIntervalHandle);
  clearInterval(this.seekCheckIntervalHandle);
  clearInterval(this.resizeCheckIntervalHandle);
  if(this.vjsPlayer.el()) {
    this.vjsPlayer.one('play', this.setUpPlayerIntervals_.bind(this));
  }
};

/**
 * Detects when the video.js player has been disposed.
 */
PlayerWrapper.prototype.playerDisposedListener = function() {
  this.contentEndedListeners = [];
  this.controller.onPlayerDisposed();

  this.contentComplete = true;
  this.vjsPlayer.off('ended', this.localContentEndedListener);

  // Bug fix: https://github.com/googleads/videojs-ima/issues/306
  if (this.vjsPlayer.ads.adTimeoutTimeout) {
    clearTimeout(this.vjsPlayer.ads.adTimeoutTimeout);
  }

  var intervalsToClear = [
    this.updateTimeIntervalHandle,
    this.seekCheckIntervalHandle,
    this.resizeCheckIntervalHandle];
  for (var index in intervalsToClear) {
    var interval = intervalsToClear[index];
    if (interval) {
      clearInterval(interval);
    }
  }
};


/**
 * Start ad playback, or content video playback in the absence of a
 * pre-roll.
 */
PlayerWrapper.prototype.onReadyForPreroll = function() {
  this.controller.onPlayerReadyForPreroll();
};


/**
 * Called when the player fires its 'ready' event.
 */
PlayerWrapper.prototype.onPlayerReady = function() {
  // TODO: See if IMA works without this - it should sync by itself.
  // Sync ad volume with player volume.
  //onVolumeChange_();
  player.on('fullscreenchange', this.onFullscreenChange_.bind(this));
  player.on('volumechange', this.onVolumeChange_.bind(this));
};


/**
 * Listens for the video.js player to change its fullscreen status. This
 * keeps the fullscreen-ness of the AdContainer in sync with the player.
 * @private
 */
PlayerWrapper.prototype.onFullscreenChange_ = function() {
  if (this.vjsPlayer.isFullscreen()) {
    this.controller.onPlayerEnterFullscreen();
  } else {
    this.controller.onPlayerExitFullscreen();
  }
};

/**
 * Listens for the video.js player to change its volume. This keeps the ad
 * volume in sync with the content volume if the volume of the player is
 * changed while content is playing
 * @private
 */
PlayerWrapper.prototype.onVolumeChange_ = function() {
  var newVolume = this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
  this.controller.onPlayerVolumeChanged(newVolume);
};

/**
 * Inject the ad container div into the DOM.
 * 
 * @param{HTMLElement} adContainerDiv The ad container div.
 */
PlayerWrapper.prototype.injectAdContainerDiv = function(adContainerDiv) {
  this.vjsControls.el().parentNode.appendChild(adContainerDiv);
};


/**
 * @return {Object} The content player.
 */
PlayerWrapper.prototype.getContentPlayer = function() {
  return this.h5Player;
}

/**
 * @return {number} The volume, 0-1.
 */
PlayerWrapper.prototype.getVolume = function() {
  return this.vjsPlayer.volume();
};


/**
 * Set the volume of the player. 0-1.
 *
 * @param {number} volume The new volume.
 */
PlayerWrapper.prototype.setVolume = function(volume) {
  this.vjsPlayer.volume(volume);
  if (volume == 0) {
    this.vjsPlayer.muted(true);
  } else {
    this.vjsPlayer.muted(false);
  }
};


/**
 * Ummute the player.
 */
PlayerWrapper.prototype.unmute = function() {
  this.vjsPlayer.muted(false);
};


/**
 * Mute the player.
 */
PlayerWrapper.prototype.mute = function() {
  this.vjsPlayer.muted(true);
};


/**
 * Play the video.
 */
PlayerWrapper.prototype.play = function() {
  this.vjsPlayer.play();
};


/**
 * Get the player width.
 */
PlayerWrapper.prototype.getPlayerWidth = function() {
  var boundingRect = this.vjsPlayer.el().getBoundingClientRect() || {};

  return parseInt(boundingRect.width, 10) || this.vjsPlayer.width();
};


/**
 * Get the player height.
 */
PlayerWrapper.prototype.getPlayerHeight = function() {
  var boundingRect = this.vjsPlayer.el().getBoundingClientRect() || {};

  return parseInt(boundingRect.height, 10) || this.vjsPlayer.height();
};


/**
 * Toggle fullscreen state.
 */
PlayerWrapper.prototype.toggleFullscreen = function() {
  if (this.vjsPlayer.isFullscreen()) {
    this.vjsPlayer.exitFullscreen();
  } else {
    this.vjsPlayer.requestFullscreen();
  }
};


/**
 * Returns the content playhead tracker.
 */
PlayerWrapper.prototype.getContentPlayheadTracker = function() {
  return this.contentPlayheadTracker;
};


/**
 * Handles ad errors.
 *
 * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
PlayerWrapper.prototype.onAdError = function(adErrorEvent) {
  this.vjsControls.show();
  var errorMessage =
      adErrorEvent.getError !== undefined ?
          adErrorEvent.getError() : adErrorEvent.stack;
  this.vjsPlayer.trigger({ type: 'adserror', data: {
    AdError: errorMessage,
    AdErrorEvent: adErrorEvent
  }});
};


/**
 * Handles ad break starting.
 *
 * @param {Object} adEvent The event fired by the IMA SDK.
 */
PlayerWrapper.prototype.onAdBreakStart = function(adEvent) {
  this.contentSource = this.vjsPlayer.currentSrc();
  this.vjsPlayer.off('ended', this.boundContentEndedListener);
  if (adEvent.getAd().getAdPodInfo().getPodIndex() != -1) {
    // Skip this call for post-roll ads
    this.vjsPlayer.ads.startLinearAdMode();
  }
  this.vjsControls.hide();
  this.vjsPlayer.pause();
};


/**
 * Handles ad break ending.
 */
PlayerWrapper.prototype.onAdBreakEnd = function() {
  this.vjsPlayer.on('ended', this.boundContentEndedListener);
  var currentAd = this.controller.getCurrentAd();
  /*if (!currentAd) {
    // Something went wrong playing the ad
    this.vjsPlayer.ads.endLinearAdMode();
  } else if (!this.contentComplete &&
      // Don't exit linear mode after post-roll or content will auto-replay
      currentAd.getAdPodInfo().getPodIndex() != -1 ) {
    this.vjsPlayer.ads.endLinearAdMode();
  }*/
  // TODO: See if this works without the decision tree above.
  this.vjsPlayer.ads.endLinearAdMode();
  this.vjsControls.show();
};


/**
 * Handles an individual ad start.
 */
PlayerWrapper.prototype.onAdStart = function() {
  this.vjsPlayer.trigger('ads-ad-started');
};


/**
 * Handles when all ads have finished playing.
 */
PlayerWrapper.prototype.onAllAdsCompleted = function() {
  if (this.contentComplete == true) {
    if (this.h5Player.src != this.contentSource) {
      this.vjsPlayer.src(this.contentSource);
    }
    this.controller.onContentAndAdsCompleted();
  }
};


/**
 * Triggers adsready for contrib-ads.
 */
PlayerWrapper.prototype.onAdsReady = function() {
  this.vjsPlayer.trigger('adsready');
};


/**
 * Changes the player source.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 * @param {?boolean} playOnLoad True to play the content once it has loaded,
 *     false to only load the content but not start playback.
 * @private
 */
PlayerWrapper.prototype.changeSource_ = function(contentSrc, playOnLoad) {
  // Only try to pause the player when initialised with a source already
  if (!!this.vjsPlayer.currentSrc()) {
    this.vjsPlayer.currentTime(0);
    this.vjsPlayer.pause();
  }
  if (contentSrc) {
    this.vjsPlayer.src(contentSrc);
  }
  if (playOnLoad) {
    this.vjsPlayer.one('loadedmetadata', this.playContentFromZero_.bind(this));
  } else {
    this.vjsPlayer.one('loadedmetadata', this.seekContentToZero_.bind(this));
  }
};

/**
 * Seeks content to 00:00:00. This is used as an event handler for the
 * loadedmetadata event, since seeking is not possible until that event has
 * fired.
 * @private
 */
PlayerWrapper.prototype.seekContentToZero_ = function() {
  this.vjsPlayer.currentTime(0);
};

/**
 * Seeks content to 00:00:00 and starts playback. This is used as an event
 * handler for the loadedmetadata event, since seeking is not possible until
 * that event has fired.
 * @private
 */
PlayerWrapper.prototype.playContentFromZero_ = function() {
  this.vjsPlayer.currentTime(0);
  this.vjsPlayer.play();
};



/**
 * Adds a listener for the 'ended' event of the video player. This should be
 * used instead of setting an 'ended' listener directly to ensure that the
 * ima can do proper cleanup of the SDK before other event listeners
 * are called.
 * @param {function} listener The listener to be called when content
 *     completes.
 */
PlayerWrapper.prototype.addContentEndedListener = function(listener) {
  this.contentEndedListeners.push(listener);
};


/**
 * Reset the player.
 */
PlayerWrapper.prototype.reset = function() {
  this.vjsPlayer.on('ended', this.boundContentEndedListener);
  this.vjsControls.show();
  this.vjsPlayer.ads.endLinearAdMode();
  // Reset the content time we give the SDK. Fixes an issue where requesting
  // VMAP followed by VMAP would play the second mid-rolls as pre-rolls if
  // the first playthrough of the video passed the second response's
  // mid-roll time.
  this.contentPlayheadTracker.currentTime = 0;
};
/**
 * Copyright 2017 Google Inc.
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
  * The grand coordinator of the plugin. Facilitates communication between all
  * other plugin classes.
  *
  * @param {Object} player Instance of the video.js player.
  * @param {Object} options Options provided by the implementation.
  * @constructor
  * @struct
  * @final
  */
var Controller = function(player, options) {
  /**
   * Stores user-provided settings.
   * @type {Object}
   */
  this.settings = {};

  /**
   * Content and ads ended listeners passed by the publisher to the plugin.
   * These will be called when the plugin detects that content *and all
   * ads* have completed. This differs from the contentEndedListeners in that
   * contentEndedListeners will fire between content ending and a post-roll
   * playing, whereas the contentAndAdsEndedListeners will fire after the
   * post-roll completes.
   */
  this.contentAndAdsEndedListeners = [];

  /**
   * Whether or not we are running on a mobile platform.
   */
  this.isMobile = (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i));

  this.initWithSettings_(options);

  /**
   * Stores contrib-ads default settings.
   */
  var contrib_ads_defaults = {
    debug: this.settings.debug,
    timeout: this.settings.timeout,
    prerollTimeout: this.settings.prerollTimeout
  };
  var ads_plugin_settings = this.extend(
      {}, contrib_ads_defaults, options['contribAdsSettings'] || {});

  this.playerWrapper = new PlayerWrapper(player, ads_plugin_settings, this);
  this.adUi = new AdUi(this);
  this.sdkImpl = new SdkImpl(this);
};


Controller.IMA_DEFAULTS = {
  debug: false,
  timeout: 5000,
  prerollTimeout: 1000,
  adLabel: 'Advertisement',
  showControlsForJSAds: true
};

/**
 * Extends the settings to include user-provided settings.
 * @private
 */
Controller.prototype.initWithSettings_ = function(options) {
  this.settings = this.extend({}, Controller.IMA_DEFAULTS, options || {});

  // Currently this isn't used but I can see it being needed in the future,
  // so to avoid implementation problems with later updates I'm requiring
  // it.
  if (!this.settings['id']) {
    window.console.error('Error: must provide id of video.js div');
    return;
  }

  // Default showing countdown timer to true.
  this.showCountdown = true;
  if (this.settings['showCountdown'] === false) {
    this.showCountdown = false;
  }
};


/**
 * Return the settings object.
 */
Controller.prototype.getSettings = function() {
  return this.settings;
};

/**
 * Inject the ad container div into the DOM.
 * 
 * @param{HTMLElement} adContainerDiv The ad container div.
 */
Controller.prototype.injectAdContainerDiv = function(adContainerDiv) {
  this.playerWrapper.injectAdContainerDiv(adContainerDiv);
};


/**
 * @return {HTMLElement} The div for the ad container.
 */
Controller.prototype.getAdContainerDiv = function() {
  return this.adUi.getAdContainerDiv();
}


/**
 * @return {Object} The content player.
 */
Controller.prototype.getContentPlayer = function() {
  return this.playerWrapper.getContentPlayer();
}


/**
 * Returns the content playhead tracker.
 */
Controller.prototype.getContentPlayheadTracker = function() {
  return this.playerWrapper.getContentPlayheadTracker();
}


/**
 * Add or modify a setting.
 *
 * @param {string} key Key to modify
 * @param {Object} value Value to set at key.
 */
Controller.prototype.setSetting = function(key, value) {
  this.settings[key] = value;
};


/**
 * Called when there is an error loading ads.
 *
 * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
Controller.prototype.onErrorLoadingAds = function(adErrorEvent) {
  this.adUi.onAdError();
  this.playerWrapper.onAdError(adErrorEvent);
}


/**
 * Called by the ad UI when the play/pause button is clicked.
 */
Controller.prototype.onAdPlayPauseClick = function() {
  if (this.sdkImpl.isAdPlaying()) {
    this.adUi.onAdsPaused();
    this.sdkImpl.pauseAds();
  } else {
    this.adUi.onAdsPlaying();
    this.sdkImpl.resumeAds();
  }
};


/**
 * Called by the ad UI when the mute button is clicked.
 *
 */
Controller.prototype.onAdMuteClick = function() {
  if (this.sdkImpl.isAdMuted()) {
    this.playerWrapper.unmute();
    this.adUi.unmute();
    this.sdkImpl.unmute();
  } else {
    this.playerWrapper.mute();
    this.adUi.mute();
    this.sdkImpl.mute();
  }
};


/**
 * Set the volume of the player and ads. 0-1.
 *
 * @param {number} volume The new volume.
 */
Controller.prototype.setVolume = function(volume) {
  this.playerWrapper.setVolume(volume);
  this.sdkImpl.setVolume(volume);
};


/**
 * @return {number} The volume of the content player.
 */
Controller.prototype.getPlayerVolume = function() {
  return this.playerWrapper.getVolume();
};


/**
 * Toggle fullscreen state.
 */
Controller.prototype.toggleFullscreen = function() {
  return this.playerWrapper.toggleFullscreen();
};


/**
 * Relays ad errors to the player wrapper.
 *
 * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
Controller.prototype.onAdError = function(adErrorEvent) {
  this.adUi.onAdError();
  this.playerWrapper.onAdError(adErrorEvent);
};

/**
 * Handles ad break starting.
 *
 * @param {Object} adEvent The event fired by the IMA SDK.
 */
Controller.prototype.onAdBreakStart = function(adEvent) {
  this.playerWrapper.onAdBreakStart(adEvent);
  this.adUi.onAdBreakStart(adEvent);
};


/**
 * Handles ad break ending.
 */
Controller.prototype.onAdBreakEnd = function() {
  this.playerWrapper.onAdBreakEnd();
  this.adUi.onAdBreakEnd();
};


/**
 * Handles when all ads have finished playing.
 */
Controller.prototype.onAllAdsCompleted = function() {
  this.adUi.onAllAdsCompleted();
  this.playerWrapper.onAllAdsCompleted();
};


/**
 * Handles the SDK firing an ad paused event.
 */
Controller.prototype.onAdsPaused = function() {
  this.adUi.onAdsPaused();
};


/**
 * Handles the SDK firing an ad resumed event.
 */
Controller.prototype.onAdsResumed = function() {
  this.adUi.onAdsResumed();
};


/**
 * Takes data from the sdk impl and passes it to the ad UI to update the UI.
 *
 * @param {number} currentTime Current time of the ad.
 * @param {number} duration Duration of the ad.
 * @param {number} adPosition Index of the ad in the pod.
 * @param {number} totalAds Total number of ads in the pod.
 */
Controller.prototype.onAdPlayheadUpdated =
    function(currentTime, duration, adPosition, totalAds) {
  this.adUi.updateAdUi(currentTime, duration, adPosition, totalAds)
};


/**
 * @return {Object} The current ad.
 */
Controller.prototype.getCurrentAd = function() {
  return this.sdkImpl.getCurrentAd();
};


/**
 * Play content.
 */
Controller.prototype.playContent = function() {
  this.playerWrapper.play();
};


/**
 * Handles when a linear ad starts.
 */
Controller.prototype.onLinearAdStart = function() {
  this.adUi.onLinearAdStart();
  this.playerWrapper.onAdStart();
};


/**
 * Handles when a non-linear ad starts.
 */
Controller.prototype.onNonLinearAdStart = function() {
  this.adUi.onNonLinearAdStart();
  this.playerWrapper.onAdStart();
};


/**
 * Get the player width.
 */
Controller.prototype.getPlayerWidth = function() {
  return this.playerWrapper.getPlayerWidth();
};


/**
 * Get the player width.
 */
Controller.prototype.getPlayerHeight = function() {
  return this.playerWrapper.getPlayerHeight();
};


/**
 * Tells the player wrapper that ads are ready.
 */
Controller.prototype.onAdsReady = function() {
  this.playerWrapper.onAdsReady();
};


/**
 * Called when the player wrapper detects that the player has been resized.
 *
 * @param {number} width The post-resize width of the player.
 * @param {number} height The post-resize height of the player.
 */
Controller.prototype.onPlayerResize = function(width, height) {
  this.adUi.onPlayerResize(width, height);
};


/**
 * Called by the player wrapper when content completes.
 */
Controller.prototype.onContentComplete = function() {
  this.sdkImpl.onContentComplete();
};

/**
 * Called when content and all ads have completed.
 */
Controller.prototype.onContentAndAdsCompleted = function() {
  for (var index in this.contentAndAdsEndedListeners) {
    this.contentAndAdsEndedListeners[index]();
  }
};


/**
 * Called when the player is disposed.
 */
Controller.prototype.onPlayerDisposed = function() {
  this.contentAndAdsEndedListeners = [];
  this.sdkImpl.onPlayerDisposed();
};


/**
 * Called when the player is ready to play a pre-roll.
 */
Controller.prototype.onPlayerReadyForPreroll = function() {
  this.sdkImpl.onPlayerReadyForPreroll();
};


/**
 * Called when the player enters fullscreen.
 */
Controller.prototype.onPlayerEnterFullscreen = function() {
  this.adUi.onPlayerEnterFullscreen();
  this.sdkImpl.onPlayerEnterFullscreen();
};


/**
 * Called when the player exits fullscreen.
 */
Controller.prototype.onPlayerExitFullscreen = function() {
  this.adUi.onPlayerExitFullscreen();
  this.sdkImpl.onPlayerExitFullscreen();
};


/**
 * Called when the player volume changes.
 *
 * @param {number} volume The new player volume.
 */
Controller.prototype.onPlayerVolumeChanged = function(volume) {
  this.adUi.onPlayerVolumeChanged(volume);
  this.sdkImpl.onPlayerVolumeChanged(volume);
};


/**
 * Sets the content of the video player. You should use this method instead
 * of setting the content src directly to ensure the proper ad tag is
 * requested when the video content is loaded.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 * @param {?string} adTag The ad tag to be requested when the content loads.
 *     Leave blank to use the existing ad tag.
 * @param {?boolean} playOnLoad True to play the content once it has loaded,
 *     false to only load the content but not start playback.
 */
Controller.prototype.setContentWithAdTag =
    function(contentSrc, adTag, playOnLoad) {
  this.reset();
  this.settings['adTagUrl'] = adTag ? adTag : this.settings['adTagUrl'];
  this.playerWrapper.changeSource(contentSrc, playOnLoad);
};


/**
 * Sets the content of the video player. You should use this method instead
 * of setting the content src directly to ensure the proper ads response is
 * used when the video content is loaded.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 * @param {?string} adsResponse The ads response to be requested when the
 *     content loads. Leave blank to use the existing ads response.
 * @param {?boolean} playOnLoad True to play the content once it has loaded,
 *     false to only load the content but not start playback.
 */
Controller.prototype.setContentWithAdsResponse =
    function(contentSrc, adsResponse, playOnLoad) {
  this.reset();
  this.settings['adsResponse'] =
      adsResponse ? adsResponse : this.settings['adsResponse'];
  this.playerWrapper.changeSource(contentSrc, playOnLoad);
};


/**
 * Resets the state of the plugin.
 */
Controller.prototype.reset = function() {
  this.sdkImpl.reset();
  this.playerWrapper.reset();
};



/**
 * Adds a listener for the 'ended' event of the video player. This should be
 * used instead of setting an 'ended' listener directly to ensure that the
 * ima can do proper cleanup of the SDK before other event listeners
 * are called.
 * @param {function} listener The listener to be called when content
 *     completes.
 */
Controller.prototype.addContentEndedListener = function(listener) {
  this.playerWrapper.addContentEndedListener(listener);
};



/**
 * Adds a listener that will be called when content and all ads have
 * finished playing.
 * @param {function} listener The listener to be called when content and ads
 *     complete.
 */
Controller.prototype.addContentAndAdsEndedListener = function(listener) {
  this.contentAndAdsEndedListeners.push(listener);
};


/**
 * Changes the flag to show or hide the ad countdown timer.
 *
 * @param {boolean} showCountdownIn Show or hide the countdown timer.
 */
Controller.prototype.setShowCountdown = function(showCountdownIn) {
  this.adUi.setShowCountdown(showCountdownIn);
  this.showCountdown = showCountdownIn;
  this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
};


/**
 * Initializes the AdDisplayContainer. On mobile, this must be done as a
 * result of user action.
 */
Controller.prototype.initializeAdDisplayContainer = function() {
  this.sdkImpl.initializeAdDisplayContainer();
};

/**
 * Called by publishers in manual ad break playback mode to start an ad
 * break.
 */
Controller.prototype.playAdBreak = function() {
  this.sdkImpl.playAdBreak();
};


/**
 * Ads an EventListener to the AdsManager. For a list of available events,
 * see
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type
 * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
 *     listen.
 * @param {function} callback The method to call when the event is fired.
 */
Controller.prototype.addEventListener = function(event, callback) {
  this.sdkImpl.addEventListener(event, callback);
};


/**
 * Returns the instance of the AdsManager.
 * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
 */
Controller.prototype.getAdsManager = function() {
  return this.sdkImpl.getAdsManager();
};


/**
 * Changes the ad tag. You will need to call requestAds after this method
 * for the new ads to be requested.
 * @param {?string} adTag The ad tag to be requested the next time
 *     requestAds is called.
 */
Controller.prototype.changeAdTag = function(adTag) {
  this.reset();
  this.settings['adTagUrl'] = adTag;
};

/**
 * Pauses the ad.
 */
Controller.prototype.pauseAd = function() {
  this.adUi.onAdsPaused();
  this.sdkImpl.pauseAds();
};

/**
 * Resumes the ad.
 */
Controller.prototype.resumeAd = function() {
  this.adUi.onAdsPlaying();
  this.sdkImpl.resumeAds();
};


/**
 * Extends an object to include the contents of objects at parameters 2 onward.
 *
 * @param {Object} obj The object onto which the subsequent objects' parameters
 *     will be extended. This object will be modified.
 * @param {...Object} var_args The objects whose properties are to be extended
 *     onto obj.
 * @return {Object} The extended object.
 */ 
Controller.prototype.extend = function(obj) {
  var arg;
  var index;
  var key;
  for (index = 1; index < arguments.length; index++) {
    arg = arguments[index];
    for (key in arg) {
      if (arg.hasOwnProperty(key)) {
        obj[key] = arg[key];
      }
    }
  }
  return obj;
};

/**
 * Copyright 2017 Google Inc.
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
 * Exposes the ImaPlugin to a publisher implementation.
 *
 * @param {Object} player Instance of the video.js player to which this plugin
 *     will be added.
 * @param {Object} options Options provided by the implementation.
 * @constructor
 * @struct
 * @final
 */
var ImaPlugin = function(player, options) {
  this.controller = new Controller(player, options);

  /**
   * Adds a listener that will be called when content and all ads have
   * finished playing.
   * @param {function} listener The listener to be called when content and ads complete.
   */
  this.addContentAndAdsEndedListener = function(listener) {
    this.controller.addContentAndAdsEndedListener(listener);
  }.bind(this);


  /**
   * Adds a listener for the 'ended' event of the video player. This should be
   * used instead of setting an 'ended' listener directly to ensure that the
   * ima can do proper cleanup of the SDK before other event listeners
   * are called.
   * @param {function} listener The listener to be called when content completes.
   */
  this.addContentEndedListener = function(listener) {
    this.controller.addContentEndedListener(listener);
  }.bind(this);

  /**
   * Ads an EventListener to the AdsManager. For a list of available events,
   * see
   * https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type
   * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to listen.
   * @param {function} callback The method to call when the event is fired.
   */
  this.addEventListener = function(event, callback) {
    this.controller.addEventListener(event, callback);
  }.bind(this);

  /**
   * Changes the ad tag. You will need to call requestAds after this method
   * for the new ads to be requested.
   * @param {?string} adTag The ad tag to be requested the next time requestAds
   *     is called.
   */
  this.changeAdTag = function(adTag) {
    this.controller.changeAdTag(adTag);
  }.bind(this);

  /**
   * Returns the instance of the AdsManager.
   * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
   */
  this.getAdsManager = function() {
    return this.controller.getAdsManager();
  }.bind(this);

  /**
   * Initializes the AdDisplayContainer. On mobile, this must be done as a
   * result of user action.
   */
  this.initializeAdDisplayContainer = function() {
    this.controller.initializeAdDisplayContainer();
  }.bind(this);

  /**
   * Pauses the ad.
   */
  this.pauseAd = function() {
    this.controller.pauseAd();
  }.bind(this);

  /**
   * Called by publishers in manual ad break playback mode to start an ad
   * break.
   */
  this.playAdBreak = function() {
    this.controller.playAdBreak();
  }.bind(this);

  /**
   * Creates the AdsRequest and request ads through the AdsLoader.
   */
  this.requestAds = function() {
    this.controller.requestAds();
  }.bind(this);

  /**
   * Resumes the ad.
   */
  this.resumeAd = function() {
    this.controller.resumeAd();
  }.bind(this);

  /**
   * Sets the listener to be called to trigger manual ad break playback.
   * @param {function} listener The listener to be called to trigger manual ad break playback.
   */
  this.setAdBreakReadyListener = function(listener) {
    this.controller.setAdBreakReadyListener();
  }.bind(this);
  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ad tag is
   * requested when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?string} adTag The ad tag to be requested when the content loads.
   *     Leave blank to use the existing ad tag.
   * @param {?boolean} playOnLoad True to play the content once it has loaded,
   *     false to only load the content but not start playback.
   */
  this.setContentWithAdTag = function(contentSrc, adTag, playOnLoad) {
    this.controller.setContentWithAdTag(contentSrc, adTag, playOnLoad);
  }.bind(this);

  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ads response is
   * used when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?string} adsResponse The ads response to be requested when the
   *     content loads. Leave blank to use the existing ads response.
   * @param {?boolean} playOnLoad True to play the content once it has loaded,
   *     false to only load the content but not start playback.
   */
  this.setContentWithAdsResponse =
      function(contentSrc, adsResponse, playOnLoad) {
    this.controller.setContentWithAdsResponse(
        contentSrc, adsResponse, playOnLoad);
  }.bind(this);

  /**
   * Changes the flag to show or hide the ad countdown timer.
   *
   * @param {boolean} showCountdownIn Show or hide the countdown timer.
   */
  this.setShowCountdown = function(showCountdownIn) {
    this.controller.setShowCountdown(showCountdownIn);
  }.bind(this);

  /**
   * Start ad playback, or content video playback in the absence of a
   * pre-roll. **NOTE**: This method only needs to be called if you provide
   * your own readyCallback as the second parameter to player.ima(). If you
   * only provide options and do not provide your own readyCallback,
   * **DO NOT** call this method. If you do provide your own readyCallback,
   * you should call this method in the last line of that callback. For more
   * info, see this method's usage in our advanced and playlist examples.
   */
  this.startFromReadyCallback = function() {
    this.controller.onPlayerReadyForPreroll();
  }.bind(this);
};

/**
 * Current plugin version.
 */
ImaPlugin.VERSION = '1.0.0';

/**
 * Footer JavaScript for the final distribution.
 */
  // Cross-compatibility for Video.js 5 and 6.
  var registerPlugin = videojs.registerPlugin || videojs.plugin;
  registerPlugin('ima', init);
});
