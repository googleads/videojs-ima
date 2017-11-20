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
      {}, contrib_ads_defaults, options.contribAdsSettings || {});

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
  if (!this.settings.id) {
    window.console.error('Error: must provide id of video.js div');
    return;
  }

  // Default showing countdown timer to true.
  this.showCountdown = true;
  if (this.settings.showCountdown === false) {
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
};


/**
 * @return {Object} The content player.
 */
Controller.prototype.getContentPlayer = function() {
  return this.playerWrapper.getContentPlayer();
};


/**
 * Returns the content playhead tracker.
 */
Controller.prototype.getContentPlayheadTracker = function() {
  return this.playerWrapper.getContentPlayheadTracker();
};


/**
 * Requests ads.
 */
Controller.prototype.requestAds = function() {
  this.sdkImpl.requestAds();
};


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
 * Show the ad container.
 */
Controller.prototype.showAdContainer = function() {
  this.adUi.showAdContainer();
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
  this.adUi.updateAdUi(currentTime, duration, adPosition, totalAds);
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
 * Handles when a non-linear ad loads.
 */
Controller.prototype.onNonLinearAdLoad = function() {
  this.adUi.onNonLinearAdLoad();
};


/**
 * Handles when a non-linear ad starts.
 */
Controller.prototype.onNonLinearAdStart = function() {
  this.adUi.onNonLinearAdLoad();
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
  this.settings.adTagUrl = adTag ? adTag : this.settings.adTagUrl;
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
  this.settings.adsResponse =
      adsResponse ? adsResponse : this.settings.adsResponse;
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
  this.settings.adTagUrl = adTag;
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
