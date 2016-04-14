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

(function(vjs) {
  'use strict';
  var extend = function(obj) {
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

  var translations = {
    da : {
      "Advertisement": "Annonce"
    },
    de : {
      "Advertisement": "Werbung"
    },
    get: function(label, locale) {
      return this[locale] && this[locale][label] || label;
    }
  };

  var ima_defaults = {
    debug: false,
    timeout: 5000,
    prerollTimeout: 100
  };

  var init = function(options, readyCallback) {
    this.ima = new ImaPlugin(this, options, readyCallback);
  };

  var ImaPlugin = function(player, options, readyCallback) {
    this.player = player;
    /**
     * Current plugin version.
     */
    this.VERSION = '0.2.0';

    /**
     * Stores user-provided settings.
     */
    this.settings;

    /**
     * Video element playing content.
     */
    this.contentPlayer;

    /**
     * Boolean flag to show or hide the ad countdown timer.
     */
    this.showCountdown;

    /**
     * Boolena flag to enable manual ad break playback.
     */
    this.autoPlayAdBreaks;

    /**
     * Video.js control bar.
     */
    this.vjsControls;

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
     * Current IMA SDK Ad.
     */
    this.currentAd;

    /**
     * Timer used to track content progress.
     */
    this.contentTrackingTimer;

    /**
     * Timer used to track ad progress.
     */
    this.adTrackingTimer;

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
     * True if our content video has completed, false otherwise.
     */
    this.contentComplete = false;

    /**
     * True if ALL_ADS_COMPLETED has fired, false until then.
     */
    var allAdsCompleted = false;

    /**
     * Handle to interval that repeatedly updates current time.
     */
    this.updateTimeIntervalHandle;

    /**
     * Handle to interval that repeatedly checks for seeking.
     */
    this.seekCheckIntervalHandle;

    /**
     * Interval (ms) on which to check if the user is seeking through the
     * content.
     */
    this.seekCheckInterval = 1000;

    /**
     * Handle to interval that repeatedly checks for player resize.
     */
    this.resizeCheckIntervalHandle;

    /**
     * Interval (ms) to check for player resize for fluid support.
     */
    this.resizeCheckInterval = 250;
    
    /**
     * Check if on mobile
     */
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    /**
     * Threshold by which to judge user seeking. We check every 1000 ms to see
     * if the user is seeking. In order for us to decide that they are *not*
     * seeking, the content video playhead must only change by 900-1100 ms
     * between checks. Any greater change and we assume the user is seeking
     * through the video.
     */
    this.seekThreshold = 100;

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
     * Stores the dimensions for the ads manager.
     */
    this.adsManagerDimensions = {
      width: 0,
      height: 0
    };

    /**
     * Content ended listeners passed by the publisher to the plugin. Publishers
     * should allow the plugin to handle content ended to ensure proper support
     * of custom ad playback.
     */
    this.contentEndedListeners = [];

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
     * Listener to be called to trigger manual ad break playback.
     */
    this.adBreakReadyListener = undefined;

    /**
     * Local content ended listener for contentComplete.
     */
    this.localContentEndedListener_ = function() {
      if (this.adsLoader && !this.contentComplete) {
        this.adsLoader.contentComplete();
        this.contentComplete = true;
      }
      for (var index in this.contentEndedListeners) {
        this.contentEndedListeners[index]();
      }
      if (this.allAdsCompleted) {
        for (var index in this.contentAndAdsEndedListeners) {
          this.contentAndAdsEndedListeners[index]();
        }
      }
      clearInterval(this.updateTimeIntervalHandle);
      clearInterval(this.seekCheckIntervalHandle);
      clearInterval(this.resizeCheckIntervalHandle);
      this.player.one('play', this.setUpPlayerIntervals_);
    }.bind(this);

    /**
     * Creates the ad container passed to the IMA SDK.
     * @private
     */
    var createAdContainer = function() {
      // The adContainerDiv is the DOM of the element that will house
      // the ads and ad controls.
      this.vjsControls = player.getChild('controlBar');
      this.adContainerDiv =
        this.vjsControls.el().parentNode.appendChild(
          document.createElement('div'));
      this.adContainerDiv.className = 'ima-ad-container'
      this.adContainerDiv.addEventListener(
        'mouseover',
        showAdControls,
        false);
      this.adContainerDiv.addEventListener(
        'mouseout',
        hideAdControls,
        false);
      createControls();
      this.adDisplayContainer =
        new google.ima.AdDisplayContainer(this.adContainerDiv, this.contentPlayer);
    }.bind(this);

    /**
     * Shows ad controls on mouseover.
     * @private
     */
    var showAdControls = function() {
      this.controlsDiv.style.height = '37px';
      this.playPauseDiv.style.display = 'block';
      this.muteDiv.style.display = 'block';
      this.sliderDiv.style.display = 'block';
      this.fullscreenDiv.style.display = 'block';
    }.bind(this);

    /**
    * Hides the ad controls on mouseout.
    * @private
    */
    var hideAdControls = function() {
      this.playPauseDiv.style.display = 'none';
      this.muteDiv.style.display = 'none';
      this.fullscreenDiv.style.display = 'none';
      this.controlsDiv.style.height = '14px';
    }.bind(this);

    /**
     * Set up intervals to check for seeking and update current video time.
     * @private
     */
    this.setUpPlayerIntervals_ = function() {
      this.updateTimeIntervalHandle =
        setInterval(updateCurrentTime, this.seekCheckInterval);
      this.seekCheckIntervalHandle =
        setInterval(checkForSeeking, this.seekCheckInterval);
      this.resizeCheckIntervalHandle =
        setInterval(checkForResize, this.resizeCheckInterval);
    }.bind(this);

    /**
     * Creates the controls for the ad.
     * @private
     */
    var createControls = function() {
      this.controlsDiv = document.createElement('div');
      this.controlsDiv.className = 'ima-controls-div';
      this.controlsDiv.style.width = '100%';
      this.countdownDiv = document.createElement('div');
      this.countdownDiv.className = 'ima-countdown-div';
      this.countdownDiv.innerHTML = translations.get('Advertisement', this.settings.locale);
      this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
      this.seekBarDiv = document.createElement('div');
      this.seekBarDiv.className = 'ima-seek-bar-div';
      this.seekBarDiv.style.width = '100%';
      this.progressDiv = document.createElement('div');
      this.progressDiv.className = 'ima-progress-div';
      this.playPauseDiv = document.createElement('div');
      this.playPauseDiv.className = 'ima-play-pause-div ima-playing';
      this.playPauseDiv.addEventListener(
        this.isMobile ? 'touchend' : 'click',
        onAdPlayPauseClick,
        false);
      this.muteDiv = document.createElement('div');
      this.muteDiv.className = 'ima-mute-div ima-non-muted';
      this.muteDiv.addEventListener(
        this.isMobile ? 'touchend' : 'click',
        onAdMuteClick,
        false);
      this.sliderDiv = document.createElement('div');
      this.sliderDiv.className = 'ima-slider-div';
      this.sliderDiv.addEventListener(
        this.isMobile ? 'touchstart' : 'mousedown',
        onAdVolumeSliderMouseDown,
        false);
      this.sliderLevelDiv = document.createElement('div');
      this.sliderLevelDiv.className = 'ima-slider-level-div';
      this.fullscreenDiv = document.createElement('div');
      this.fullscreenDiv.className = 'ima-fullscreen-div ima-non-fullscreen';
      this.fullscreenDiv.addEventListener(
        this.isMobile ? 'touchend' : 'click',
        onAdFullscreenClick,
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
    }.bind(this);

    /**
     * Listener for clicks on the play/pause button during ad playback.
     * @private
     */
    var onAdPlayPauseClick = function() {
      if (this.adPlaying) {
        this.playPauseDiv.className = 'ima-play-pause-div ima-paused';
        this.adsManager.pause();
        this.adPlaying = false;
      } else {
        this.playPauseDiv.className = 'ima-play-pause-div ima-playing';
        this.adsManager.resume();
        this.adPlaying = true;
      }
    }.bind(this);

    /**
     * Listener for clicks on the mute button during ad playback.
     * @private
     */
    var onAdMuteClick = function() {
      if (this.adMuted) {
        this.muteDiv.className = 'ima-mute-div ima-non-muted';
        this.adsManager.setVolume(1);
        // Bubble down to content player
        this.player.muted(false);
        this.adMuted = false;
        this.sliderLevelDiv.style.width = player.volume() * 100 + "%";
      } else {
        this.muteDiv.className = 'ima-mute-div ima-muted';
        this.adsManager.setVolume(0);
        // Bubble down to content player
        this.player.muted(true);
        this.adMuted = true;
        this.sliderLevelDiv.style.width = "0%";
      }
    }.bind(this);

    /* Listener for mouse down events during ad playback. Used for volume.
     * @private
     */
    var onAdVolumeSliderMouseDown = function() {
      document.addEventListener(this.isMobile ? 'touchend' : 'mouseup', onMouseUp, false);
      document.addEventListener(this.isMobile ? 'touchmove' : 'mousemove', onMouseMove, false);
    }.bind(this);

    /* Mouse movement listener used for volume slider.
     * @private
     */
    var onMouseMove = function(event) {
      setVolumeSlider(event);
    }.bind(this);

    /* Mouse release listener used for volume slider.
     * @private
     */
    var onMouseUp = function(event) {
      setVolumeSlider(event);
      document.removeEventListener(this.isMobile ? 'touchmove' : 'mousemove', onMouseMove);
      document.removeEventListener(this.isMobile ? 'touchend' : 'mouseup', onMouseUp);
    }.bind(this);

    /* Utility function to set volume and associated UI
     * @private
     */
    var setVolumeSlider = function(event) {
      var percent =
        (event.clientX - this.sliderDiv.getBoundingClientRect().left) /
        this.sliderDiv.offsetWidth;
      percent *= 100;
      //Bounds value 0-100 if mouse is outside slider region.
      percent = Math.min(Math.max(percent, 0), 100);
      this.sliderLevelDiv.style.width = percent + "%";
      this.player.volume(percent / 100); //0-1
      this.adsManager.setVolume(percent / 100);
      if (this.player.volume() == 0) {
        this.muteDiv.className = 'ima-muted';
        this.player.muted(true);
        this.adMuted = true;
      }
      else {
        this.muteDiv.className = 'ima-non-muted';
        this.player.muted(false);
        this.adMuted = false;
      }
    }.bind(this)

    /**
     * Listener for clicks on the fullscreen button during ad playback.
     * @private
     */
    var onAdFullscreenClick = function() {
      if (this.player.isFullscreen()) {
        this.player.exitFullscreen();
      } else {
        this.player.requestFullscreen();
      }
    }.bind(this);

    /**
    * Listener for the ADS_MANAGER_LOADED event. Creates the AdsManager,
    * sets up event listeners, and triggers the 'adsready' event for
    * videojs-ads-contrib.
    * @private
    */
    var onAdsManagerLoaded = function(adsManagerLoadedEvent) {
      this.adsManager = adsManagerLoadedEvent.getAdsManager(
        this.contentPlayheadTracker, this.adsRenderingSettings);

      this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdErrorEvent);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.AD_BREAK_READY,
        onAdBreakReady);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        this.onContentPauseRequested_);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        this.onContentResumeRequested_);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAllAdsCompleted);

      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        onAdLoaded);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        onAdStarted);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CLICK,
        onAdPlayPauseClick);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        this.onAdComplete_);
      this.adsManager.addEventListener(
        google.ima.AdEvent.Type.SKIPPED,
        this.onAdComplete_);

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
          this.adsManager.setVolume(this.player.muted() ? 0 : this.player.volume());
        } catch (adError) {
          this.onAdError_(adError);
        }
      }

      this.player.trigger('adsready');
    }.bind(this);

    /**
     * Pauses the content video and displays the ad container so ads can play.
     * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
     * @private
     */
    this.onContentPauseRequested_ = function(adEvent) {
      this.adsActive = true;
      this.adPlaying = true;
      this.player.off('ended', this.localContentEndedListener_);
      if (adEvent.getAd().getAdPodInfo().getPodIndex() != -1) {
        // Skip this call for post-roll ads
        this.player.ads.startLinearAdMode();
      }
      this.adContainerDiv.style.display = 'block';
      this.controlsDiv.style.display = 'block';
      this.vjsControls.hide();
      this.player.pause();
    }.bind(this);

    /**
     * Resumes content video and hides the ad container.
     * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
     * @private
     */
    this.onContentResumeRequested_ = function(adEvent) {
      this.adsActive = false;
      this.adPlaying = false;
      this.player.on('ended', this.localContentEndedListener_);
      if (this.currentAd && this.currentAd.isLinear()) {
        this.adContainerDiv.style.display = 'none';
      }
      this.vjsControls.show();
      if (!this.currentAd) {
        // Something went wrong playing the ad
        this.player.ads.endLinearAdMode();
      } else if (!this.contentComplete &&
        // Don't exit linear mode after post-roll or content will auto-replay
        this.currentAd.getAdPodInfo().getPodIndex() != -1) {
        this.player.ads.endLinearAdMode();
      }
      this.countdownDiv.innerHTML = '';
    }.bind(this);

    /**
     * Records that ads have completed and calls contentAndAdsEndedListeners
     * if content is also complete.
     * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
     * @private
     */
    var onAllAdsCompleted = function(adEvent) {
      this.allAdsCompleted = true;
      if (this.contentComplete == true) {
        for (var index in this.contentAndAdsEndedListeners) {
          this.contentAndAdsEndedListeners[index]();
        }
      }
    }.bind(this);

    /**
     * Starts the content video when a non-linear ad is loaded.
     * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
     * @private
     */
    var onAdLoaded = function(adEvent) {
      if (!adEvent.getAd().isLinear()) {
        this.player.play();
      }
    }.bind(this);

    /**
     * Starts the interval timer to check the current ad time when an ad starts
     * playing.
     * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
     * @private
     */
    var onAdStarted = function(adEvent) {
      this.currentAd = adEvent.getAd();
      if (this.currentAd.isLinear()) {
        this.adTrackingTimer = setInterval(
          onAdPlayheadTrackerInterval, 250);
        // Don't bump container when controls are shown
        this.adContainerDiv.className = 'ima-ad-container';
      } else {
        // Bump container when controls are shown
        this.adContainerDiv.className = 'ima-ad-container bumpable-ima-ad-container';
      }
    }.bind(this);

    /**
     * Clears the interval timer for current ad time when an ad completes.
     * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
     * @private
     */
    this.onAdComplete_ = function(adEvent) {
      if (this.currentAd.isLinear()) {
        clearInterval(this.adTrackingTimer);
      }
    }.bind(this);

    /**
     * Gets the current time and duration of the ad and calls the method to
     * update the ad UI.
     * @private
     */
    var onAdPlayheadTrackerInterval = function() {
      var remainingTime = this.adsManager.getRemainingTime();
      var duration = this.currentAd.getDuration();
      var currentTime = duration - remainingTime;
      currentTime = currentTime > 0 ? currentTime : 0;
      var isPod = false;
      var adPosition, totalAds;
      if (this.currentAd.getAdPodInfo()) {
        isPod = true;
        adPosition = this.currentAd.getAdPodInfo().getAdPosition();
        totalAds = this.currentAd.getAdPodInfo().getTotalAds();
      }

      // Update countdown timer data
      var remainingMinutes = Math.floor(remainingTime / 60);
      var remainingSeconds = Math.floor(remainingTime % 60);
      if (remainingSeconds.toString().length < 2) {
        remainingSeconds = '0' + remainingSeconds;
      }
      var podCount = ': ';
      if (isPod) {
        podCount = ' (' + adPosition + ' of ' + totalAds + '): ';
      }
      this.countdownDiv.innerHTML =
        translations.get('Advertisement', this.settings.locale) + podCount +
        remainingMinutes + ':' + remainingSeconds;

      // Update UI
      var playProgressRatio = currentTime / duration;
      var playProgressPercent = playProgressRatio * 100;
      this.progressDiv.style.width = playProgressPercent + '%';
    }.bind(this);

    /**
     * Listener for errors fired by the AdsLoader.
     * @param {google.ima.AdErrorEvent} event The error event thrown by the
     *     AdsLoader. See
     *     https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdError.Type
     * @private
     */
    var onAdsLoaderError = function(event) {
      window.console.log('AdsLoader error: ' + event.getError());
      if (this.adsManager) {
        this.adsManager.destroy();
      }
      this.player.trigger('adserror');
    }.bind(this);

    /**
     * Listener for errors thrown by the AdsManager.
     * @param {google.ima.AdErrorEvent} adErrorEvent The error event thrown by
     *     the AdsManager.
     * @private
     */
    this.onAdError_ = function(adError) {
      window.console.log('Ad error: ' + adError.stack);

      this.vjsControls.show();
      this.adsManager.destroy();
      this.adContainerDiv.style.display = 'none';
      this.player.trigger('adserror');
    }.bind(this);

    /**
     * Listener for errors thrown by the AdsManager.
     * @param {google.ima.AdErrorEvent} adErrorEvent The error event thrown by
     *     the AdsManager.
     * @private
     */
    var onAdErrorEvent = function(adErrorEvent) {
      window.console.log('Ad error: ' + adErrorEvent.getError());

      this.vjsControls.show();
      this.adsManager.destroy();
      this.adContainerDiv.style.display = 'none';
      this.player.trigger('adserror');
    }.bind(this);

    /**
     * Listener for AD_BREAK_READY. Passes event on to publisher's listener.
     * @param {google.ima.AdEvent} adEvent AdEvent thrown by the AdsManager.
     * @private
     */
    var onAdBreakReady = function(adEvent) {
      this.adBreakReadyListener(adEvent);
    }.bind(this);

    /**
     * Listens for the video.js player to change its fullscreen status. This
     * keeps the fullscreen-ness of the AdContainer in sync with the player.
     * @private
     */
    var onFullscreenChange = function() {
      if (this.player.isFullscreen()) {
        this.fullscreenDiv.className = 'ima-fullscreen-div ima-fullscreen';
        if (this.adsManager) {
          this.adsManager.resize(
            window.screen.width,
            window.screen.height,
            google.ima.ViewMode.FULLSCREEN);
        }
      } else {
        this.fullscreenDiv.className = 'ima-fullscreen-div ima-non-fullscreen';
        if (this.adsManager) {
          this.adsManager.resize(
            this.getPlayerWidth(),
            this.getPlayerHeight(),
            google.ima.ViewMode.NORMAL);
        }
      }
    }.bind(this);

    /**
     * Listens for the video.js player to change its volume. This keeps the ad
     * volume in sync with the content volume if the volume of the player is
     * changed while content is playing
     * @private
     */
    var onVolumeChange = function() {
      var newVolume = this.player.muted() ? 0 : this.player.volume();
      if (this.adsManager) {
        this.adsManager.setVolume(newVolume);
      }
      // Update UI
      if (newVolume == 0) {
        this.adMuted = true;
        this.muteDiv.className = 'ima-muted';
        this.sliderLevelDiv.style.width = '0%';
      } else {
        this.adMuted = false;
        this.muteDiv.className = 'ima-non-muted';
        this.sliderLevelDiv.style.width = newVolume * 100 + '%';
      }
    }.bind(this);

    /**
     * Seeks content to 00:00:00. This is used as an event handler for the
     * loadedmetadata event, since seeking is not possible until that event has
     * fired.
     * @private
     */
    this.seekContentToZero_ = function() {
      this.player.off('loadedmetadata', this.seekContentToZero_);
      this.player.currentTime(0);
    }.bind(this);

    /**
     * Seeks content to 00:00:00 and starts playback. This is used as an event
     * handler for the loadedmetadata event, since seeking is not possible until
     * that event has fired.
     * @private
     */
    this.playContentFromZero_ = function() {
      this.player.off('loadedmetadata', this.playContentFromZero_);
      this.player.currentTime(0);
      this.player.play();
    }.bind(this);

    /**
     * Destroys the AdsManager, sets it to null, and calls contentComplete to
     * reset correlators. Once this is done it requests ads again to keep the
     * inventory available.
     * @private
     */
    this.resetIMA_ = function() {
      this.adsActive = false;
      this.adPlaying = false;
      this.player.on('ended', this.localContentEndedListener_);
      if (this.currentAd && this.currentAd.isLinear()) {
        this.adContainerDiv.style.display = 'none';
      }
      this.vjsControls.show();
      this.player.ads.endLinearAdMode();
      if (this.adTrackingTimer) {
        // If this is called while an ad is playing, stop trying to get that
        // ad's current time.
        clearInterval(this.adTrackingTimer);
      }
      if (this.adsManager) {
        this.adsManager.destroy();
        this.adsManager = null;
      }
      if (this.adsLoader && !this.contentComplete) {
        this.adsLoader.contentComplete();
      }
      this.contentComplete = false;
      this.allAdsCompleted = false;
    }.bind(this);

    /**
     * Updates the current time of the video
     * @private
     */
    var updateCurrentTime = function() {
      if (!this.contentPlayheadTracker.seeking) {
        this.contentPlayheadTracker.currentTime = this.player.currentTime();
      }
    }.bind(this);

    /**
     * Detects when the user is seeking through a video.
     * This is used to prevent mid-rolls from playing while a user is seeking.
     *
     * There *is* a seeking property of the HTML5 video element, but it's not
     * properly implemented on all platforms (e.g. mobile safari), so we have to
     * check ourselves to be sure.
     *
     * @private
     */
    var checkForSeeking = function() {
      var tempCurrentTime = this.player.currentTime();
      var diff = (tempCurrentTime - this.contentPlayheadTracker.previousTime) * 1000;
      if (Math.abs(diff) > this.seekCheckInterval + this.seekThreshold) {
        this.contentPlayheadTracker.seeking = true;
      } else {
        this.contentPlayheadTracker.seeking = false;
      }
      this.contentPlayheadTracker.previousTime = this.player.currentTime();
    }.bind(this);

    /**
     * Detects when the player is resized (for fluid support) and resizes the
     * ads manager to match.
     *
     * @private
     */
    var checkForResize = function() {
      var currentWidth = this.getPlayerWidth();
      var currentHeight = this.getPlayerHeight();

      if (this.adsManager && (currentWidth != this.adsManagerDimensions.width ||
        currentHeight != this.adsManagerDimensions.height)) {
        this.adsManager.resize(this.getPlayerWidth(),
          this.getPlayerHeight(), google.ima.ViewMode.NORMAL);
      }
    }.bind(this);

    this.settings = extend({}, ima_defaults, options || {});

    // Currently this isn't used but I can see it being needed in the future, so
    // to avoid implementation problems with later updates I'm requiring it.
    if (!this.settings['id']) {
      window.console.log('Error: must provide id of video.js div');
      return;
    }

    this.contentPlayer = document.getElementById(this.settings['id'] + '_html5_api');
    // Default showing countdown timer to true.
    this.showCountdown = true;
    if (this.settings['showCountdown'] == false) {
      this.showCountdown = false;
    }

    this.autoPlayAdBreaks = true;
    if (this.settings['autoPlayAdBreaks'] == false) {
      this.autoPlayAdBreaks = false;
    }

    this.player.one('play', this.setUpPlayerIntervals_);

    this.player.on('ended', this.localContentEndedListener_);

    var contrib_ads_defaults = {
      debug: this.settings.debug,
      timeout: this.settings.timeout,
      prerollTimeout: this.settings.prerollTimeout
    };

    var ads_plugin_settings =
      extend({}, contrib_ads_defaults, options['contribAdsSettings'] || {});

    this.player.ads(ads_plugin_settings);

    this.adsRenderingSettings = new google.ima.AdsRenderingSettings();
    this.adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    if (this.settings['adsRenderingSettings']) {
      for (var setting in this.settings['adsRenderingSettings']) {
        this.adsRenderingSettings[setting] =
          this.settings['adsRenderingSettings'][setting];
      }
    }

    if (this.settings['locale']) {
      google.ima.settings.setLocale(this.settings['locale']);
    }

    createAdContainer();

    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

    this.adsLoader.getSettings().setVpaidMode(
      google.ima.ImaSdkSettings.VpaidMode.ENABLED);
    if (this.settings.vpaidAllowed == false) {
      this.adsLoader.getSettings().setVpaidMode(
        google.ima.ImaSdkSettings.VpaidMode.DISABLED);
    }
    if (this.settings.vpaidMode) {
      this.adsLoader.getSettings().setVpaidMode(this.settings.vpaidMode);
    }

    if (this.settings.locale) {
      this.adsLoader.getSettings().setLocale(this.settings.locale);
    }

    if (this.settings.numRedirects) {
      this.adsLoader.getSettings().setNumRedirects(this.settings.numRedirects);
    }

    this.adsLoader.getSettings().setPlayerType('videojs-ima');
    this.adsLoader.getSettings().setPlayerVersion(this.VERSION);
    this.adsLoader.getSettings().setAutoPlayAdBreaks(this.autoPlayAdBreaks);

    this.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
    this.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdsLoaderError,
      false);

    if (!readyCallback) {
      readyCallback = this.start.bind(this);
    }
    this.player.on('readyforpreroll', readyCallback);
    this.player.ready(function() {
      this.on('fullscreenchange', onFullscreenChange);
      this.on('volumechange', onVolumeChange);
    });

  }

  /**
    * Initializes the AdDisplayContainer. On mobile, this must be done as a
    * result of user action.
    */
  ImaPlugin.prototype.initializeAdDisplayContainer = function() {
    this.adDisplayContainerInitialized = true;
    this.adDisplayContainer.initialize();
  }

  /**
   * Creates the AdsRequest and request ads through the AdsLoader.
   */
  ImaPlugin.prototype.requestAds = function() {
    if (!this.adDisplayContainerInitialized) {
      this.adDisplayContainer.initialize();
    }
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = this.settings.adTagUrl;
    if (this.settings.forceNonLinearFullSlot) {
      adsRequest.forceNonLinearFullSlot = true;
    }

    adsRequest.linearAdSlotWidth = this.getPlayerWidth();
    adsRequest.linearAdSlotHeight = this.getPlayerHeight();
    adsRequest.nonLinearAdSlotWidth =
      this.settings.nonLinearWidth || this.getPlayerWidth();
    adsRequest.nonLinearAdSlotHeight =
      this.settings.nonLinearHeight || (this.getPlayerHeight() / 3);

    this.adsLoader.requestAds(adsRequest);
  };

  /**
   * Returns id of player for debugging scope.
   */
  ImaPlugin.prototype.getPlayerId = function() {
    return this.player.id();
  }

  /**
   * Start ad playback, or content video playback in the absence of a
   * pre-roll.
   */
  ImaPlugin.prototype.start = function() {
    if (this.autoPlayAdBreaks) {
      try {
        this.adsManager.init(
          this.getPlayerWidth(),
          this.getPlayerHeight(),
          google.ima.ViewMode.NORMAL);
        this.adsManager.setVolume(this.player.muted() ? 0 : this.player.volume());
        this.adsManager.start();
      } catch (adError) {
        this.onAdError_(adError);
      }
    }
  };

  /**
   * Called by publishers in manual ad break playback mode to start an ad
   * break.
   */
  ImaPlugin.prototype.playAdBreak = function() {
    if (!this.autoPlayAdBreaks) {
      this.adsManager.start();
    }
  }

  ImaPlugin.prototype.getPlayerWidth = function() {
    var retVal = parseInt(getComputedStyle(this.player.el()).width, 10) ||
      this.player.width();
    return retVal;
  };

  ImaPlugin.prototype.getPlayerHeight = function() {
    var retVal = parseInt(getComputedStyle(this.player.el()).height, 10) ||
      this.player.height();
    return retVal;
  }

  /**
   * Ads an EventListener to the AdsManager. For a list of available events,
   * see
   * https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type
   * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to listen.
   * @param {function} callback The method to call when the event is fired.
   */
  ImaPlugin.prototype.addEventListener = function(event, callback) {
    if (this.adsManager) {
      this.adsManager.addEventListener(event, callback);
    }
  };

  /**
   * Returns the instance of the AdsManager.
   * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
   */
  ImaPlugin.prototype.getAdsManager = function() {
    return this.adsManager;
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
  ImaPlugin.prototype.setContent =
    function(contentSrc, adTag, playOnLoad) {
      this.resetIMA_();
      this.settings.adTagUrl = adTag ? adTag : this.settings.adTagUrl;
      //only try to pause the player when initialised with a source already
      if (!!this.player.currentSrc()) {
        this.player.currentTime(0);
        this.player.pause();
      }
      if (contentSrc) {
        this.player.src(contentSrc);
      }
      if (playOnLoad) {
        this.player.on('loadedmetadata', this.playContentFromZero_);
      } else {
        this.player.on('loadedmetadata', this.seekContentToZero_);
      }
    };

  /**
   * Adds a listener for the 'ended' event of the video player. This should be
   * used instead of setting an 'ended' listener directly to ensure that the
   * ima can do proper cleanup of the SDK before other event listeners
   * are called.
   * @param {function} listener The listener to be called when content completes.
   */
  ImaPlugin.prototype.addContentEndedListener = function(listener) {
    this.contentEndedListeners.push(listener);
  };

  /**
   * Adds a listener that will be called when content and all ads have
   * finished playing.
   * @param {function} listener The listener to be called when content and ads complete.
   */
  ImaPlugin.prototype.addContentAndAdsEndedListener = function(listener) {
    this.contentAndAdsEndedListeners.push(listener);
  }

  /**
   * Sets the listener to be called to trigger manual ad break playback.
   * @param {function} listener The listener to be called to trigger manual ad break playback.
   */
  ImaPlugin.prototype.setAdBreakReadyListener = function(listener) {
    this.adBreakReadyListener = listener;
  }

  /**
   * Pauses the ad.
   */
  ImaPlugin.prototype.pauseAd = function() {
    if (this.adsActive && this.adPlaying) {
      this.playPauseDiv.className = 'ima-play-pause-div ima-paused';
      this.adsManager.pause();
      this.adPlaying = false;
    }
  };

  /**
   * Resumes the ad.
   */
  ImaPlugin.prototype.resumeAd = function() {
    if (this.adsActive && !this.adPlaying) {
      this.playPauseDiv.className = 'ima-play-pause-div ima-playing';
      this.adsManager.resume();
      this.adPlaying = true;
    }
  };

  /**
   * Changes the flag to show or hide the ad countdown timer.
   *
   * @param {boolean} showCountdownIn Show or hide the countdown timer.
   */
  ImaPlugin.prototype.setShowCountdown = function(showCountdownIn) {
    this.showCountdown = showCountdownIn;
    this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
  };

  videojs.plugin('ima', init);

} (window.videojs));
