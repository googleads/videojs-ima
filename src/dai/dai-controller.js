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
import PlayerWrapper from './player-wrapper.js';
import AdUi from './ad-ui.js';
import SdkImpl from './sdk-impl.js';
 
/**
 * The coordinatorfor the DAI portion of the plugin. Facilitates
 * communication between all other plugin classes.
 *
 * @param {Object} player Instance of the video.js player.
 * @param {Object} options Options provided by the implementation.
 * @constructor
 * @struct
 * @final
 */
const DaiController = function(player, options) {
  /**
  * Stores user-provided settings.
  * @type {Object}
  */
  this.settings = {};
 
 
  /**
  * Whether or not we are running on a mobile platform.
  */
  this.isMobile = (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i));
 
  /**
  * Whether or not we are running on an iOS platform.
  */
  this.isIos = (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i));
 
  this.initWithSettings(options);
 
  /**
  * Stores contrib-ads default settings.
  */
  const contribAdsDefaults = {
    debug: this.settings.debug,
    timeout: this.settings.timeout,
    prerollTimeout: this.settings.prerollTimeout,
  };
  const adsPluginSettings = this.extend(
      {}, contribAdsDefaults, options.contribAdsSettings || {});

  this.playerWrapper = new PlayerWrapper(player, adsPluginSettings, this);
  this.adUi = new AdUi(this);
  this.sdkImpl = new SdkImpl(this);
};
 
Controller.IMA_DEFAULTS = {
  adLabel: 'Advertisement',
  adLabelNofN: 'of',
  debug: false,
  disableAdControls: false,
  showControlsForJSAds: true,
};
 
/**
 * Extends the settings to include user-provided settings.
 *
 * @param {Object} options Options to be used in initialization.
 */
Controller.prototype.initWithSettings = function(options) {
  this.settings = this.extend({}, Controller.IMA_DEFAULTS, options || {});

  this.warnAboutDeprecatedSettings();

  // Default showing countdown timer to true.
  this.showCountdown = true;
  if (this.settings.showCountdown === false) {
    this.showCountdown = false;
  }
};
 
/**
 * Logs console warnings when deprecated settings are used.
 */
Controller.prototype.warnAboutDeprecatedSettings = function() {
  const deprecatedSettings = [
    // Currently no DAI plugin settings are deprecated.
  ];
  deprecatedSettings.forEach((setting) => {
    if (this.settings[setting] !== undefined) {
      console.warn(
        'WARNING: videojs.imaDai setting ' + setting + ' is deprecated');
    }
  });
};
 
/**
 * Return the settings object.
 *
 * @return {Object} The settings object.
 */
Controller.prototype.getSettings = function() {
  return this.settings;
};
 
/**
 * Return whether or not we're in a mobile environment.
 *
 * @return {boolean} True if running on mobile, false otherwise.
 */
Controller.prototype.getIsMobile = function() {
  return this.isMobile;
};

/**
 * Return whether or not we're in an iOS environment.
 *
 * @return {boolean} True if running on iOS, false otherwise.
 */
Controller.prototype.getIsIos = function() {
  return this.isIos;
};

/**
 * @return {Object} The stream player.
 */
Controller.prototype.getStreamPlayer = function() {
  return this.playerWrapper.getStreamPlayer();
};

/**
 * Returns the content playhead tracker.
 *
 * @return {Object} The content playhead tracker.
 */
Controller.prototype.getContentPlayheadTracker = function() {
  return this.playerWrapper.getContentPlayheadTracker();
};

/**
 * Requests the stream.
 */
Controller.prototype.requestStream = function() {
  this.sdkImpl.requestStream();
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
 * Toggle fullscreen state.
 */
Controller.prototype.toggleFullscreen = function() {
  this.playerWrapper.toggleFullscreen();
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
 * Takes data from the sdk impl and passes it to the ad UI to update the UI.
 *
 * @param {number} currentTime Current time of the ad.
 * @param {number} remainingTime Remaining time of the ad.
 * @param {number} duration Duration of the ad.
 * @param {number} adPosition Index of the ad in the pod.
 * @param {number} totalAds Total number of ads in the pod.
 */
Controller.prototype.onAdPlayheadUpdated =
    function(currentTime, remainingTime, duration, adPosition, totalAds) {
  this.adUi.updateAdUi(
      currentTime, remainingTime, duration, adPosition, totalAds);
};
 
/**
 * Handles ad log messages.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the IMA SDK.
 */
Controller.prototype.onAdLog = function(adEvent) {
  this.playerWrapper.onAdLog(adEvent);
};

/**
 * @return {Object} The current ad.
 */
Controller.prototype.getCurrentAd = function() {
  return this.sdkImpl.getCurrentAd();
};

/**
 * Play stream.
 */
Controller.prototype.playStream = function() {
  this.playerWrapper.play();
};
 
/**
 * Called when the player is disposed.
 */
Controller.prototype.onPlayerDisposed = function() {
  this.contentAndAdsEndedListeners = [];
  this.sdkImpl.onPlayerDisposed();
};

/**
 * Called when the player is ready.
 */
Controller.prototype.onPlayerReady = function() {
  this.sdkImpl.onPlayerReady();
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
 * Resets the state of the plugin.
 */
Controller.prototype.reset = function() {
  this.sdkImpl.reset();
  this.playerWrapper.reset();
  this.adUi.reset();
};
 
/**
 * Changes the flag to show or hide the ad countdown timer.
 *
 * @param {boolean} showCountdownIn Show or hide the countdown timer.
 */
Controller.prototype.setShowCountdown = function(showCountdownIn) {
  this.adUi.setShowCountdown(showCountdownIn);
  this.showCountdown = showCountdownIn;
  this.adUi.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
};

/**
 * Adds an EventListener to the StreamManager. For a list of available events,
 * see
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/dai/reference/js/StreamEvent
 * @param {google.ima.StreamEvent.Type} event The AdEvent.Type for which to
 *     listen.
 * @param {callback} callback The method to call when the event is fired.
 */
Controller.prototype.addEventListener = function(event, callback) {
  this.sdkImpl.addEventListener(event, callback);
};
 
/**
 * Returns the instance of the StreamManager.
 * @return {google.ima.StreamManager} The StreamManager being used by the plugin.
 */
Controller.prototype.getStreamManager = function() {
  return this.sdkImpl.getStreamManager();
};

/**
 * Returns the instance of the player id.
 * @return {string} The player id.
 */
Controller.prototype.getPlayerId = function() {
  return this.playerWrapper.getPlayerId();
};

/**
 * Pauses the stream.
 */
Controller.prototype.pauseStream = function() {
  this.adUi.onAdsPaused();
  this.sdkImpl.pauseAds();
};
 
/**
 * Resumes the stream.
 */
Controller.prototype.resumeStream = function() {
  this.adUi.onAdsPlaying();
  this.sdkImpl.resumeAds();
};

/**
 * Toggles stream playback.
 */
Controller.prototype.togglePlayback = function() {
  this.playerWrapper.togglePlayback();
};

/**
 * @return {boolean} true if we expect that the stream will autoplay. false otherwise.
 */
Controller.prototype.streamWillAutoplay = function() {
  if (this.settings.streamWillAutoplay !== undefined) {
    return this.settings.streamWillAutoplay;
  } else {
    return !!this.playerWrapper.getPlayerOptions().autoplay;
  }
};
 
 
/**
 * @return {boolean} true if we expect that the stream will autoplay muted. false otherwise.
 */
Controller.prototype.streamWillPlayMuted = function() {
  if (this.settings.streamWillPlayMuted !== undefined) {
    return this.settings.streamWillPlayMuted;
  } else if (this.playerWrapper.getPlayerOptions().muted !== undefined) {
    return !!this.playerWrapper.getPlayerOptions().muted;
  } else {
    return this.playerWrapper.getVolume() == 0;
  }
};
 
/**
 * Triggers an event on the VJS player
 * @param  {string} name The event name.
 * @param  {Object} data The event data.
 */
Controller.prototype.triggerPlayerEvent = function(name, data) {
  this.playerWrapper.triggerPlayerEvent(name, data);
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
Controller.prototype.extend = function(obj, ...args) {
  let arg;
  let index;
  let key;
  for (index = 0; index < args.length; index++) {
    arg = args[index];
    for (key in arg) {
      if (arg.hasOwnProperty(key)) {
        obj[key] = arg[key];
      }
    }
  }
  return obj;
};
 
 export default DaiController;
 