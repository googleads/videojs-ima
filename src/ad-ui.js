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
   * Listener to be called to trigger manual ad break playback.
   */
  this.adBreakReadyListener = undefined;

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
  this.assignControlAttributes(
      this.controller.this.adContainerDiv, 'ima-ad-container');
  this.adContainerDiv.style.position = "absolute";
  this.adContainerDiv.style.zIndex = 1111;
  this.adContainerDiv.addEventListener(
      'mouseenter',
      showAdControls_,
      false);
  this.adContainerDiv.addEventListener(
      'mouseleave',
      hideAdControls_,
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
  this.countdownDiv.innerHTML = this.settings.adLabel;
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
var onAdFullscreenClick_ = function() {
  this.controller.toggleFullscreen();
};


/**
 * Show pause and hide play button
 */
AdUi.prototype.onAdsPaused = function() {
  this.addClass_(this.playPauseDiv, 'ima-paused');
  this.removeClass_(this.playPauseDiv, 'ima-playing');
};


/**
 * Show play and hide pause button
 */
AdUi.prototype.onAdsResumed = function() {
  this.addClass_(this.playPauseDiv, 'ima-playing');
  this.removeClass_(this.playPauseDiv, 'ima-paused');
};

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
Adui.prototype.changeVolume_ = function(event) {
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
}
