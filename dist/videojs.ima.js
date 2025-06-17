(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('video.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.videojsIma = {}, global.videojs));
})(this, (function (exports, videojs) { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _createClass(e, r, t) {
    return Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }
  function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
        t && (r = t);
        var n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return n >= r.length ? {
              done: true
            } : {
              done: false,
              value: r[n++]
            };
          },
          e: function (r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = true,
      u = false;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r = t.next();
        return a = r.done, r;
      },
      e: function (r) {
        u = true, o = r;
      },
      f: function () {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

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
   *
   * @param {Object} player Video.js player instance.
   * @param {Object} adsPluginSettings Settings for the contrib-ads plugin.
   * @param {Controller} controller Reference to the parent controller.
   */
  var PlayerWrapper$1 = function PlayerWrapper(player, adsPluginSettings, controller) {
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
    this.contentTrackingTimer = null;

    /**
     * True if our content video has completed, false otherwise.
     */
    this.contentComplete = false;

    /**
     * Handle to interval that repeatedly updates current time.
     */
    this.updateTimeIntervalHandle = null;

    /**
     * Interval (ms) to check for player resize for fluid support.
     */
    this.updateTimeInterval = 1000;

    /**
     * Handle to interval that repeatedly checks for seeking.
     */
    this.seekCheckIntervalHandle = null;

    /**
     * Interval (ms) on which to check if the user is seeking through the
     * content.
     */
    this.seekCheckInterval = 1000;

    /**
     * Handle to interval that repeatedly checks for player resize.
     */
    this.resizeCheckIntervalHandle = null;

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
     * Stores the content source type so we can re-populate it manually after a
     * post-roll.
     */
    this.contentSourceType = '';

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
    this.h5Player = null;
    this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
    this.boundContentEndedListener = this.localContentEndedListener.bind(this);
    this.vjsPlayer.on('contentended', this.boundContentEndedListener);
    this.vjsPlayer.on('dispose', this.playerDisposedListener.bind(this));
    this.vjsPlayer.on('readyforpreroll', this.onReadyForPreroll.bind(this));
    this.vjsPlayer.on('adtimeout', this.onAdTimeout.bind(this));
    this.vjsPlayer.ready(this.onPlayerReady.bind(this));
    if (this.controller.getSettings().requestMode === 'onPlay') {
      this.vjsPlayer.one('play', this.controller.requestAds.bind(this.controller));
    }
    if (!this.vjsPlayer.ads) {
      window.console.warn('You may be using a version of videojs-contrib-ads ' + 'that is not compatible with your version of video.js.');
    }
    this.vjsPlayer.ads(adsPluginSettings);
  };

  /**
   * Set up the intervals we use on the player.
   */
  PlayerWrapper$1.prototype.setUpPlayerIntervals = function () {
    /**
     * Clear old interval handers in case the method was called more than once
     */
    if (this.updateTimeIntervalHandle) {
      clearInterval(this.updateTimeIntervalHandle);
    }
    if (this.seekCheckIntervalHandle) {
      clearInterval(this.seekCheckIntervalHandle);
    }
    if (this.resizeCheckIntervalHandle) {
      clearInterval(this.resizeCheckIntervalHandle);
    }
    this.updateTimeIntervalHandle = setInterval(this.updateCurrentTime.bind(this), this.updateTimeInterval);
    this.seekCheckIntervalHandle = setInterval(this.checkForSeeking.bind(this), this.seekCheckInterval);
    this.resizeCheckIntervalHandle = setInterval(this.checkForResize.bind(this), this.resizeCheckInterval);
  };

  /**
   * Updates the current time of the video
   */
  PlayerWrapper$1.prototype.updateCurrentTime = function () {
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
   */
  PlayerWrapper$1.prototype.checkForSeeking = function () {
    var tempCurrentTime = this.vjsPlayer.currentTime();
    var diff = (tempCurrentTime - this.contentPlayheadTracker.previousTime) * 1000;
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
   */
  PlayerWrapper$1.prototype.checkForResize = function () {
    var currentWidth = this.getPlayerWidth();
    var currentHeight = this.getPlayerHeight();
    if (currentWidth != this.vjsPlayerDimensions.width || currentHeight != this.vjsPlayerDimensions.height) {
      this.vjsPlayerDimensions.width = currentWidth;
      this.vjsPlayerDimensions.height = currentHeight;
      this.controller.onPlayerResize(currentWidth, currentHeight);
    }
  };

  /**
   * Local content ended listener for contentComplete.
   */
  PlayerWrapper$1.prototype.localContentEndedListener = function () {
    if (!this.contentComplete) {
      this.contentComplete = true;
      this.controller.onContentComplete();
    }
    for (var index in this.contentEndedListeners) {
      if (typeof this.contentEndedListeners[index] === 'function') {
        this.contentEndedListeners[index]();
      }
    }
    if (this.vjsPlayer.el()) {
      this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
    }
  };

  /**
   * Called when it's time to play a post-roll but we don't have one to play.
   */
  PlayerWrapper$1.prototype.onNoPostroll = function () {
    this.vjsPlayer.trigger('nopostroll');
  };

  /**
   * Detects when the video.js player has been disposed.
   */
  PlayerWrapper$1.prototype.playerDisposedListener = function () {
    this.contentEndedListeners = [];
    this.controller.onPlayerDisposed();
    this.contentComplete = true;
    this.vjsPlayer.off('contentended', this.boundContentEndedListener);

    // Bug fix: https://github.com/googleads/videojs-ima/issues/306
    if (this.vjsPlayer.ads.adTimeoutTimeout) {
      clearTimeout(this.vjsPlayer.ads.adTimeoutTimeout);
    }
    var intervalsToClear = [this.updateTimeIntervalHandle, this.seekCheckIntervalHandle, this.resizeCheckIntervalHandle];
    for (var index in intervalsToClear) {
      if (intervalsToClear[index]) {
        clearInterval(intervalsToClear[index]);
      }
    }
  };

  /**
   * Start ad playback, or content video playback in the absence of a
   * pre-roll.
   */
  PlayerWrapper$1.prototype.onReadyForPreroll = function () {
    this.controller.onPlayerReadyForPreroll();
  };

  /**
   * Detects if the ad has timed out.
   */
  PlayerWrapper$1.prototype.onAdTimeout = function () {
    this.controller.onAdTimeout();
  };

  /**
   * Called when the player fires its 'ready' event.
   */
  PlayerWrapper$1.prototype.onPlayerReady = function () {
    this.h5Player = document.getElementById(this.getPlayerId()).getElementsByClassName('vjs-tech')[0];

    // Detect inline options
    if (this.h5Player.hasAttribute('autoplay')) {
      this.controller.setSetting('adWillAutoPlay', true);
    }

    // Sync ad volume with player volume.
    this.onVolumeChange();
    this.vjsPlayer.on('fullscreenchange', this.onFullscreenChange.bind(this));
    this.vjsPlayer.on('volumechange', this.onVolumeChange.bind(this));
    this.controller.onPlayerReady();
  };

  /**
   * Listens for the video.js player to change its fullscreen status. This
   * keeps the fullscreen-ness of the AdContainer in sync with the player.
   */
  PlayerWrapper$1.prototype.onFullscreenChange = function () {
    if (this.vjsPlayer.isFullscreen()) {
      this.controller.onPlayerEnterFullscreen();
    } else {
      this.controller.onPlayerExitFullscreen();
    }
  };

  /**
   * Listens for the video.js player to change its volume. This keeps the ad
   * volume in sync with the content volume if the volume of the player is
   * changed while content is playing.
   */
  PlayerWrapper$1.prototype.onVolumeChange = function () {
    var newVolume = this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
    this.controller.onPlayerVolumeChanged(newVolume);
  };

  /**
   * Inject the ad container div into the DOM.
   *
   * @param{HTMLElement} adContainerDiv The ad container div.
   */
  PlayerWrapper$1.prototype.injectAdContainerDiv = function (adContainerDiv) {
    this.vjsControls.el().parentNode.appendChild(adContainerDiv);
  };

  /**
   * @return {Object} The content player.
   */
  PlayerWrapper$1.prototype.getContentPlayer = function () {
    return this.h5Player;
  };

  /**
   * @return {number} The volume, 0-1.
   */
  PlayerWrapper$1.prototype.getVolume = function () {
    return this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
  };

  /**
   * Set the volume of the player. 0-1.
   *
   * @param {number} volume The new volume.
   */
  PlayerWrapper$1.prototype.setVolume = function (volume) {
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
  PlayerWrapper$1.prototype.unmute = function () {
    this.vjsPlayer.muted(false);
  };

  /**
   * Mute the player.
   */
  PlayerWrapper$1.prototype.mute = function () {
    this.vjsPlayer.muted(true);
  };

  /**
   * Play the video.
   */
  PlayerWrapper$1.prototype.play = function () {
    this.vjsPlayer.play();
  };

  /**
   * Toggles playback of the video.
   */
  PlayerWrapper$1.prototype.togglePlayback = function () {
    if (this.vjsPlayer.paused()) {
      this.vjsPlayer.play();
    } else {
      this.vjsPlayer.pause();
    }
  };

  /**
   * Get the player width.
   *
   * @return {number} The player's width.
   */
  PlayerWrapper$1.prototype.getPlayerWidth = function () {
    var width = (getComputedStyle(this.vjsPlayer.el()) || {}).width;
    if (!width || parseFloat(width) === 0) {
      width = (this.vjsPlayer.el().getBoundingClientRect() || {}).width;
    }
    return parseFloat(width) || this.vjsPlayer.width();
  };

  /**
   * Get the player height.
   *
   * @return {number} The player's height.
   */
  PlayerWrapper$1.prototype.getPlayerHeight = function () {
    var height = (getComputedStyle(this.vjsPlayer.el()) || {}).height;
    if (!height || parseFloat(height) === 0) {
      height = (this.vjsPlayer.el().getBoundingClientRect() || {}).height;
    }
    return parseFloat(height) || this.vjsPlayer.height();
  };

  /**
   * @return {Object} The vjs player's options object.
   */
  PlayerWrapper$1.prototype.getPlayerOptions = function () {
    return this.vjsPlayer.options_;
  };

  /**
   * Returns the instance of the player id.
   * @return {string} The player id.
   */
  PlayerWrapper$1.prototype.getPlayerId = function () {
    return this.vjsPlayer.id();
  };

  /**
   * Toggle fullscreen state.
   */
  PlayerWrapper$1.prototype.toggleFullscreen = function () {
    if (this.vjsPlayer.isFullscreen()) {
      this.vjsPlayer.exitFullscreen();
    } else {
      this.vjsPlayer.requestFullscreen();
    }
  };

  /**
   * Returns the content playhead tracker.
   *
   * @return {Object} The content playhead tracker.
   */
  PlayerWrapper$1.prototype.getContentPlayheadTracker = function () {
    return this.contentPlayheadTracker;
  };

  /**
   * Handles ad errors.
   *
   * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
   */
  PlayerWrapper$1.prototype.onAdError = function (adErrorEvent) {
    this.vjsControls.show();
    var errorMessage = adErrorEvent.getError !== undefined ? adErrorEvent.getError() : adErrorEvent.stack;
    this.vjsPlayer.trigger({
      type: 'adserror',
      data: {
        AdError: errorMessage,
        AdErrorEvent: adErrorEvent
      }
    });
  };

  /**
   * Handles ad log messages.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the IMA SDK.
   */
  PlayerWrapper$1.prototype.onAdLog = function (adEvent) {
    var adData = adEvent.getAdData();
    var errorMessage = adData['adError'] !== undefined ? adData['adError'].getMessage() : undefined;
    this.vjsPlayer.trigger({
      type: 'adslog',
      data: {
        AdError: errorMessage,
        AdEvent: adEvent
      }
    });
  };

  /**
   * Handles ad break starting.
   */
  PlayerWrapper$1.prototype.onAdBreakStart = function () {
    this.contentSource = this.vjsPlayer.currentSrc();
    this.contentSourceType = this.vjsPlayer.currentType();
    this.vjsPlayer.off('contentended', this.boundContentEndedListener);
    this.vjsPlayer.ads.startLinearAdMode();
    this.vjsControls.hide();
    this.vjsPlayer.pause();
  };

  /**
   * Handles ad break ending.
   */
  PlayerWrapper$1.prototype.onAdBreakEnd = function () {
    this.vjsPlayer.on('contentended', this.boundContentEndedListener);
    if (this.vjsPlayer.ads.inAdBreak()) {
      this.vjsPlayer.ads.endLinearAdMode();
    }
    this.vjsControls.show();
  };

  /**
   * Handles an individual ad start.
   */
  PlayerWrapper$1.prototype.onAdStart = function () {
    this.vjsPlayer.trigger('ads-ad-started');
  };

  /**
   * Handles when all ads have finished playing.
   */
  PlayerWrapper$1.prototype.onAllAdsCompleted = function () {
    if (this.contentComplete == true) {
      // The null check on this.contentSource was added to fix
      // an error when the post-roll was an empty VAST tag.
      if (this.contentSource && this.vjsPlayer.currentSrc() != this.contentSource) {
        this.vjsPlayer.src({
          src: this.contentSource,
          type: this.contentSourceType
        });
      }
      this.controller.onContentAndAdsCompleted();
    }
  };

  /**
   * Triggers adsready for contrib-ads.
   */
  PlayerWrapper$1.prototype.onAdsReady = function () {
    this.vjsPlayer.trigger('adsready');
  };

  /**
   * Changes the player source.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   */
  PlayerWrapper$1.prototype.changeSource = function (contentSrc) {
    // Only try to pause the player when initialised with a source already
    if (this.vjsPlayer.currentSrc()) {
      this.vjsPlayer.currentTime(0);
      this.vjsPlayer.pause();
    }
    if (contentSrc) {
      this.vjsPlayer.src(contentSrc);
    }
    this.vjsPlayer.one('loadedmetadata', this.seekContentToZero.bind(this));
  };

  /**
   * Seeks content to 00:00:00. This is used as an event handler for the
   * loadedmetadata event, since seeking is not possible until that event has
   * fired.
   */
  PlayerWrapper$1.prototype.seekContentToZero = function () {
    this.vjsPlayer.currentTime(0);
  };

  /**
   * Triggers an event on the VJS player
   * @param  {string} name The event name.
   * @param  {Object} data The event data.
   */
  PlayerWrapper$1.prototype.triggerPlayerEvent = function (name, data) {
    this.vjsPlayer.trigger(name, data);
  };

  /**
   * Listener JSDoc for ESLint. This listener can be passed to
   * addContentEndedListener.
   * @callback listener
   */

  /**
   * Adds a listener for the 'contentended' event of the video player. This should
   * be used instead of setting an 'contentended' listener directly to ensure that
   * the ima can do proper cleanup of the SDK before other event listeners are
   * called.
   * @param {listener} listener The listener to be called when content
   *     completes.
   */
  PlayerWrapper$1.prototype.addContentEndedListener = function (listener) {
    this.contentEndedListeners.push(listener);
  };

  /**
   * Reset the player.
   */
  PlayerWrapper$1.prototype.reset = function () {
    // Attempts to remove the contentEndedListener before adding it.
    // This is to prevent an error where an erroring video caused multiple
    // contentEndedListeners to be added.
    this.vjsPlayer.off('contentended', this.boundContentEndedListener);
    this.vjsPlayer.on('contentended', this.boundContentEndedListener);
    this.vjsControls.show();
    if (this.vjsPlayer.ads.inAdBreak()) {
      this.vjsPlayer.ads.endLinearAdMode();
    }
    // Reset the content time we give the SDK. Fixes an issue where requesting
    // VMAP followed by VMAP would play the second mid-rolls as pre-rolls if
    // the first playthrough of the video passed the second response's
    // mid-roll time.
    this.contentPlayheadTracker.currentTime = 0;
    this.contentComplete = false;
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
  var AdUi = function AdUi(controller) {
    /**
     * Plugin controller.
     */
    this.controller = controller;

    /**
     * Div used as an ad container.
     */
    this.adContainerDiv = document.createElement('div');

    /**
     * Div used to display ad controls.
     */
    this.controlsDiv = document.createElement('div');

    /**
     * Div used to display ad countdown timer.
     */
    this.countdownDiv = document.createElement('div');

    /**
     * Div used to display add seek bar.
     */
    this.seekBarDiv = document.createElement('div');

    /**
     * Div used to display ad progress (in seek bar).
     */
    this.progressDiv = document.createElement('div');

    /**
     * Div used to display ad play/pause button.
     */
    this.playPauseDiv = document.createElement('div');

    /**
     * Div used to display ad mute button.
     */
    this.muteDiv = document.createElement('div');

    /**
     * Div used by the volume slider.
     */
    this.sliderDiv = document.createElement('div');

    /**
     * Volume slider level visuals
     */
    this.sliderLevelDiv = document.createElement('div');

    /**
     * Div used to display ad fullscreen button.
     */
    this.fullscreenDiv = document.createElement('div');

    /**
     * Bound event handler for onMouseUp.
     */
    this.boundOnMouseUp = this.onMouseUp.bind(this);

    /**
     * Bound event handler for onMouseMove.
     */
    this.boundOnMouseMove = this.onMouseMove.bind(this);

    /**
     * Stores data for the ad playhead tracker.
     */
    this.adPlayheadTracker = {
      'currentTime': 0,
      'duration': 0,
      'isPod': false,
      'adPosition': 0,
      'totalAds': 0
    };

    /**
     * Used to prefix videojs ima controls.
     */
    this.controlPrefix = this.controller.getPlayerId() + '_';

    /**
     * Boolean flag to show or hide the ad countdown timer.
     */
    this.showCountdown = true;
    if (this.controller.getSettings().showCountdown === false) {
      this.showCountdown = false;
    }

    /**
     * Boolean flag if the current ad is nonlinear.
     */
    this.isAdNonlinear = false;
    this.createAdContainer();
  };

  /**
   * Creates the ad container.
   */
  AdUi.prototype.createAdContainer = function () {
    this.assignControlAttributes(this.adContainerDiv, 'ima-ad-container');
    this.adContainerDiv.style.position = 'absolute';
    this.adContainerDiv.style.zIndex = 1111;
    this.adContainerDiv.addEventListener('mouseenter', this.showAdControls.bind(this), false);
    this.adContainerDiv.addEventListener('mouseleave', this.hideAdControls.bind(this), false);
    this.adContainerDiv.addEventListener('click', this.onAdContainerClick.bind(this), false);
    this.createControls();
    this.controller.injectAdContainerDiv(this.adContainerDiv);
  };

  /**
   * Create the controls.
   */
  AdUi.prototype.createControls = function () {
    this.assignControlAttributes(this.controlsDiv, 'ima-controls-div');
    this.controlsDiv.style.width = '100%';
    if (!this.controller.getIsMobile()) {
      this.assignControlAttributes(this.countdownDiv, 'ima-countdown-div');
      this.countdownDiv.innerHTML = this.controller.getSettings().adLabel;
      this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
    } else {
      this.countdownDiv.style.display = 'none';
    }
    this.assignControlAttributes(this.seekBarDiv, 'ima-seek-bar-div');
    this.seekBarDiv.style.width = '100%';
    this.assignControlAttributes(this.progressDiv, 'ima-progress-div');
    this.assignControlAttributes(this.playPauseDiv, 'ima-play-pause-div');
    this.addClass(this.playPauseDiv, 'ima-playing');
    this.playPauseDiv.addEventListener('click', this.onAdPlayPauseClick.bind(this), false);
    this.assignControlAttributes(this.muteDiv, 'ima-mute-div');
    this.addClass(this.muteDiv, 'ima-non-muted');
    this.muteDiv.addEventListener('click', this.onAdMuteClick.bind(this), false);
    this.assignControlAttributes(this.sliderDiv, 'ima-slider-div');
    this.sliderDiv.addEventListener('mousedown', this.onAdVolumeSliderMouseDown.bind(this), false);

    // Hide volume slider controls on iOS as they aren't supported.
    if (this.controller.getIsIos()) {
      this.sliderDiv.style.display = 'none';
    }
    this.assignControlAttributes(this.sliderLevelDiv, 'ima-slider-level-div');
    this.assignControlAttributes(this.fullscreenDiv, 'ima-fullscreen-div');
    this.addClass(this.fullscreenDiv, 'ima-non-fullscreen');
    this.fullscreenDiv.addEventListener('click', this.onAdFullscreenClick.bind(this), false);
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
   */
  AdUi.prototype.onAdPlayPauseClick = function () {
    this.controller.onAdPlayPauseClick();
  };

  /**
   * Listener for clicks on the play/pause button during ad playback.
   */
  AdUi.prototype.onAdMuteClick = function () {
    this.controller.onAdMuteClick();
  };

  /**
   * Listener for clicks on the fullscreen button during ad playback.
   */
  AdUi.prototype.onAdFullscreenClick = function () {
    this.controller.toggleFullscreen();
  };

  /**
   * Show pause and hide play button
   */
  AdUi.prototype.onAdsPaused = function () {
    this.controller.sdkImpl.adPlaying = false;
    this.addClass(this.playPauseDiv, 'ima-paused');
    this.removeClass(this.playPauseDiv, 'ima-playing');
    this.showAdControls();
  };

  /**
   * Show pause and hide play button
   */
  AdUi.prototype.onAdsResumed = function () {
    this.onAdsPlaying();
    this.showAdControls();
  };

  /**
   * Show play and hide pause button
   */
  AdUi.prototype.onAdsPlaying = function () {
    this.controller.sdkImpl.adPlaying = true;
    this.addClass(this.playPauseDiv, 'ima-playing');
    this.removeClass(this.playPauseDiv, 'ima-paused');
  };

  /**
   * Takes data from the controller to update the UI.
   *
   * @param {number} currentTime Current time of the ad.
   * @param {number} remainingTime Remaining time of the ad.
   * @param {number} duration Duration of the ad.
   * @param {number} adPosition Index of the ad in the pod.
   * @param {number} totalAds Total number of ads in the pod.
   */
  AdUi.prototype.updateAdUi = function (currentTime, remainingTime, duration, adPosition, totalAds) {
    // Update countdown timer data
    var remainingMinutes = Math.floor(remainingTime / 60);
    var remainingSeconds = Math.floor(remainingTime % 60);
    if (remainingSeconds.toString().length < 2) {
      remainingSeconds = '0' + remainingSeconds;
    }
    var podCount = ': ';
    if (totalAds > 1) {
      podCount = ' (' + adPosition + ' ' + this.controller.getSettings().adLabelNofN + ' ' + totalAds + '): ';
    }
    this.countdownDiv.innerHTML = this.controller.getSettings().adLabel + podCount + remainingMinutes + ':' + remainingSeconds;

    // Update UI
    var playProgressRatio = currentTime / duration;
    var playProgressPercent = playProgressRatio * 100;
    this.progressDiv.style.width = playProgressPercent + '%';
  };

  /**
   * Handles UI changes when the ad is unmuted.
   */
  AdUi.prototype.unmute = function () {
    this.addClass(this.muteDiv, 'ima-non-muted');
    this.removeClass(this.muteDiv, 'ima-muted');
    this.sliderLevelDiv.style.width = this.controller.getPlayerVolume() * 100 + '%';
  };

  /**
   * Handles UI changes when the ad is muted.
   */
  AdUi.prototype.mute = function () {
    this.addClass(this.muteDiv, 'ima-muted');
    this.removeClass(this.muteDiv, 'ima-non-muted');
    this.sliderLevelDiv.style.width = '0%';
  };

  /*
   * Listener for mouse down events during ad playback. Used for volume.
   */
  AdUi.prototype.onAdVolumeSliderMouseDown = function () {
    document.addEventListener('mouseup', this.boundOnMouseUp, false);
    document.addEventListener('mousemove', this.boundOnMouseMove, false);
  };

  /*
   * Mouse movement listener used for volume slider.
   */
  AdUi.prototype.onMouseMove = function (event) {
    this.changeVolume(event);
  };

  /*
   * Mouse release listener used for volume slider.
   */
  AdUi.prototype.onMouseUp = function (event) {
    this.changeVolume(event);
    document.removeEventListener('mouseup', this.boundOnMouseUp);
    document.removeEventListener('mousemove', this.boundOnMouseMove);
  };

  /*
   * Utility function to set volume and associated UI
   */
  AdUi.prototype.changeVolume = function (event) {
    var percent = (event.clientX - this.sliderDiv.getBoundingClientRect().left) / this.sliderDiv.offsetWidth;
    percent *= 100;
    // Bounds value 0-100 if mouse is outside slider region.
    percent = Math.min(Math.max(percent, 0), 100);
    this.sliderLevelDiv.style.width = percent + '%';
    if (this.percent == 0) {
      this.addClass(this.muteDiv, 'ima-muted');
      this.removeClass(this.muteDiv, 'ima-non-muted');
    } else {
      this.addClass(this.muteDiv, 'ima-non-muted');
      this.removeClass(this.muteDiv, 'ima-muted');
    }
    this.controller.setVolume(percent / 100); // 0-1
  };

  /**
   * Show the ad container.
   */
  AdUi.prototype.showAdContainer = function () {
    this.adContainerDiv.style.display = 'block';
  };

  /**
   * Hide the ad container
   */
  AdUi.prototype.hideAdContainer = function () {
    this.adContainerDiv.style.display = 'none';
  };

  /**
   * Handles clicks on the ad container
   */
  AdUi.prototype.onAdContainerClick = function () {
    if (this.isAdNonlinear) {
      this.controller.togglePlayback();
    }
  };

  /**
   * Resets the state of the ad ui.
   */
  AdUi.prototype.reset = function () {
    this.hideAdContainer();
  };

  /**
   * Handles ad errors.
   */
  AdUi.prototype.onAdError = function () {
    this.hideAdContainer();
  };

  /**
   * Handles ad break starting.
   *
   * @param {Object} adEvent The event fired by the IMA SDK.
   */
  AdUi.prototype.onAdBreakStart = function (adEvent) {
    this.showAdContainer();
    var contentType = adEvent.getAd().getContentType();
    if (contentType === 'application/javascript' && !this.controller.getSettings().showControlsForJSAds) {
      this.controlsDiv.style.display = 'none';
    } else {
      this.controlsDiv.style.display = 'block';
    }
    this.onAdsPlaying();
    // Start with the ad controls minimized.
    this.hideAdControls();
  };

  /**
   * Handles ad break ending.
   */
  AdUi.prototype.onAdBreakEnd = function () {
    var currentAd = this.controller.getCurrentAd();
    if (currentAd == null ||
    // hide for post-roll only playlist
    currentAd.isLinear()) {
      // don't hide for non-linear ads
      this.hideAdContainer();
    }
    this.controlsDiv.style.display = 'none';
    this.countdownDiv.innerHTML = '';
  };

  /**
   * Handles when all ads have finished playing.
   */
  AdUi.prototype.onAllAdsCompleted = function () {
    this.hideAdContainer();
  };

  /**
   * Handles when a linear ad starts.
   */
  AdUi.prototype.onLinearAdStart = function () {
    // Don't bump container when controls are shown
    this.removeClass(this.adContainerDiv, 'bumpable-ima-ad-container');
    this.isAdNonlinear = false;
  };

  /**
   * Handles when a non-linear ad starts.
   */
  AdUi.prototype.onNonLinearAdLoad = function () {
    // For non-linear ads that show after a linear ad. For linear ads, we show the
    // ad container in onAdBreakStart to prevent blinking in pods.
    this.adContainerDiv.style.display = 'block';
    // Bump container when controls are shown
    this.addClass(this.adContainerDiv, 'bumpable-ima-ad-container');
    this.isAdNonlinear = true;
  };
  AdUi.prototype.onPlayerEnterFullscreen = function () {
    this.addClass(this.fullscreenDiv, 'ima-fullscreen');
    this.removeClass(this.fullscreenDiv, 'ima-non-fullscreen');
  };
  AdUi.prototype.onPlayerExitFullscreen = function () {
    this.addClass(this.fullscreenDiv, 'ima-non-fullscreen');
    this.removeClass(this.fullscreenDiv, 'ima-fullscreen');
  };

  /**
   * Called when the player volume changes.
   *
   * @param {number} volume The new player volume.
   */
  AdUi.prototype.onPlayerVolumeChanged = function (volume) {
    if (volume == 0) {
      this.addClass(this.muteDiv, 'ima-muted');
      this.removeClass(this.muteDiv, 'ima-non-muted');
      this.sliderLevelDiv.style.width = '0%';
    } else {
      this.addClass(this.muteDiv, 'ima-non-muted');
      this.removeClass(this.muteDiv, 'ima-muted');
      this.sliderLevelDiv.style.width = volume * 100 + '%';
    }
  };

  /**
   * Shows ad controls on mouseover.
   */
  AdUi.prototype.showAdControls = function () {
    var _this$controller$getS = this.controller.getSettings(),
      disableAdControls = _this$controller$getS.disableAdControls;
    if (!disableAdControls) {
      this.addClass(this.controlsDiv, 'ima-controls-div-showing');
    }
  };

  /**
   * Hide the ad controls.
   */
  AdUi.prototype.hideAdControls = function () {
    this.removeClass(this.controlsDiv, 'ima-controls-div-showing');
  };

  /**
   * Assigns the unique id and class names to the given element as well as the
   * style class.
   * @param {HTMLElement} element Element that needs the controlName assigned.
   * @param {string} controlName Control name to assign.
   */
  AdUi.prototype.assignControlAttributes = function (element, controlName) {
    element.id = this.controlPrefix + controlName;
    element.className = this.controlPrefix + controlName + ' ' + controlName;
  };

  /**
   * Returns a regular expression to test a string for the given className.
   *
   * @param {string} className The name of the class.
   * @return {RegExp} The regular expression used to test for that class.
   */
  AdUi.prototype.getClassRegexp = function (className) {
    // Matches on
    // (beginning of string OR NOT word char)
    // classname
    // (negative lookahead word char OR end of string)
    return new RegExp('(^|[^A-Za-z-])' + className + '((?![A-Za-z-])|$)', 'gi');
  };

  /**
   * Returns whether or not the provided element has the provied class in its
   * className.
   * @param {HTMLElement} element Element to tes.t
   * @param {string} className Class to look for.
   * @return {boolean} True if element has className in class list. False
   *     otherwise.
   */
  AdUi.prototype.elementHasClass = function (element, className) {
    var classRegexp = this.getClassRegexp(className);
    return classRegexp.test(element.className);
  };

  /**
   * Adds a class to the given element if it doesn't already have the class
   * @param {HTMLElement} element Element to which the class will be added.
   * @param {string} classToAdd Class to add.
   */
  AdUi.prototype.addClass = function (element, classToAdd) {
    element.className = element.className.trim() + ' ' + classToAdd;
  };

  /**
   * Removes a class from the given element if it has the given class
   *
   * @param {HTMLElement} element Element from which the class will be removed.
   * @param {string} classToRemove Class to remove.
   */
  AdUi.prototype.removeClass = function (element, classToRemove) {
    var classRegexp = this.getClassRegexp(classToRemove);
    element.className = element.className.trim().replace(classRegexp, '');
  };

  /**
   * @return {HTMLElement} The div for the ad container.
   */
  AdUi.prototype.getAdContainerDiv = function () {
    return this.adContainerDiv;
  };

  /**
   * Changes the flag to show or hide the ad countdown timer.
   *
   * @param {boolean} showCountdownIn Show or hide the countdown timer.
   */
  AdUi.prototype.setShowCountdown = function (showCountdownIn) {
    this.showCountdown = showCountdownIn;
    this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
  };

  var version = "2.4.0";
  var pkg = {
  	version: version};

  /**
   * Implementation of the IMA SDK for the plugin.
   *
   * @param {Object} controller Reference to the parent controller.
   *
   * @constructor
   * @struct
   * @final
   */
  var SdkImpl$1 = function SdkImpl(controller) {
    /**
     * Plugin controller.
     */
    this.controller = controller;

    /**
     * IMA SDK AdDisplayContainer.
     */
    this.adDisplayContainer = null;

    /**
     * True if the AdDisplayContainer has been initialized. False otherwise.
     */
    this.adDisplayContainerInitialized = false;

    /**
     * IMA SDK AdsLoader
     */
    this.adsLoader = null;

    /**
     * IMA SDK AdsManager
     */
    this.adsManager = null;

    /**
     * IMA SDK AdsRenderingSettings.
     */
    this.adsRenderingSettings = null;

    /**
     * VAST, VMAP, or ad rules response. Used in lieu of fetching a response
     * from an ad tag URL.
     */
    this.adsResponse = null;

    /**
     * Current IMA SDK Ad.
     */
    this.currentAd = null;

    /**
     * Timer used to track ad progress.
     */
    this.adTrackingTimer = null;

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
     * True if the ad has timed out.
     */
    this.isAdTimedOut = false;

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
    if (this.controller.getSettings().autoPlayAdBreaks === false) {
      this.autoPlayAdBreaks = false;
    }

    // Set SDK settings from plugin settings.
    if (this.controller.getSettings().locale) {
      /* eslint no-undef: 'error' */
      /* global google */
      google.ima.settings.setLocale(this.controller.getSettings().locale);
    }
    if (this.controller.getSettings().disableFlashAds) {
      google.ima.settings.setDisableFlashAds(this.controller.getSettings().disableFlashAds);
    }
    if (this.controller.getSettings().disableCustomPlaybackForIOS10Plus) {
      google.ima.settings.setDisableCustomPlaybackForIOS10Plus(this.controller.getSettings().disableCustomPlaybackForIOS10Plus);
    }
    if (this.controller.getSettings().ppid) {
      google.ima.settings.setPpid(this.controller.getSettings().ppid);
    }
    if (this.controller.getSettings().featureFlags) {
      google.ima.settings.setFeatureFlags(this.controller.getSettings().featureFlags);
    }
  };

  /**
   * Creates and initializes the IMA SDK objects.
   */
  SdkImpl$1.prototype.initAdObjects = function () {
    this.adDisplayContainer = new google.ima.AdDisplayContainer(this.controller.getAdContainerDiv(), this.controller.getContentPlayer());
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
    this.adsLoader.getSettings().setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
    if (this.controller.getSettings().vpaidAllowed == false) {
      this.adsLoader.getSettings().setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.DISABLED);
    }
    if (this.controller.getSettings().vpaidMode !== undefined) {
      this.adsLoader.getSettings().setVpaidMode(this.controller.getSettings().vpaidMode);
    }
    if (this.controller.getSettings().locale) {
      this.adsLoader.getSettings().setLocale(this.controller.getSettings().locale);
    }
    if (this.controller.getSettings().numRedirects) {
      this.adsLoader.getSettings().setNumRedirects(this.controller.getSettings().numRedirects);
    }
    if (this.controller.getSettings().sessionId) {
      this.adsLoader.getSettings().setSessionId(this.controller.getSettings().sessionId);
    }
    this.adsLoader.getSettings().setPlayerType('videojs-ima');
    this.adsLoader.getSettings().setPlayerVersion(pkg.version);
    this.adsLoader.getSettings().setAutoPlayAdBreaks(this.autoPlayAdBreaks);
    this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded.bind(this), false);
    this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdsLoaderError.bind(this), false);
    this.controller.playerWrapper.vjsPlayer.trigger({
      type: 'ads-loader',
      adsLoader: this.adsLoader
    });
  };

  /**
   * Creates the AdsRequest and request ads through the AdsLoader.
   */
  SdkImpl$1.prototype.requestAds = function () {
    var adsRequest = new google.ima.AdsRequest();
    if (this.controller.getSettings().adTagUrl) {
      adsRequest.adTagUrl = this.controller.getSettings().adTagUrl;
    } else {
      adsRequest.adsResponse = this.controller.getSettings().adsResponse;
    }
    if (this.controller.getSettings().forceNonLinearFullSlot) {
      adsRequest.forceNonLinearFullSlot = true;
    }
    if (this.controller.getSettings().vastLoadTimeout) {
      adsRequest.vastLoadTimeout = this.controller.getSettings().vastLoadTimeout;
    }
    if (this.controller.getSettings().omidMode) {
      window.console.warn('The additional setting `omidMode` has been removed. ' + 'Use `omidVendorAccess` instead.');
    }
    if (this.controller.getSettings().omidVendorAccess) {
      adsRequest.omidAccessModeRules = {};
      var omidVendorValues = this.controller.getSettings().omidVendorAccess;
      Object.keys(omidVendorValues).forEach(function (vendorKey) {
        adsRequest.omidAccessModeRules[vendorKey] = omidVendorValues[vendorKey];
      });
    }
    adsRequest.linearAdSlotWidth = this.controller.getPlayerWidth();
    adsRequest.linearAdSlotHeight = this.controller.getPlayerHeight();
    adsRequest.nonLinearAdSlotWidth = this.controller.getSettings().nonLinearWidth || this.controller.getPlayerWidth();
    adsRequest.nonLinearAdSlotHeight = this.controller.getSettings().nonLinearHeight || this.controller.getPlayerHeight();
    adsRequest.setAdWillAutoPlay(this.controller.adsWillAutoplay());
    adsRequest.setAdWillPlayMuted(this.controller.adsWillPlayMuted());

    // Populate the adsRequestproperties with those provided in the AdsRequest
    // object in the settings.
    var providedAdsRequest = this.controller.getSettings().adsRequest;
    if (providedAdsRequest && _typeof(providedAdsRequest) === 'object') {
      Object.keys(providedAdsRequest).forEach(function (key) {
        adsRequest[key] = providedAdsRequest[key];
      });
    }
    this.adsLoader.requestAds(adsRequest);
    this.controller.playerWrapper.vjsPlayer.trigger({
      type: 'ads-request',
      AdsRequest: adsRequest
    });
  };

  /**
   * Listener for the ADS_MANAGER_LOADED event. Creates the AdsManager,
   * sets up event listeners, and triggers the 'adsready' event for
   * videojs-ads-contrib.
   *
   * @param {google.ima.AdsManagerLoadedEvent} adsManagerLoadedEvent Fired when
   *     the AdsManager loads.
   */
  SdkImpl$1.prototype.onAdsManagerLoaded = function (adsManagerLoadedEvent) {
    this.createAdsRenderingSettings();
    this.adsManager = adsManagerLoadedEvent.getAdsManager(this.controller.getContentPlayheadTracker(), this.adsRenderingSettings);
    this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, this.onAdBreakReady.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this.onAllAdsCompleted.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, this.onAdLoaded.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this.onAdStarted.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, this.onAdComplete.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, this.onAdComplete.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.LOG, this.onAdLog.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, this.onAdPaused.bind(this));
    this.adsManager.addEventListener(google.ima.AdEvent.Type.RESUMED, this.onAdResumed.bind(this));
    this.controller.playerWrapper.vjsPlayer.trigger({
      type: 'ads-manager',
      adsManager: this.adsManager
    });
    if (!this.autoPlayAdBreaks) {
      this.initAdsManager();
    }
    var _this$controller$getS = this.controller.getSettings(),
      preventLateAdStart = _this$controller$getS.preventLateAdStart;
    if (!preventLateAdStart) {
      this.controller.onAdsReady();
    } else if (preventLateAdStart && !this.isAdTimedOut) {
      this.controller.onAdsReady();
    }
    if (this.controller.getSettings().adsManagerLoadedCallback) {
      this.controller.getSettings().adsManagerLoadedCallback();
    }
  };

  /**
   * Listener for errors fired by the AdsLoader.
   * @param {google.ima.AdErrorEvent} event The error event thrown by the
   *     AdsLoader. See
   *     https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdError#.Type
   */
  SdkImpl$1.prototype.onAdsLoaderError = function (event) {
    window.console.warn('AdsLoader error: ' + event.getError());
    this.controller.onErrorLoadingAds(event);
    if (this.adsManager) {
      this.adsManager.destroy();
    }
  };

  /**
   * Initialize the ads manager.
   */
  SdkImpl$1.prototype.initAdsManager = function () {
    try {
      var initWidth = this.controller.getPlayerWidth();
      var initHeight = this.controller.getPlayerHeight();
      this.adsManagerDimensions.width = initWidth;
      this.adsManagerDimensions.height = initHeight;
      this.adsManager.init(initWidth, initHeight);
      this.adsManager.setVolume(this.controller.getPlayerVolume());
      this.initializeAdDisplayContainer();
    } catch (adError) {
      this.onAdError(adError);
    }
  };

  /**
   * Create AdsRenderingSettings for the IMA SDK.
   */
  SdkImpl$1.prototype.createAdsRenderingSettings = function () {
    this.adsRenderingSettings = new google.ima.AdsRenderingSettings();
    this.adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    if (this.controller.getSettings().adsRenderingSettings) {
      for (var setting in this.controller.getSettings().adsRenderingSettings) {
        if (setting !== '') {
          this.adsRenderingSettings[setting] = this.controller.getSettings().adsRenderingSettings[setting];
        }
      }
    }
  };

  /**
   * Listener for errors thrown by the AdsManager.
   * @param {google.ima.AdErrorEvent} adErrorEvent The error event thrown by
   *     the AdsManager.
   */
  SdkImpl$1.prototype.onAdError = function (adErrorEvent) {
    var errorMessage = adErrorEvent.getError !== undefined ? adErrorEvent.getError() : adErrorEvent.stack;
    window.console.warn('Ad error: ' + errorMessage);
    this.adsManager.destroy();
    this.controller.onAdError(adErrorEvent);

    // reset these so consumers don't think we are still in an ad break,
    // but reset them after any prior cleanup happens
    this.adsActive = false;
    this.adPlaying = false;
  };

  /**
   * Listener for AD_BREAK_READY. Passes event on to publisher's listener.
   * @param {google.ima.AdEvent} adEvent AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onAdBreakReady = function (adEvent) {
    this.adBreakReadyListener(adEvent);
  };

  /**
   * Pauses the content video and displays the ad container so ads can play.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onContentPauseRequested = function (adEvent) {
    this.adsActive = true;
    this.adPlaying = true;
    this.controller.onAdBreakStart(adEvent);
  };

  /**
   * Resumes content video and hides the ad container.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onContentResumeRequested = function (adEvent) {
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
   */
  SdkImpl$1.prototype.onAllAdsCompleted = function (adEvent) {
    this.allAdsCompleted = true;
    this.controller.onAllAdsCompleted();
  };

  /**
   * Starts the content video when a non-linear ad is loaded.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onAdLoaded = function (adEvent) {
    if (!adEvent.getAd().isLinear()) {
      this.controller.onNonLinearAdLoad();
      this.controller.playContent();
    }
  };

  /**
   * Starts the interval timer to check the current ad time when an ad starts
   * playing.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onAdStarted = function (adEvent) {
    this.currentAd = adEvent.getAd();
    if (this.currentAd.isLinear()) {
      this.adTrackingTimer = setInterval(this.onAdPlayheadTrackerInterval.bind(this), 250);
      this.controller.onLinearAdStart();
    } else {
      this.controller.onNonLinearAdStart();
    }
  };

  /**
   * Handles an ad click. Puts the player UI in a paused state.
   */
  SdkImpl$1.prototype.onAdPaused = function () {
    this.controller.onAdsPaused();
  };

  /**
   * Syncs controls when an ad resumes.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onAdResumed = function (adEvent) {
    this.controller.onAdsResumed();
  };

  /**
   * Clears the interval timer for current ad time when an ad completes.
   */
  SdkImpl$1.prototype.onAdComplete = function () {
    if (this.currentAd.isLinear()) {
      clearInterval(this.adTrackingTimer);
    }
  };

  /**
   * Handles ad log messages.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
   */
  SdkImpl$1.prototype.onAdLog = function (adEvent) {
    this.controller.onAdLog(adEvent);
  };

  /**
   * Gets the current time and duration of the ad and calls the method to
   * update the ad UI.
   */
  SdkImpl$1.prototype.onAdPlayheadTrackerInterval = function () {
    if (this.adsManager === null) return;
    var remainingTime = this.adsManager.getRemainingTime();
    var duration = this.currentAd.getDuration();
    var currentTime = duration - remainingTime;
    currentTime = currentTime > 0 ? currentTime : 0;
    var totalAds = 0;
    var adPosition;
    if (this.currentAd.getAdPodInfo()) {
      adPosition = this.currentAd.getAdPodInfo().getAdPosition();
      totalAds = this.currentAd.getAdPodInfo().getTotalAds();
    }
    this.controller.onAdPlayheadUpdated(currentTime, remainingTime, duration, adPosition, totalAds);
  };

  /**
   * Called by the player wrapper when content completes.
   */
  SdkImpl$1.prototype.onContentComplete = function () {
    if (this.adsLoader) {
      this.adsLoader.contentComplete();
      this.contentCompleteCalled = true;
    }
    if (this.adsManager && this.adsManager.getCuePoints() && !this.adsManager.getCuePoints().includes(-1) || !this.adsManager) {
      this.controller.onNoPostroll();
    }
    if (this.allAdsCompleted) {
      this.controller.onContentAndAdsCompleted();
    }
  };

  /**
   * Called when the player is disposed.
   */
  SdkImpl$1.prototype.onPlayerDisposed = function () {
    if (this.adTrackingTimer) {
      clearInterval(this.adTrackingTimer);
    }
    if (this.adsManager) {
      this.adsManager.destroy();
      this.adsManager = null;
    }
  };
  SdkImpl$1.prototype.onPlayerReadyForPreroll = function () {
    if (this.autoPlayAdBreaks) {
      this.initAdsManager();
      try {
        this.controller.showAdContainer();
        // Sync ad volume with content volume.
        this.adsManager.setVolume(this.controller.getPlayerVolume());
        this.adsManager.start();
      } catch (adError) {
        this.onAdError(adError);
      }
    }
  };
  SdkImpl$1.prototype.onAdTimeout = function () {
    this.isAdTimedOut = true;
  };
  SdkImpl$1.prototype.onPlayerReady = function () {
    this.initAdObjects();
    if ((this.controller.getSettings().adTagUrl || this.controller.getSettings().adsResponse) && this.controller.getSettings().requestMode === 'onLoad') {
      this.requestAds();
    }
  };
  SdkImpl$1.prototype.onPlayerEnterFullscreen = function () {
    if (this.adsManager) {
      this.adsManager.resize(window.screen.width, window.screen.height);
    }
  };
  SdkImpl$1.prototype.onPlayerExitFullscreen = function () {
    if (this.adsManager) {
      this.adsManager.resize(this.controller.getPlayerWidth(), this.controller.getPlayerHeight());
    }
  };

  /**
   * Called when the player volume changes.
   *
   * @param {number} volume The new player volume.
   */
  SdkImpl$1.prototype.onPlayerVolumeChanged = function (volume) {
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
   * Called when the player wrapper detects that the player has been resized.
   *
   * @param {number} width The post-resize width of the player.
   * @param {number} height The post-resize height of the player.
   */
  SdkImpl$1.prototype.onPlayerResize = function (width, height) {
    if (this.adsManager) {
      this.adsManagerDimensions.width = width;
      this.adsManagerDimensions.height = height;
      /* eslint no-undef: 'error' */
      this.adsManager.resize(width, height);
    }
  };

  /**
   * @return {Object} The current ad.
   */
  SdkImpl$1.prototype.getCurrentAd = function () {
    return this.currentAd;
  };

  /**
   * Listener JSDoc for ESLint. This listener can be passed to
   * setAdBreakReadyListener.
   * @callback listener
   */

  /**
   * Sets the listener to be called to trigger manual ad break playback.
   * @param {listener} listener The listener to be called to trigger manual ad
   *     break playback.
   */
  SdkImpl$1.prototype.setAdBreakReadyListener = function (listener) {
    this.adBreakReadyListener = listener;
  };

  /**
   * @return {boolean} True if an ad is currently playing. False otherwise.
   */
  SdkImpl$1.prototype.isAdPlaying = function () {
    return this.adPlaying;
  };

  /**
   * @return {boolean} True if an ad is currently playing. False otherwise.
   */
  SdkImpl$1.prototype.isAdMuted = function () {
    return this.adMuted;
  };

  /**
   * Pause ads.
   */
  SdkImpl$1.prototype.pauseAds = function () {
    this.adsManager.pause();
    this.adPlaying = false;
  };

  /**
   * Resume ads.
   */
  SdkImpl$1.prototype.resumeAds = function () {
    this.adsManager.resume();
    this.adPlaying = true;
  };

  /**
   * Unmute ads.
   */
  SdkImpl$1.prototype.unmute = function () {
    this.adsManager.setVolume(1);
    this.adMuted = false;
  };

  /**
   * Mute ads.
   */
  SdkImpl$1.prototype.mute = function () {
    this.adsManager.setVolume(0);
    this.adMuted = true;
  };

  /**
   * Set the volume of the ads. 0-1.
   *
   * @param {number} volume The new volume.
   */
  SdkImpl$1.prototype.setVolume = function (volume) {
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
  SdkImpl$1.prototype.initializeAdDisplayContainer = function () {
    if (this.adDisplayContainer) {
      if (!this.adDisplayContainerInitialized) {
        this.adDisplayContainer.initialize();
        this.adDisplayContainerInitialized = true;
      }
    }
  };

  /**
   * Called by publishers in manual ad break playback mode to start an ad
   * break.
   */
  SdkImpl$1.prototype.playAdBreak = function () {
    if (!this.autoPlayAdBreaks) {
      this.controller.showAdContainer();
      // Sync ad volume with content volume.
      this.adsManager.setVolume(this.controller.getPlayerVolume());
      this.adsManager.start();
    }
  };

  /**
   * Callback JSDoc for ESLint. This callback can be passed to addEventListener.
   * @callback callback
   */

  /**
   * Ads an EventListener to the AdsManager. For a list of available events,
   * see
   * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdEvent#.Type
   * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
   *     listen.
   * @param {callback} callback The method to call when the event is fired.
   */
  SdkImpl$1.prototype.addEventListener = function (event, callback) {
    if (this.adsManager) {
      this.adsManager.addEventListener(event, callback);
    }
  };

  /**
   * Returns the instance of the AdsManager.
   * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
   */
  SdkImpl$1.prototype.getAdsManager = function () {
    return this.adsManager;
  };

  /**
   * Reset the SDK implementation.
   */
  SdkImpl$1.prototype.reset = function () {
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
   * The grand coordinator of the plugin. Facilitates communication between all
   * other plugin classes.
   *
   * @param {Object} player Instance of the video.js player.
   * @param {Object} options Options provided by the implementation.
   * @constructor
   * @struct
   * @final
   */
  var Controller = function Controller(player, options) {
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
    this.isMobile = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i);

    /**
     * Whether or not we are running on an iOS platform.
     */
    this.isIos = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i);
    this.initWithSettings(options);

    /**
     * Stores contrib-ads default settings.
     */
    var contribAdsDefaults = {
      debug: this.settings.debug,
      timeout: this.settings.timeout,
      prerollTimeout: this.settings.prerollTimeout
    };
    var adsPluginSettings = Object.assign({}, contribAdsDefaults, options.contribAdsSettings || {});
    this.playerWrapper = new PlayerWrapper$1(player, adsPluginSettings, this);
    this.adUi = new AdUi(this);
    this.sdkImpl = new SdkImpl$1(this);
  };
  Controller.IMA_DEFAULTS = {
    adLabel: 'Advertisement',
    adLabelNofN: 'of',
    debug: false,
    disableAdControls: false,
    prerollTimeout: 1000,
    preventLateAdStart: false,
    requestMode: 'onLoad',
    showControlsForJSAds: true,
    timeout: 5000
  };

  /**
   * Extends the settings to include user-provided settings.
   *
   * @param {Object} options Options to be used in initialization.
   */
  Controller.prototype.initWithSettings = function (options) {
    this.settings = Object.assign({}, Controller.IMA_DEFAULTS, options || {});
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
  Controller.prototype.warnAboutDeprecatedSettings = function () {
    var _this = this;
    var deprecatedSettings = ['adWillAutoplay', 'adsWillAutoplay', 'adWillPlayMuted', 'adsWillPlayMuted'];
    deprecatedSettings.forEach(function (setting) {
      if (_this.settings[setting] !== undefined) {
        console.warn('WARNING: videojs.ima setting ' + setting + ' is deprecated');
      }
    });
  };

  /**
   * Return the settings object.
   *
   * @return {Object} The settings object.
   */
  Controller.prototype.getSettings = function () {
    return this.settings;
  };

  /**
   * Return whether or not we're in a mobile environment.
   *
   * @return {boolean} True if running on mobile, false otherwise.
   */
  Controller.prototype.getIsMobile = function () {
    return this.isMobile;
  };

  /**
   * Return whether or not we're in an iOS environment.
   *
   * @return {boolean} True if running on iOS, false otherwise.
   */
  Controller.prototype.getIsIos = function () {
    return this.isIos;
  };

  /**
   * Inject the ad container div into the DOM.
   *
   * @param{HTMLElement} adContainerDiv The ad container div.
   */
  Controller.prototype.injectAdContainerDiv = function (adContainerDiv) {
    this.playerWrapper.injectAdContainerDiv(adContainerDiv);
  };

  /**
   * @return {HTMLElement} The div for the ad container.
   */
  Controller.prototype.getAdContainerDiv = function () {
    return this.adUi.getAdContainerDiv();
  };

  /**
   * @return {Object} The content player.
   */
  Controller.prototype.getContentPlayer = function () {
    return this.playerWrapper.getContentPlayer();
  };

  /**
   * Returns the content playhead tracker.
   *
   * @return {Object} The content playhead tracker.
   */
  Controller.prototype.getContentPlayheadTracker = function () {
    return this.playerWrapper.getContentPlayheadTracker();
  };

  /**
   * Requests ads.
   */
  Controller.prototype.requestAds = function () {
    this.sdkImpl.requestAds();
  };

  /**
   * Add or modify a setting.
   *
   * @param {string} key Key to modify
   * @param {Object} value Value to set at key.
   */
  Controller.prototype.setSetting = function (key, value) {
    this.settings[key] = value;
  };

  /**
   * Called when there is an error loading ads.
   *
   * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
   */
  Controller.prototype.onErrorLoadingAds = function (adErrorEvent) {
    this.adUi.onAdError();
    this.playerWrapper.onAdError(adErrorEvent);
  };

  /**
   * Called by the ad UI when the play/pause button is clicked.
   */
  Controller.prototype.onAdPlayPauseClick = function () {
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
  Controller.prototype.onAdMuteClick = function () {
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
  Controller.prototype.setVolume = function (volume) {
    this.playerWrapper.setVolume(volume);
    this.sdkImpl.setVolume(volume);
  };

  /**
   * @return {number} The volume of the content player.
   */
  Controller.prototype.getPlayerVolume = function () {
    return this.playerWrapper.getVolume();
  };

  /**
   * Toggle fullscreen state.
   */
  Controller.prototype.toggleFullscreen = function () {
    this.playerWrapper.toggleFullscreen();
  };

  /**
   * Relays ad errors to the player wrapper.
   *
   * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
   */
  Controller.prototype.onAdError = function (adErrorEvent) {
    this.adUi.onAdError();
    this.playerWrapper.onAdError(adErrorEvent);
  };

  /**
   * Handles ad break starting.
   *
   * @param {Object} adEvent The event fired by the IMA SDK.
   */
  Controller.prototype.onAdBreakStart = function (adEvent) {
    this.playerWrapper.onAdBreakStart();
    this.adUi.onAdBreakStart(adEvent);
  };

  /**
   * Show the ad container.
   */
  Controller.prototype.showAdContainer = function () {
    this.adUi.showAdContainer();
  };

  /**
   * Handles ad break ending.
   */
  Controller.prototype.onAdBreakEnd = function () {
    this.playerWrapper.onAdBreakEnd();
    this.adUi.onAdBreakEnd();
  };

  /**
   * Handles when all ads have finished playing.
   */
  Controller.prototype.onAllAdsCompleted = function () {
    this.adUi.onAllAdsCompleted();
    this.playerWrapper.onAllAdsCompleted();
  };

  /**
   * Handles the SDK firing an ad paused event.
   */
  Controller.prototype.onAdsPaused = function () {
    this.adUi.onAdsPaused();
  };

  /**
   * Handles the SDK firing an ad resumed event.
   */
  Controller.prototype.onAdsResumed = function () {
    this.adUi.onAdsResumed();
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
  Controller.prototype.onAdPlayheadUpdated = function (currentTime, remainingTime, duration, adPosition, totalAds) {
    this.adUi.updateAdUi(currentTime, remainingTime, duration, adPosition, totalAds);
  };

  /**
   * Handles ad log messages.
   * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the IMA SDK.
   */
  Controller.prototype.onAdLog = function (adEvent) {
    this.playerWrapper.onAdLog(adEvent);
  };

  /**
   * @return {Object} The current ad.
   */
  Controller.prototype.getCurrentAd = function () {
    return this.sdkImpl.getCurrentAd();
  };

  /**
   * Play content.
   */
  Controller.prototype.playContent = function () {
    this.playerWrapper.play();
  };

  /**
   * Handles when a linear ad starts.
   */
  Controller.prototype.onLinearAdStart = function () {
    this.adUi.onLinearAdStart();
    this.playerWrapper.onAdStart();
  };

  /**
   * Handles when a non-linear ad loads.
   */
  Controller.prototype.onNonLinearAdLoad = function () {
    this.adUi.onNonLinearAdLoad();
  };

  /**
   * Handles when a non-linear ad starts.
   */
  Controller.prototype.onNonLinearAdStart = function () {
    this.adUi.onNonLinearAdLoad();
    this.playerWrapper.onAdStart();
  };

  /**
   * Get the player width.
   *
   * @return {number} The width of the player.
   */
  Controller.prototype.getPlayerWidth = function () {
    return this.playerWrapper.getPlayerWidth();
  };

  /**
   * Get the player height.
   *
   * @return {number} The height of the player.
   */
  Controller.prototype.getPlayerHeight = function () {
    return this.playerWrapper.getPlayerHeight();
  };

  /**
   * Tells the player wrapper that ads are ready.
   */
  Controller.prototype.onAdsReady = function () {
    this.playerWrapper.onAdsReady();
  };

  /**
   * Called when the player wrapper detects that the player has been resized.
   *
   * @param {number} width The post-resize width of the player.
   * @param {number} height The post-resize height of the player.
   */
  Controller.prototype.onPlayerResize = function (width, height) {
    this.sdkImpl.onPlayerResize(width, height);
  };

  /**
   * Called by the player wrapper when content completes.
   */
  Controller.prototype.onContentComplete = function () {
    this.sdkImpl.onContentComplete();
  };

  /**
   * Called by the player wrapper when it's time to play a post-roll but we don't
   * have one to play.
   */
  Controller.prototype.onNoPostroll = function () {
    this.playerWrapper.onNoPostroll();
  };

  /**
   * Called when content and all ads have completed.
   */
  Controller.prototype.onContentAndAdsCompleted = function () {
    for (var index in this.contentAndAdsEndedListeners) {
      if (typeof this.contentAndAdsEndedListeners[index] === 'function') {
        this.contentAndAdsEndedListeners[index]();
      }
    }
  };

  /**
   * Called when the player is disposed.
   */
  Controller.prototype.onPlayerDisposed = function () {
    this.contentAndAdsEndedListeners = [];
    this.sdkImpl.onPlayerDisposed();
  };

  /**
   * Called when the player is ready to play a pre-roll.
   */
  Controller.prototype.onPlayerReadyForPreroll = function () {
    this.sdkImpl.onPlayerReadyForPreroll();
  };

  /**
   * Called if the ad times out.
   */
  Controller.prototype.onAdTimeout = function () {
    this.sdkImpl.onAdTimeout();
  };

  /**
   * Called when the player is ready.
   */
  Controller.prototype.onPlayerReady = function () {
    this.sdkImpl.onPlayerReady();
  };

  /**
   * Called when the player enters fullscreen.
   */
  Controller.prototype.onPlayerEnterFullscreen = function () {
    this.adUi.onPlayerEnterFullscreen();
    this.sdkImpl.onPlayerEnterFullscreen();
  };

  /**
   * Called when the player exits fullscreen.
   */
  Controller.prototype.onPlayerExitFullscreen = function () {
    this.adUi.onPlayerExitFullscreen();
    this.sdkImpl.onPlayerExitFullscreen();
  };

  /**
   * Called when the player volume changes.
   *
   * @param {number} volume The new player volume.
   */
  Controller.prototype.onPlayerVolumeChanged = function (volume) {
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
   */
  Controller.prototype.setContentWithAdTag = function (contentSrc, adTag) {
    this.reset();
    this.settings.adTagUrl = adTag ? adTag : this.settings.adTagUrl;
    this.playerWrapper.changeSource(contentSrc);
  };

  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ads response is
   * used when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?string} adsResponse The ads response to be requested when the
   *     content loads. Leave blank to use the existing ads response.
   */
  Controller.prototype.setContentWithAdsResponse = function (contentSrc, adsResponse) {
    this.reset();
    this.settings.adsResponse = adsResponse ? adsResponse : this.settings.adsResponse;
    this.playerWrapper.changeSource(contentSrc);
  };

  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ads request is
   * used when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?Object} adsRequest The ads request to be requested when the
   *     content loads. Leave blank to use the existing ads request.
   */
  Controller.prototype.setContentWithAdsRequest = function (contentSrc, adsRequest) {
    this.reset();
    this.settings.adsRequest = adsRequest ? adsRequest : this.settings.adsRequest;
    this.playerWrapper.changeSource(contentSrc);
  };

  /**
   * Resets the state of the plugin.
   */
  Controller.prototype.reset = function () {
    this.sdkImpl.reset();
    this.playerWrapper.reset();
    this.adUi.reset();
  };

  /**
   * Listener JSDoc for ESLint. This listener can be passed to
   * (add|remove)ContentEndedListener.
   * @callback listener
   */

  /**
   * Adds a listener for the 'contentended' event of the video player. This should
   * be used instead of setting an 'contentended' listener directly to ensure that
   * the ima can do proper cleanup of the SDK before other event listeners are
   * called.
   * @param {listener} listener The listener to be called when content
   *     completes.
   */
  Controller.prototype.addContentEndedListener = function (listener) {
    this.playerWrapper.addContentEndedListener(listener);
  };

  /**
   * Adds a listener that will be called when content and all ads have
   * finished playing.
   * @param {listener} listener The listener to be called when content and ads
   *     complete.
   */
  Controller.prototype.addContentAndAdsEndedListener = function (listener) {
    this.contentAndAdsEndedListeners.push(listener);
  };

  /**
   * Sets the listener to be called to trigger manual ad break playback.
   * @param {listener} listener The listener to be called to trigger manual ad
   *     break playback.
   */
  Controller.prototype.setAdBreakReadyListener = function (listener) {
    this.sdkImpl.setAdBreakReadyListener(listener);
  };

  /**
   * Changes the flag to show or hide the ad countdown timer.
   *
   * @param {boolean} showCountdownIn Show or hide the countdown timer.
   */
  Controller.prototype.setShowCountdown = function (showCountdownIn) {
    this.adUi.setShowCountdown(showCountdownIn);
    this.showCountdown = showCountdownIn;
    this.adUi.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
  };

  /**
   * Initializes the AdDisplayContainer. On mobile, this must be done as a
   * result of user action.
   */
  Controller.prototype.initializeAdDisplayContainer = function () {
    this.sdkImpl.initializeAdDisplayContainer();
  };

  /**
   * Called by publishers in manual ad break playback mode to start an ad
   * break.
   */
  Controller.prototype.playAdBreak = function () {
    this.sdkImpl.playAdBreak();
  };

  /**
   * Callback JSDoc for ESLint. This callback can be passed to addEventListener.
   * @callback callback
   */

  /**
   * Ads an EventListener to the AdsManager. For a list of available events,
   * see
   * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdEvent#.Type
   * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
   *     listen.
   * @param {callback} callback The method to call when the event is fired.
   */
  Controller.prototype.addEventListener = function (event, callback) {
    this.sdkImpl.addEventListener(event, callback);
  };

  /**
   * Returns the instance of the AdsManager.
   * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
   */
  Controller.prototype.getAdsManager = function () {
    return this.sdkImpl.getAdsManager();
  };

  /**
   * Returns the instance of the player id.
   * @return {string} The player id.
   */
  Controller.prototype.getPlayerId = function () {
    return this.playerWrapper.getPlayerId();
  };

  /**
   * Changes the ad tag. You will need to call requestAds after this method
   * for the new ads to be requested.
   * @param {?string} adTag The ad tag to be requested the next time
   *     requestAds is called.
   */
  Controller.prototype.changeAdTag = function (adTag) {
    this.reset();
    this.settings.adTagUrl = adTag;
  };

  /**
   * Pauses the ad.
   */
  Controller.prototype.pauseAd = function () {
    this.adUi.onAdsPaused();
    this.sdkImpl.pauseAds();
  };

  /**
   * Resumes the ad.
   */
  Controller.prototype.resumeAd = function () {
    this.adUi.onAdsPlaying();
    this.sdkImpl.resumeAds();
  };

  /**
   * Toggles video/ad playback.
   */
  Controller.prototype.togglePlayback = function () {
    this.playerWrapper.togglePlayback();
  };

  /**
   * @return {boolean} true if we expect that ads will autoplay. false otherwise.
   */
  Controller.prototype.adsWillAutoplay = function () {
    if (this.settings.adsWillAutoplay !== undefined) {
      return this.settings.adsWillAutoplay;
    } else if (this.settings.adWillAutoplay !== undefined) {
      return this.settings.adWillAutoplay;
    } else {
      return !!this.playerWrapper.getPlayerOptions().autoplay;
    }
  };

  /**
   * @return {boolean} true if we expect that ads will autoplay. false otherwise.
   */
  Controller.prototype.adsWillPlayMuted = function () {
    if (this.settings.adsWillPlayMuted !== undefined) {
      return this.settings.adsWillPlayMuted;
    } else if (this.settings.adWillPlayMuted !== undefined) {
      return this.settings.adWillPlayMuted;
    } else if (this.playerWrapper.getPlayerOptions().muted !== undefined) {
      return this.playerWrapper.getPlayerOptions().muted;
    } else {
      return this.playerWrapper.getVolume() == 0;
    }
  };

  /**
   * Triggers an event on the VJS player
   * @param  {string} name The event name.
   * @param  {Object} data The event data.
   */
  Controller.prototype.triggerPlayerEvent = function (name, data) {
    this.playerWrapper.triggerPlayerEvent(name, data);
  };

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
   * Wraps the video.js stream player for the plugin.
   *
   * @param {!Object} player Video.js player instance.
   * @param {!Object} adsPluginSettings Settings for the contrib-ads plugin.
   * @param {!DaiController} daiController Reference to the parent controller.
   */
  var PlayerWrapper = function PlayerWrapper(player, adsPluginSettings, daiController) {
    /**
     * Instance of the video.js player.
     */
    this.vjsPlayer = player;

    /**
     * Plugin DAI controller.
     */
    this.daiController = daiController;

    /**
     * Video.js control bar.
     */
    this.vjsControls = this.vjsPlayer.getChild('controlBar');

    /**
     * Vanilla HTML5 video player underneath the video.js player.
     */
    this.h5Player = null;
    this.vjsPlayer.on('dispose', this.playerDisposedListener.bind(this));
    this.vjsPlayer.on('pause', this.onPause.bind(this));
    this.vjsPlayer.on('play', this.onPlay.bind(this));
    this.vjsPlayer.on('seeked', this.onSeekEnd.bind(this));
    this.vjsPlayer.ready(this.onPlayerReady.bind(this));
    if (!this.vjsPlayer.ads) {
      window.console.warn('You may be using a version of videojs-contrib-ads ' + 'that is not compatible with your version of video.js.');
    }
    this.vjsPlayer.ads(adsPluginSettings);
  };

  /**
   * Called in response to the video.js player's 'disposed' event.
   */
  PlayerWrapper.prototype.playerDisposedListener = function () {
    this.contentEndedListeners = [];
    this.daiController.onPlayerDisposed();
  };

  /**
   * Called on the player 'pause' event. Handles displaying controls during
   * paused ad breaks.
   */
  PlayerWrapper.prototype.onPause = function () {
    // This code will run if the stream is paused during an ad break. Since
    // controls are usually hidden during ads, they will now show to allow
    // users to resume ad playback.
    if (this.daiController.isInAdBreak()) {
      this.vjsControls.show();
    }
  };

  /**
   * Called on the player 'play' event. Handles hiding controls during
   * ad breaks while playing.
   */
  PlayerWrapper.prototype.onPlay = function () {
    if (this.daiController.isInAdBreak()) {
      this.vjsControls.hide();
    }
  };

  /**
   * Called on the player's 'seeked' event. Sets up handling for ad break
   * snapback for VOD streams.
   */
  PlayerWrapper.prototype.onSeekEnd = function () {
    this.daiController.onSeekEnd(this.vjsPlayer.currentTime());
  };

  /**
   * Called on the player's 'ready' event to begin initiating IMA.
   */
  PlayerWrapper.prototype.onPlayerReady = function () {
    this.h5Player = document.getElementById(this.getPlayerId()).getElementsByClassName('vjs-tech')[0];
    this.daiController.onPlayerReady();
  };

  /**
   * @return {!Object} The stream player.
   */
  PlayerWrapper.prototype.getStreamPlayer = function () {
    return this.h5Player;
  };

  /**
   * @return {!Object} The video.js player.
   */
  PlayerWrapper.prototype.getVjsPlayer = function () {
    return this.vjsPlayer;
  };

  /**
   * @return {!Object} The vjs player's options object.
   */
  PlayerWrapper.prototype.getPlayerOptions = function () {
    return this.vjsPlayer.options_;
  };

  /**
   * Returns the instance of the player id.
   * @return {string} The player id.
   */
  PlayerWrapper.prototype.getPlayerId = function () {
    return this.vjsPlayer.id();
  };

  /**
   * Handles ad errors.
   *
   * @param {!Object} adErrorEvent The ad error event thrown by the IMA SDK.
   */
  PlayerWrapper.prototype.onAdError = function (adErrorEvent) {
    this.vjsControls.show();
    var errorMessage = adErrorEvent.getError !== undefined ? adErrorEvent.getError() : adErrorEvent.stack;
    this.vjsPlayer.trigger({
      type: 'adserror',
      data: {
        AdError: errorMessage,
        AdErrorEvent: adErrorEvent
      }
    });
  };

  /**
   * Handles ad break starting.
   */
  PlayerWrapper.prototype.onAdBreakStart = function () {
    this.vjsControls.hide();
  };

  /**
   * Handles ad break ending.
   */
  PlayerWrapper.prototype.onAdBreakEnd = function () {
    this.vjsControls.show();
  };

  /**
   * Reset the player.
   */
  PlayerWrapper.prototype.reset = function () {
    this.vjsControls.show();
  };

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
   * @param {DaiController!} daiController Reference to the parent DAI
   * controller.
   *
   * @constructor
   * @struct
   * @final
   */
  var SdkImpl = function SdkImpl(daiController) {
    /**
     * Plugin DAI controller.
     */
    this.daiController = daiController;

    /**
     * The html5 stream player.
     */
    this.streamPlayer = null;

    /**
     * The videoJS stream player.
     */
    this.vjsPlayer = null;

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
    this.isAdBreak = false;

    /**
     * If the stream is currently seeking from a snapback.
     */
    this.isSnapback = false;

    /**
     * Originally seeked to time, to return stream to after ads.
     */
    this.snapForwardTime = 0;

    /**
     * Timed metadata for the stream.
     */
    this.timedMetadata;

    /**
     * Timed metadata record.
     */
    this.metadataLoaded = {};
    this.SOURCE_TYPES = {
      hls: 'application/x-mpegURL',
      dash: 'application/dash+xml'
    };
  };

  /**
   * Creates and initializes the IMA DAI SDK objects.
   */
  SdkImpl.prototype.initImaDai = function () {
    this.streamPlayer = this.daiController.getStreamPlayer();
    this.vjsPlayer = this.daiController.getVjsPlayer();
    this.createAdUiDiv();
    if (this.daiController.getSettings().locale) {
      this.uiSettings.setLocale(this.daiController.getSettings().locale);
    }
    this.streamManager = new google.ima.dai.api.StreamManager(this.streamPlayer, this.adUiDiv, this.uiSettings);
    this.streamPlayer.addEventListener('pause', this.onStreamPause);
    this.streamPlayer.addEventListener('play', this.onStreamPlay);
    this.streamManager.addEventListener([google.ima.dai.api.StreamEvent.Type.LOADED, google.ima.dai.api.StreamEvent.Type.ERROR, google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED], this.onStreamEvent.bind(this), false);
    this.vjsPlayer.textTracks().onaddtrack = this.onAddTrack.bind(this);
    this.vjsPlayer.trigger({
      type: 'stream-manager',
      StreamManager: this.streamManager
    });
    this.requestStream();
  };

  /**
   * Called when the video player has metadata to process.
   * @param {Event!} event The event that triggered this call.
   */
  SdkImpl.prototype.onAddTrack = function (event) {
    var _this = this;
    var track = event.track;
    if (track.kind === 'metadata') {
      track.mode = 'hidden';
      track.addEventListener('cuechange', function (e) {
        var _iterator = _createForOfIteratorHelper(track.activeCues_),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var cue = _step.value;
            var metadata = {};
            metadata[cue.value.key] = cue.value.data;
            _this.streamManager.onTimedMetadata(metadata);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      });
    }
  };

  /**
   * Creates the ad UI container.
   */
  SdkImpl.prototype.createAdUiDiv = function () {
    var uiDiv = document.createElement('div');
    uiDiv.id = 'ad-ui';
    // 3em is the height of the control bar.
    uiDiv.style.height = 'calc(100% - 3em)';
    this.streamPlayer.parentNode.appendChild(uiDiv);
    this.adUiDiv = uiDiv;
  };

  /**
   * Called on pause to update the ad UI.
   */
  SdkImpl.prototype.onStreamPause = function () {
    if (this.isAdBreak) {
      this.adUiDiv.style.display = 'none';
    }
  };

  /**
   * Called on play to update the ad UI.
   */
  SdkImpl.prototype.onStreamPlay = function () {
    if (this.isAdBreak) {
      this.adUiDiv.style.display = 'block';
    }
  };

  /**
   * Called on play to update the ad UI.
   * @param {number} currentTime the current time of the stream.
   */
  SdkImpl.prototype.onSeekEnd = function (currentTime) {
    var streamType = this.daiController.getSettings().streamType;
    if (streamType === 'live') {
      return;
    }
    if (this.isSnapback) {
      this.isSnapback = false;
      return;
    }
    var previousCuePoint = this.streamManager.previousCuePointForStreamTime(currentTime);
    if (previousCuePoint && !previousCuePoint.played) {
      this.isSnapback = true;
      this.snapForwardTime = currentTime;
      this.vjsPlayer.currentTime(previousCuePoint.start);
    }
  };

  /**
   * Handles IMA events.
   * @param {google.ima.StreamEvent!} event the IMA event
   */
  SdkImpl.prototype.onStreamEvent = function (event) {
    switch (event.type) {
      case google.ima.dai.api.StreamEvent.Type.LOADED:
        this.loadUrl(event.getStreamData().url);
        break;
      case google.ima.dai.api.StreamEvent.Type.ERROR:
        window.console.warn('Error loading stream, attempting to play backup ' + 'stream. ' + event.getStreamData().errorMessage);
        this.daiController.onErrorLoadingAds(event);
        if (this.daiController.getSettings().fallbackStreamUrl) {
          this.loadurl(this.daiController.getSettings().fallbackStreamUrl);
        }
        break;
      case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
        this.isAdBreak = true;
        this.adUiDiv.style.display = 'block';
        this.daiController.onAdBreakStart();
        break;
      case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
        this.isAdBreak = false;
        this.adUiDiv.style.display = 'none';
        this.daiController.onAdBreakEnd();
        if (this.snapForwardTime && this.snapForwardTime > this.vjsPlayer.currentTime()) {
          this.vjsPlayer.currentTime(this.snapForwardTime);
          this.snapForwardTime = 0;
        }
        break;
    }
  };

  /**
   * Loads the stream URL .
   * @param {string} streamUrl the URL for the stream being loaded.
   */
  SdkImpl.prototype.loadUrl = function (streamUrl) {
    this.vjsPlayer.ready(function () {
      var streamFormat = this.daiController.getSettings().streamFormat;
      this.vjsPlayer.src({
        src: streamUrl,
        type: this.SOURCE_TYPES[streamFormat]
      });
      var bookmarkTime = this.daiController.getSettings().bookmarkTime;
      if (bookmarkTime) {
        var startTime = this.streamManager.streamTimeForContentTime(bookmarkTime);
        // Seeking on load triggers the onSeekEnd event, so treat this seek as
        // if it's snapback. Without this, resuming at a bookmark kicks you
        // back to the ad before the bookmark.
        this.isSnapback = true;
        this.vjsPlayer.currentTime(startTime);
      }
    }.bind(this));
  };

  /**
   * Creates the AdsRequest and request ads through the AdsLoader.
   */
  SdkImpl.prototype.requestStream = function () {
    var streamRequest;
    var streamType = this.daiController.getSettings().streamType;
    if (streamType === 'vod') {
      streamRequest = new google.ima.dai.api.VODStreamRequest();
      streamRequest.contentSourceId = this.daiController.getSettings().cmsId;
      streamRequest.videoId = this.daiController.getSettings().videoId;
    } else if (streamType === 'live') {
      streamRequest = new google.ima.dai.api.LiveStreamRequest();
      streamRequest.assetKey = this.daiController.getSettings().assetKey;
    } else {
      window.console.warn('No valid stream type selected');
    }
    streamRequest.format = this.daiController.getSettings().streamFormat;
    if (this.daiController.getSettings().apiKey) {
      streamRequest.apiKey = this.daiController.getSettings().apiKey;
    }
    if (this.daiController.getSettings().authToken) {
      streamRequest.authToken = this.daiController.getSettings().authToken;
    }
    if (this.daiController.getSettings().adTagParameters) {
      streamRequest.adTagParameters = this.daiController.getSettings().adTagParameters;
    }
    if (this.daiController.getSettings().streamActivityMonitorId) {
      streamRequest.streamActivityMonitorId = this.daiController.getSettings().streamActivityMonitorId;
    }
    if (this.daiController.getSettings().omidMode) {
      streamRequest.omidAccessModeRules = {};
      var omidValues = this.daiController.getSettings().omidMode;
      if (omidValues.FULL) {
        streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.FULL] = omidValues.FULL;
      }
      if (omidValues.DOMAIN) {
        streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.DOMAIN] = omidValues.DOMAIN;
      }
      if (omidValues.LIMITED) {
        streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.LIMITED] = omidValues.LIMITED;
      }
    }
    this.streamManager.requestStream(streamRequest);
    this.vjsPlayer.trigger({
      type: 'stream-request',
      StreamRequest: streamRequest
    });
  };

  /**
   * Initiates IMA when the player is ready.
   */
  SdkImpl.prototype.onPlayerReady = function () {
    this.initImaDai();
  };

  /**
   * Reset the StreamManager when the player is disposed.
   */
  SdkImpl.prototype.onPlayerDisposed = function () {
    if (this.streamManager) {
      this.streamManager.reset();
    }
  };

  /**
   * Returns the instance of the StreamManager.
   * @return {google.ima.StreamManager!} The StreamManager being used by the
   * plugin.
   */
  SdkImpl.prototype.getStreamManager = function () {
    return this.StreamManager;
  };

  /**
   * Reset the SDK implementation.
   */
  SdkImpl.prototype.reset = function () {
    if (this.StreamManager) {
      this.StreamManager.reset();
    }
  };

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
   * The coordinator for the DAI portion of the plugin. Facilitates
   * communication between all other plugin classes.
   *
   * @param {Object!} player Instance of the video.js player.
   * @param {Object!} options Options provided by the implementation.
   * @constructor
   * @struct
   * @final
   */
  var DaiController = function DaiController(player, options) {
    /**
    * If the stream is currently in an ad break.
    * @type {boolean}
    */
    this.inAdBreak = false;

    /**
    * Stores user-provided settings.
    * @type {Object!}
    */
    this.settings = {};

    /**
    * Whether or not we are running on a mobile platform.
    */
    this.isMobile = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i);

    /**
    * Whether or not we are running on an iOS platform.
    */
    this.isIos = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i);
    this.initWithSettings(options);

    /**
    * Stores contrib-ads default settings.
    */
    var contribAdsDefaults = {
      debug: this.settings.debug,
      timeout: this.settings.timeout,
      prerollTimeout: this.settings.prerollTimeout
    };
    var adsPluginSettings = Object.assign({}, contribAdsDefaults, options.contribAdsSettings || {});
    this.playerWrapper = new PlayerWrapper(player, adsPluginSettings, this);
    this.sdkImpl = new SdkImpl(this);
  };
  DaiController.IMA_DEFAULTS = {
    adLabel: 'Advertisement',
    adLabelNofN: 'of',
    debug: false,
    disableAdControls: false,
    showControlsForJSAds: true
  };

  /**
   * Extends the settings to include user-provided settings.
   *
   * @param {Object!} options Options to be used in initialization.
   */
  DaiController.prototype.initWithSettings = function (options) {
    this.settings = Object.assign({}, DaiController.IMA_DEFAULTS, options || {});
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
  DaiController.prototype.warnAboutDeprecatedSettings = function () {
    var _this = this;
    var deprecatedSettings = [
      // Currently no DAI plugin settings are deprecated.
    ];
    deprecatedSettings.forEach(function (setting) {
      if (_this.settings[setting] !== undefined) {
        console.warn('WARNING: videojs.imaDai setting ' + setting + ' is deprecated');
      }
    });
  };

  /**
   * Return the settings object.
   *
   * @return {Object!} The settings object.
   */
  DaiController.prototype.getSettings = function () {
    return this.settings;
  };

  /**
   * Return whether or not we're in a mobile environment.
   *
   * @return {boolean} True if running on mobile, false otherwise.
   */
  DaiController.prototype.getIsMobile = function () {
    return this.isMobile;
  };

  /**
   * Return whether or not we're in an iOS environment.
   *
   * @return {boolean} True if running on iOS, false otherwise.
   */
  DaiController.prototype.getIsIos = function () {
    return this.isIos;
  };

  /**
   * @return {Object!} The html5 player.
   */
  DaiController.prototype.getStreamPlayer = function () {
    return this.playerWrapper.getStreamPlayer();
  };

  /**
   * @return {Object!} The video.js player.
   */
  DaiController.prototype.getVjsPlayer = function () {
    return this.playerWrapper.getVjsPlayer();
  };

  /**
   * Requests the stream.
   */
  DaiController.prototype.requestStream = function () {
    this.sdkImpl.requestStream();
  };

  /**
   * Add or modify a setting.
   *
   * @param {string} key Key to modify
   * @param {Object!} value Value to set at key.
  */
  DaiController.prototype.setSetting = function (key, value) {
    this.settings[key] = value;
  };

  /**
   * Called when there is an error loading ads.
   *
   * @param {Object!} adErrorEvent The ad error event thrown by the IMA SDK.
   */
  DaiController.prototype.onErrorLoadingAds = function (adErrorEvent) {
    this.playerWrapper.onAdError(adErrorEvent);
  };

  /**
   * Relays ad errors to the player wrapper.
   *
   * @param {Object!} adErrorEvent The ad error event thrown by the IMA SDK.
   */
  DaiController.prototype.onAdError = function (adErrorEvent) {
    this.playerWrapper.onAdError(adErrorEvent);
  };

  /**
   * Signals player that an ad break has started.
   */
  DaiController.prototype.onAdBreakStart = function () {
    this.inAdBreak = true;
    this.playerWrapper.onAdBreakStart();
  };

  /**
   * Signals player that an ad break has ended.
   */
  DaiController.prototype.onAdBreakEnd = function () {
    this.inAdBreak = false;
    this.playerWrapper.onAdBreakEnd();
  };

  /**
   * Called when the player is disposed.
   */
  DaiController.prototype.onPlayerDisposed = function () {
    this.contentAndAdsEndedListeners = [];
    this.sdkImpl.onPlayerDisposed();
  };

  /**
   * Returns if the stream is currently in an ad break.
   * @return {boolean} If the stream is currently in an ad break.
   */
  DaiController.prototype.isInAdBreak = function () {
    return this.inAdBreak;
  };

  /**
   * Called on seek end to check for ad snapback.
   * @param {number} currentTime the current time of the stream.
   */
  DaiController.prototype.onSeekEnd = function (currentTime) {
    this.sdkImpl.onSeekEnd(currentTime);
  };

  /**
   * Called when the player is ready.
   */
  DaiController.prototype.onPlayerReady = function () {
    this.sdkImpl.onPlayerReady();
  };

  /**
   * Resets the state of the plugin.
   */
  DaiController.prototype.reset = function () {
    this.sdkImpl.reset();
    this.playerWrapper.reset();
  };

  /**
   * Adds an EventListener to the StreamManager. For a list of available events,
   * see
   * https://developers.google.com/ad-manager/dynamic-ad-insertion/sdk/html5/reference/js/StreamEvent
   * @param {google.ima.StreamEvent.Type!} event The AdEvent.Type for which to
   *     listen.
   * @param {callback!} callback The method to call when the event is fired.
   */
  DaiController.prototype.addEventListener = function (event, callback) {
    this.sdkImpl.addEventListener(event, callback);
  };

  /**
   * Returns the instance of the StreamManager.
   * @return {google.ima.StreamManager!} The StreamManager being used by the
   * plugin.
   */
  DaiController.prototype.getStreamManager = function () {
    return this.sdkImpl.getStreamManager();
  };

  /**
   * Returns the instance of the player id.
   * @return {string} The player id.
   */
  DaiController.prototype.getPlayerId = function () {
    return this.playerWrapper.getPlayerId();
  };

  /**
   * @return {boolean} true if we expect that the stream will autoplay. false
   * otherwise.
   */
  DaiController.prototype.streamWillAutoplay = function () {
    if (this.settings.streamWillAutoplay !== undefined) {
      return this.settings.streamWillAutoplay;
    } else {
      return !!this.playerWrapper.getPlayerOptions().autoplay;
    }
  };

  /**
   * Triggers an event on the VJS player
   * @param  {string} name The event name.
   * @param  {Object!} data The event data.
   */
  DaiController.prototype.triggerPlayerEvent = function (name, data) {
    this.playerWrapper.triggerPlayerEvent(name, data);
  };

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
  var ImaPlugin = function ImaPlugin(player, options) {
    this.controller = new Controller(player, options);

    /**
     * Listener JSDoc for ESLint. This listener can be passed to
     * addContent(AndAds)EndedListener.
     * @callback listener
     */

    /**
     * Adds a listener that will be called when content and all ads have
     * finished playing.
     * @param {listener} listener The listener to be called when content and ads
     *     complete.
     */
    this.addContentAndAdsEndedListener = function (listener) {
      this.controller.addContentAndAdsEndedListener(listener);
    }.bind(this);

    /**
     * Adds a listener for the 'contentended' event of the video player. This
     * should be used instead of setting an 'contentended' listener directly to
     * ensure that the ima can do proper cleanup of the SDK before other event
     * listeners are called.
     * @param {listener} listener The listener to be called when content
     *     completes.
     */
    this.addContentEndedListener = function (listener) {
      this.controller.addContentEndedListener(listener);
    }.bind(this);

    /**
     * Callback JSDoc for ESLint. This callback can be passed to addEventListener.
     * @callback callback
     */

    /**
     * Ads an EventListener to the AdsManager. For a list of available events,
     * see
     * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdEvent#.Type
     * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
     *     listen.
     * @param {callback} callback The method to call when the event is fired.
     */
    this.addEventListener = function (event, callback) {
      this.controller.addEventListener(event, callback);
    }.bind(this);

    /**
     * Changes the ad tag. You will need to call requestAds after this method
     * for the new ads to be requested.
     * @param {?string} adTag The ad tag to be requested the next time requestAds
     *     is called.
     */
    this.changeAdTag = function (adTag) {
      this.controller.changeAdTag(adTag);
    }.bind(this);

    /**
     * Returns the instance of the AdsManager.
     * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
     */
    this.getAdsManager = function () {
      return this.controller.getAdsManager();
    }.bind(this);

    /**
     * Initializes the AdDisplayContainer. On mobile, this must be done as a
     * result of user action.
     */
    this.initializeAdDisplayContainer = function () {
      this.controller.initializeAdDisplayContainer();
    }.bind(this);

    /**
     * Pauses the ad.
     */
    this.pauseAd = function () {
      this.controller.pauseAd();
    }.bind(this);

    /**
     * Called by publishers in manual ad break playback mode to start an ad
     * break.
     */
    this.playAdBreak = function () {
      this.controller.playAdBreak();
    }.bind(this);

    /**
     * Creates the AdsRequest and request ads through the AdsLoader.
     */
    this.requestAds = function () {
      this.controller.requestAds();
    }.bind(this);

    /**
     * Resumes the ad.
     */
    this.resumeAd = function () {
      this.controller.resumeAd();
    }.bind(this);

    /**
     * Sets the listener to be called to trigger manual ad break playback.
     * @param {listener} listener The listener to be called to trigger manual ad
     *     break playback.
     */
    this.setAdBreakReadyListener = function (listener) {
      this.controller.setAdBreakReadyListener(listener);
    }.bind(this);

    /**
     * Sets the content of the video player. You should use this method instead
     * of setting the content src directly to ensure the proper ad tag is
     * requested when the video content is loaded.
     * @param {?string} contentSrc The URI for the content to be played. Leave
     *     blank to use the existing content.
     * @param {?string} adTag The ad tag to be requested when the content loads.
     *     Leave blank to use the existing ad tag.
     */
    this.setContentWithAdTag = function (contentSrc, adTag) {
      this.controller.setContentWithAdTag(contentSrc, adTag);
    }.bind(this);

    /**
     * Sets the content of the video player. You should use this method instead
     * of setting the content src directly to ensure the proper ads response is
     * used when the video content is loaded.
     * @param {?string} contentSrc The URI for the content to be played. Leave
     *     blank to use the existing content.
     * @param {?string} adsResponse The ads response to be requested when the
     *     content loads. Leave blank to use the existing ads response.
     */
    this.setContentWithAdsResponse = function (contentSrc, adsResponse) {
      this.controller.setContentWithAdsResponse(contentSrc, adsResponse);
    }.bind(this);

    /**
     * Sets the content of the video player. You should use this method instead
     * of setting the content src directly to ensure the proper ads request is
     * used when the video content is loaded.
     * @param {?string} contentSrc The URI for the content to be played. Leave
     *     blank to use the existing content.
     * @param {?Object} adsRequest The ads request to be requested when the
     *     content loads. Leave blank to use the existing ads request.
     */
    this.setContentWithAdsRequest = function (contentSrc, adsRequest) {
      this.controller.setContentWithAdsRequest(contentSrc, adsRequest);
    }.bind(this);

    /**
     * Changes the flag to show or hide the ad countdown timer.
     *
     * @param {boolean} showCountdownIn Show or hide the countdown timer.
     */
    this.setShowCountdown = function (showCountdownIn) {
      this.controller.setShowCountdown(showCountdownIn);
    }.bind(this);
  };

  /**
   * Exposes the ImaDaiPlugin to a publisher implementation.
   *
   * @param {Object} player Instance of the video.js player to which this plugin
   *     will be added.
   * @param {Object} options Options provided by the implementation.
   * @constructor
   * @struct
   * @final
   */
  var ImaDaiPlugin = function ImaDaiPlugin(player, options) {
    this.controller = new DaiController(player, options);

    /**
     * Adds a listener that will be called when content and all ads in the
     * stream have finished playing. VOD stream only.
     * @param {listener} listener The listener to be called when content and ads
     *     complete.
     */
    this.streamEndedListener = function (listener) {
      this.controller.addStreamEndedListener(listener);
    }.bind(this);

    /**
     * Adds an EventListener to the StreamManager.
     * @param {google.ima.StreamEvent.Type} event The StreamEvent.Type for which
     * to listen.
     * @param {callback} callback The method to call when the event is fired.
     */
    this.addEventListener = function (event, callback) {
      this.controller.addEventListener(event, callback);
    }.bind(this);

    /**
     * Returns the instance of the StreamManager.
     * @return {google.ima.StreamManager} The StreamManager being used by the
     * plugin.
     */
    this.getStreamManager = function () {
      return this.controller.getStreamManager();
    }.bind(this);
  };

  /**
   * Initializes the plugin for client-side ads.
   * @param {Object} options Plugin option set on initiation.
   */
  var init = function init(options) {
    /* eslint no-invalid-this: 'off' */
    this.ima = new ImaPlugin(this, options);
  };

  /**
   * LiveStream class used for DAI live streams.
   */
  var LiveStream = /*#__PURE__*/_createClass(
  /**
   * LiveStream class constructor used for DAI live streams.
   * @param {string} streamFormat stream format, plugin currently supports only
   * 'hls' streams.
   * @param {string} assetKey live stream's asset key.
   */
  function LiveStream(streamFormat, assetKey) {
    _classCallCheck(this, LiveStream);
    streamFormat = streamFormat.toLowerCase();
    if (streamFormat !== 'hls' && streamFormat !== 'dash') {
      window.console.error('VodStream error: incorrect streamFormat.');
      return;
    } else if (streamFormat === 'dash') {
      window.console.error('streamFormat error: DASH streams are not' + 'currently supported by this plugin.');
      return;
    } else if (typeof assetKey !== 'string') {
      window.console.error('assetKey error: value must be string.');
      return;
    }
    this.streamFormat = streamFormat;
    this.assetKey = assetKey;
  });
  /**
   * VodStream class used for DAI VOD streams.
   */
  var VodStream = /*#__PURE__*/_createClass(
  /**
   * VodStream class constructor used for DAI VOD streams.
   * @param {string} streamFormat stream format, plugin currently supports only
   * 'hls' streams.
   * @param {string} cmsId VOD stream's CMS ID.
   * @param {string} videoId VOD stream's video ID.
   */
  function VodStream(streamFormat, cmsId, videoId) {
    _classCallCheck(this, VodStream);
    streamFormat = streamFormat.toLowerCase();
    if (streamFormat !== 'hls' && streamFormat !== 'dash') {
      window.console.error('VodStream error: incorrect streamFormat.');
      return;
    } else if (streamFormat === 'dash') {
      window.console.error('streamFormat error: DASH streams are not' + 'currently supported by this plugin.');
      return;
    } else if (typeof cmsId !== 'string') {
      window.console.error('cmsId error: value must be string.');
      return;
    } else if (typeof videoId !== 'string') {
      window.console.error('videoId error: value must be string.');
      return;
    }
    this.streamFormat = streamFormat;
    this.cmsId = cmsId;
    this.videoId = videoId;
  });
  /**
   * Initializes the plugin for DAI ads.
   * @param {Object} stream Accepts either an instance of the LiveStream or
   * VodStream classes.
   * @param {Object} options Plugin option set on initiation.
   */
  var initDai = function initDai(stream, options) {
    if (stream instanceof LiveStream) {
      options.streamType = 'live';
      options.assetKey = stream.assetKey;
    } else if (stream instanceof VodStream) {
      options.streamType = 'vod';
      options.cmsId = stream.cmsId;
      options.videoId = stream.videoId;
    } else {
      window.console.error('initDai() first parameter must be an instance of LiveStream or ' + 'VodStream.');
      return;
    }
    options.streamFormat = stream.streamFormat;
    /* eslint no-invalid-this: 'off' */
    this.imaDai = new ImaDaiPlugin(this, options);
  };
  var registerPlugin = videojs.registerPlugin || videojs.plugin;
  registerPlugin('ima', init);
  registerPlugin('imaDai', initDai);

  exports.LiveStream = LiveStream;
  exports.VodStream = VodStream;
  exports.default = ImaPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
