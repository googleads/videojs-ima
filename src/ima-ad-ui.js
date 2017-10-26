/**
 * Copyright 2014 Google Inc.
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

/* 
 * Implementation of an ad UI for the IMA Video.js Plugin.
 *
 * @constructor
 */
var ImaAdUi = function(imaPlugin) {

  /**
   * Instance of the IMA plugin. Used to access settings and global state.
   * @private {Object}
   */
  this.plugin_ = imaPlugin;

  /**
   * Used to prefix CSS classes and IDs.
   * @priavte {string}
   */
  this.controlPrefix_ = (this.plugin_.settings.id + '_') || '';

  /**
   * Div used to display ad controls.
   * @private {Element}
   */
  this.controlsDiv_;

  /**
   * Div used to display ad countdown timer.
   * @private {Element}
   */
  this.countdownDiv_;

  /**
   * Div used to display add seek bar.
   * @private {Element}
   */
  this.seekBarDiv_;

  /**
   * Div used to display ad progress (in seek bar).
   * @private {Element}
   */
  this.progressDiv_;

  /**
   * Div used to display ad play/pause button.
   * @private {Element}
   */
  this.playPauseDiv_;

  /**
   * Div used to display ad mute button.
   * @private {Element}
   */
  this.muteDiv_;

  /**
   * Div used by the volume slider.
   * @private {Element}
   */
  this.sliderDiv_;

  /**
   * Volume slider level visuals.
   * @private {Element}
   */
  this.sliderLevelDiv_;

  /**
   * Div used to display ad fullscreen button.
   * @private {Element}
   */
  this.fullscreenDiv_

  /**
   * Boolean flag to show or hide the ad countdown timer.
   * @private {boolean}
   */
  this.showCountdown_ =
      this.plugin_.settings['showCountdown'] == false ? false : true;
}


/**
 * Assigns the unique id and class names to the given element as well as the
 * style class.
 * @param element
 * @param controlName
 * @private
 */
ImaAdUi.prototype.assignControlAttributes_ = function(element, controlName) {
  element.id = this.controlPrefix_ + controlName;
  element.className = this.controlPrefix_ + controlName + ' ' + controlName;
};


/**
 * Creates the controls for the ad.
 * @private
 */
ImaAdUi.prototype.createControls_ = function() {
  this.controlsDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.controlsDiv_, 'ima-controls-div');
  this.controlsDiv_.style.width = '100%';
  this.countdownDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.countdownDiv_, 'ima-countdown-div');
  this.countdownDiv_.innerHTML = this.plugin_.settings.adLabel;
  this.countdownDiv_.style.display = this.showCountdown_ ? 'block' : 'none';
  this.seekBarDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.seekBarDiv_, 'ima-seek-bar-div');
  this.seekBarDiv_.style.width = '100%';
  this.progressDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.progressDiv_, 'ima-progress-div');
  this.playPauseDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.playPauseDiv_, 'ima-play-pause-div');
  addClass_(this.playPauseDiv_, 'ima-playing');
  this.playPauseDiv_.addEventListener(
      'click',
      this.onAdPlayPauseClick_.bind(this),
      false);
  this.muteDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.muteDiv_, 'ima-mute-div');
  addClass_(this.muteDiv_, 'ima-non-muted');
  this.muteDiv_.addEventListener(
      'click',
      onAdMuteClick_,
      false);
  this.sliderDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.sliderDiv_, 'ima-slider-div');
  this.sliderDiv_.addEventListener(
      'mousedown',
      onAdVolumeSliderMouseDown_,
      false);
  this.sliderLevelDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.sliderLevelDiv_, 'ima-slider-level-div');
  this.fullscreenDiv_ = document.createElement('div');
  this.assignControlAttributes_(this.fullscreenDiv_, 'ima-fullscreen-div');
  addClass_(this.fullscreenDiv_, 'ima-non-fullscreen');
  this.fullscreenDiv_.addEventListener(
      'click',
      onAdFullscreenClick_,
      false);
  this.plugin_.adContainerDiv.appendChild(this.controlsDiv);
  this.controlsDiv_.appendChild(this.countdownDiv_);
  this.controlsDiv_.appendChild(this.seekBarDiv_);
  this.controlsDiv_.appendChild(this.playPauseDiv_);
  this.controlsDiv_.appendChild(this.muteDiv_);
  this.controlsDiv_.appendChild(this.sliderDiv_);
  this.controlsDiv_.appendChild(this.fullscreenDiv_);
  this.seekBarDiv.appendChild(this.progressDiv_);
  this.sliderDiv.appendChild(this.sliderLevelDiv_);
};


/**
 * Hide the ad controls.
 * @private
 */
ImaAdUi.prototype.hideAdControls_ = function() {
  this.controlsDiv_.style.height = '14px';
  this.playPauseDiv_.style.display = 'none';
  this.muteDiv_.style.display = 'none';
  this.sliderDiv_.style.display = 'none';
  this.fullscreenDiv_.style.display = 'none';
};

/**
 * Shows ad controls on mouseover.
 * @private
 */
ImaAdUi.prototype.showAdControls_ = function() {
  this.controlsDiv_.style.height = '37px';
  this.playPauseDiv_.style.display = 'block';
  this.muteDiv_.style.display = 'block';
  this.sliderDiv_.style.display = 'block';
  this.fullscreenDiv_.style.display = 'block';
};


/**
 * Listener for clicks on the play/pause button during ad playback.
 * @private
 */
ImaAdUi.prototype.onAdPlayPauseClick_ = function() {
  if (this.adPlaying) {
    showPlayButton();
    this.adsManager.pause();
    this.adPlaying = false;
  } else {
    showPauseButton();
    this.adsManager.resume();
    this.adPlaying = true;
  }
}.bind(this);


/**
 * Set the flag for showing the ad countdown timer.
 * @param {boolean} showCountdown
 */
ImaAdUi.prototype.setShowCountdown(showCountdown) {
  this.showCountdown_ = showCountdown;
  this.countdownDiv_.style.display = this.showCountdown_ ? 'block' : 'none';
}