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
  * @param {Object} player Video.js player instance.
  * @param {Object} adsPluginSettings Settings for the contrib-ads plugin.
  * @param {DaiController} daiController Reference to the parent controller.
  */
const PlayerWrapper = function(player, adsPluginSettings, daiController) {
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
  this.vjsPlayer.ready(this.onPlayerReady.bind(this));

  if (this.controller.getSettings().requestMode === 'onPlay') {
    this.vjsPlayer.one('play',
    this.controller.requestAds.bind(this.controller));
  }

  this.vjsPlayer.ads(adsPluginSettings);
};

/**
 * Detects when the video.js player has been disposed.
 */
PlayerWrapper.prototype.playerDisposedListener = function() {
  this.contentEndedListeners = [];
  this.controller.onPlayerDisposed();
};

/**
 * Called when the player fires its 'ready' event.
 */
PlayerWrapper.prototype.onPlayerReady = function() {
  this.h5Player =
      document.getElementById(
          this.getPlayerId()).getElementsByClassName(
              'vjs-tech')[0];

  // Sync ad volume with player volume.
  this.onVolumeChange();
  this.vjsPlayer.on('volumechange', this.onVolumeChange.bind(this));

  this.controller.onPlayerReady();
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
 * @param{HTMLElement} adUi The ad UI div.
 */
 PlayerWrapper.prototype.injectAdContainerDiv = function(adUi) {
  this.vjsControls.el().parentNode.appendChild(adUi);
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
 * Play the stream.
 */
PlayerWrapper.prototype.play = function() {
  this.vjsPlayer.play();
};

/**
 * Toggles playback of the stream.
 */
PlayerWrapper.prototype.togglePlayback = function() {
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
PlayerWrapper.prototype.getPlayerWidth = function() {
  let width = (getComputedStyle(this.vjsPlayer.el()) || {}).width;

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
PlayerWrapper.prototype.getPlayerHeight = function() {
  let height = (getComputedStyle(this.vjsPlayer.el()) || {}).height;

  if (!height || parseFloat(height) === 0) {
    height = (this.vjsPlayer.el().getBoundingClientRect() || {}).height;
  }

  return parseFloat(height) || this.vjsPlayer.height();
};

/**
 * @return {Object} The vjs player's options object.
 */
PlayerWrapper.prototype.getPlayerOptions = function() {
  return this.vjsPlayer.options_;
};

/**
 * Returns the instance of the player id.
 * @return {string} The player id.
 */
PlayerWrapper.prototype.getPlayerId = function() {
  return this.vjsPlayer.id();
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
 */
PlayerWrapper.prototype.onAdBreakStart = function() {
  this.contentSource = this.vjsPlayer.currentSrc();
  this.contentSourceType = this.vjsPlayer.currentType();
  this.vjsPlayer.ads.startLinearAdMode();
  this.vjsControls.hide();
  this.vjsPlayer.pause();
};

/**
 * Handles ad break ending.
 */
PlayerWrapper.prototype.onAdBreakEnd = function() {
  if (this.vjsPlayer.ads.inAdBreak()) {
    this.vjsPlayer.ads.endLinearAdMode();
  }
  this.vjsControls.show();
};

/**
 * Reset the player.
 */
PlayerWrapper.prototype.reset = function() {
  this.vjsControls.show();
};

export default PlayerWrapper;
