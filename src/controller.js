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

  var ads_plugin_settings = this.extend(
      {}, contrib_ads_defaults, options['contribAdsSettings'] || {});

  this.initWithSettings(options);
  this.playerWrapper = new PlayerWrapper(player, this);
  this.adUi = new Adui(this);
  this.sdkImpl = new SdkImpl(this);
};


Controller.IMA_DEFAULTS = {
  debug: false,
  timeout: 5000,
  prerollTimeout: 1000,
  adLabel: 'Advertisement',
  showControlsForJSAds: true
};

Controller.CONTRIB_ADS_DEFAULTS = {
  debug: this.settings.debug,
  timeout: this.settings.timeout,
  prerollTimeout: this.settings.prerollTimeout
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
  if (this.settings['showCountdown'] == false) {
    this.showCountdown = false;
  }
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
    this.adUi.unmute();
    this.sdkImpl.unmute();
    this.player.unmute();
  } else {
    this.adUi.mute();
    this.sdkImpl.mute();
    this.player.mute();
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
  return this.playerWrapper.gteVolume();
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
}

/**
 * Handles ad break starting.
 *
 * @param {Object} adEvent The event fired by the IMA SDK.
 */
Controller.prototype.onAdBreakStart = function() {
  this.playerWrapper.onAdBreakStart(adEvent);
  this.adui.onAdBreakStart(adEvent);
}


/**
 * Handles ad break ending.
 */
Controller.prototype.onAdBreakEnd = function() {
  this.playerWrapper.onAdBreakEnd(adEvent);
  this.adui.onAdBreakEnd(adEvent);
}


/**
 * Handles when all ads have finished playing.
 */
Controller.prototype.onAllAdsCompleted = function() {
  this.adui.onAllAdsCompleted();
  this.player.onAllAdsCompleted();
}


/**
 * @return {Object} The current ad.
 */
Controller.prototype.getCurrentAd = function() {
  return this.sdkImpl.getCurrentAd();
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
