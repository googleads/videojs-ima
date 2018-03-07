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
const PlayerWrapper = function(player, adsPluginSettings, controller) {
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
   * Stores data for the content playhead tracker.
   */
  this.contentPlayheadTracker = {
    currentTime: 0,
    previousTime: 0,
    seeking: false,
    duration: 0,
  };

  /**
   * Player dimensions. Used in our resize check.
   */
  this.vjsPlayerDimensions = {
    width: this.getPlayerWidth(),
    height: this.getPlayerHeight(),
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
          this.controller.getSettings().id).getElementsByClassName(
              'vjs-tech')[0];

  // Detect inline options
  if (this.h5Player.hasAttribute('autoplay')) {
    this.controller.setSetting('adWillAutoPlay', true);
  }

  this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
  this.boundContentEndedListener = this.localContentEndedListener.bind(this);
  this.vjsPlayer.on('ended', this.boundContentEndedListener);
  this.vjsPlayer.on('dispose', this.playerDisposedListener.bind(this));
  this.vjsPlayer.on('readyforpreroll', this.onReadyForPreroll.bind(this));
  this.vjsPlayer.ready(this.onPlayerReady.bind(this));

  this.vjsPlayer.ads(adsPluginSettings);
};


/**
 * Set up the intervals we use on the player.
 */
PlayerWrapper.prototype.setUpPlayerIntervals = function() {
  this.updateTimeIntervalHandle =
      setInterval(this.updateCurrentTime.bind(this), this.updateTimeInterval);
  this.seekCheckIntervalHandle =
      setInterval(this.checkForSeeking.bind(this), this.seekCheckInterval);
  this.resizeCheckIntervalHandle =
      setInterval(this.checkForResize.bind(this), this.resizeCheckInterval);
};

/**
 * Updates the current time of the video
 */
PlayerWrapper.prototype.updateCurrentTime = function() {
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
PlayerWrapper.prototype.checkForSeeking = function() {
  const tempCurrentTime = this.vjsPlayer.currentTime();
  const diff =
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
 */
PlayerWrapper.prototype.checkForResize = function() {
  const currentWidth = this.getPlayerWidth();
  const currentHeight = this.getPlayerHeight();

  if (currentWidth != this.vjsPlayerDimensions.width ||
      currentHeight != this.vjsPlayerDimensions.height) {
    this.vjsPlayerDimensions.width = currentWidth;
    this.vjsPlayerDimensions.height = currentHeight;
    this.controller.onPlayerResize(currentWidth, currentHeight);
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

  for (let index in this.contentEndedListeners) {
    if (typeof this.contentEndedListeners[index] === 'function') {
      this.contentEndedListeners[index]();
    }
  }

  clearInterval(this.updateTimeIntervalHandle);
  clearInterval(this.seekCheckIntervalHandle);
  clearInterval(this.resizeCheckIntervalHandle);
  if (this.vjsPlayer.el()) {
    this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
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

  const intervalsToClear = [
    this.updateTimeIntervalHandle,
    this.seekCheckIntervalHandle,
    this.resizeCheckIntervalHandle];
  for (let index in intervalsToClear) {
    if (intervalsToClear[index]) {
      clearInterval(intervalsToClear[index]);
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
  // Sync ad volume with player volume.
  this.onVolumeChange();
  this.vjsPlayer.on('fullscreenchange', this.onFullscreenChange.bind(this));
  this.vjsPlayer.on('volumechange', this.onVolumeChange.bind(this));
};


/**
 * Listens for the video.js player to change its fullscreen status. This
 * keeps the fullscreen-ness of the AdContainer in sync with the player.
 */
PlayerWrapper.prototype.onFullscreenChange = function() {
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
PlayerWrapper.prototype.onVolumeChange = function() {
  const newVolume = this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
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
};


/**
 * @return {number} The volume, 0-1.
 */
PlayerWrapper.prototype.getVolume = function() {
  return this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
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
 *
 * @return {number} The player's width.
 */
PlayerWrapper.prototype.getPlayerWidth = function() {
  const boundingRect = this.vjsPlayer.el().getBoundingClientRect() || {};

  return parseInt(boundingRect.width, 10) || this.vjsPlayer.width();
};


/**
 * Get the player height.
 *
 * @return {number} The player's height.
 */
PlayerWrapper.prototype.getPlayerHeight = function() {
  const boundingRect = this.vjsPlayer.el().getBoundingClientRect() || {};

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
 *
 * @return {Object} The content playhead tracker.
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
  const errorMessage =
      adErrorEvent.getError !== undefined ?
          adErrorEvent.getError() : adErrorEvent.stack;
  this.vjsPlayer.trigger({type: 'adserror', data: {
    AdError: errorMessage,
    AdErrorEvent: adErrorEvent,
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
 */
PlayerWrapper.prototype.changeSource = function(contentSrc, playOnLoad) {
  // Only try to pause the player when initialised with a source already
  if (this.vjsPlayer.currentSrc()) {
    this.vjsPlayer.currentTime(0);
    this.vjsPlayer.pause();
  }
  if (contentSrc) {
    this.vjsPlayer.src(contentSrc);
  }
  if (playOnLoad) {
    this.vjsPlayer.one('loadedmetadata', this.playContentFromZero.bind(this));
  } else {
    this.vjsPlayer.one('loadedmetadata', this.seekContentToZero.bind(this));
  }
};

/**
 * Seeks content to 00:00:00. This is used as an event handler for the
 * loadedmetadata event, since seeking is not possible until that event has
 * fired.
 */
PlayerWrapper.prototype.seekContentToZero = function() {
  this.vjsPlayer.currentTime(0);
};

/**
 * Seeks content to 00:00:00 and starts playback. This is used as an event
 * handler for the loadedmetadata event, since seeking is not possible until
 * that event has fired.
 */
PlayerWrapper.prototype.playContentFromZero = function() {
  this.vjsPlayer.currentTime(0);
  this.vjsPlayer.play();
};


/**
 * Listener JSDoc for ESLint. This listener can be passed to
 * addContentEndedListener.
 * @callback listener
 */


/**
 * Adds a listener for the 'ended' event of the video player. This should be
 * used instead of setting an 'ended' listener directly to ensure that the
 * ima can do proper cleanup of the SDK before other event listeners
 * are called.
 * @param {listener} listener The listener to be called when content
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

export default PlayerWrapper;
