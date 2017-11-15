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
  this.adDisplayContainer = new google.ima.AdDisplayContainer(
      this.controller.getAdContainerDiv(),
      this.controller.getContentPlayer());

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