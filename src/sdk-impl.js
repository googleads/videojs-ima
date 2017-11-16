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
      onAdLoaded_);
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdStarted_);
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.CLICK,
      onAdPlayPauseClick_);
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      this.onAdComplete_);
  this.adsManager.addEventListener(
      google.ima.AdEvent.Type.SKIPPED,
      this.onAdComplete_);

  if (this.isMobile) {
    // Show/hide controls on pause and resume (triggered by tap).
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.PAUSED,
        onAdPaused_);
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.RESUMED,
        onAdResumed_);
  }

  if (!this.autoPlayAdBreaks) {
    try {
      var initWidth = this.getPlayerWidth();
      var initHeight = this.getPlayerHeight();
      this.adsManagerDimensions.width = initWidth;
      this.adsManagerDimensions.height = initHeight;
      this.adsManager.init(
          initWidth,
          initHeight,
          google.ima.ViewMode.NORMAL);
      this.adsManager.setVolume(
          this.player.muted() ? 0 : this.player.volume());
      if (!this.adDisplayContainerInitialized) {
        this.adDisplayContainer.initialize();
      }
    } catch (adError) {
      onAdError_(adError);
    }
  }

  this.player.trigger('adsready');

  if (this.settings['adsManagerLoadedCallback']) {
    this.settings['adsManagerLoadedCallback']();
  }
};


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
  this.vjsControls.show();
  // Hide controls in case of future non-linear ads. They'll be unhidden in
  // content_pause_requested.
};


/**
 * Records that ads have completed and calls contentAndAdsEndedListeners
 * if content is also complete.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 * @private
 */
var onAllAdsCompleted_ = function(adEvent) {
  this.allAdsCompleted = true;
  this.controller.onAllAdsCompleted();
}


/**
 * @return {Object} The current ad.
 */
Controller.prototype.getCurrentAd = function() {
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
Controller.prototype.setVolume = function(volume) {
  this.adsManager.setVolume(volume);
  if (volume == 0) {
    this.adMuted = true;
  } else {
    this.adMuted = false;
  }
};