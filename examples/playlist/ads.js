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
 */

var Ads = function() {

  this.player = videojs('content_video');

  // Remove controls from the player on iPad to stop native controls from stealing
  // our click
  var contentPlayer =  document.getElementById('content_video_html5_api');
  if (navigator.userAgent.match(/iPad/i) != null &&
      contentPlayer.hasAttribute('controls')) {
    contentPlayer.removeAttribute('controls');
  }

  // Start ads when the video player is clicked, but only the first time it's
  // clicked.
  this.clickedOnce = false;
  this.player.on('click', this.bind(this, function() {
      if (!this.clickedOnce) {
        this.init();
        this.clickedOnce = true;
      }
  }));

  this.options = {
    id: 'content_video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480' +
        '&iu=%2F3510761%2FadRulesSampleTags' +
        '&ciu_szs=160x600%2C300x250%2C728x90' +
        '&cust_params=adrule%3Dpremidpostpodandbumpers&impl=s&gdfp_req=1&' +
        'env=vp&ad_rule=1&vid=47570401&cmsid=481&output=xml_vast2' +
        '&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]',
    debug: true
  };

  this.contents = ['http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4',
                   'http://rmcdn.2mdn.net/Demo/html5/output.mp4'];
  this.posters = ['../posters/android.png', '../posters/dfp.png'];
  this.currentContent = 0;

  this.events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                google.ima.AdEvent.Type.CLICK,
                google.ima.AdEvent.Type.COMPLETE,
                google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                google.ima.AdEvent.Type.FIRST_QUARTILE,
                google.ima.AdEvent.Type.LOADED,
                google.ima.AdEvent.Type.MIDPOINT,
                google.ima.AdEvent.Type.PAUSED,
                google.ima.AdEvent.Type.STARTED,
                google.ima.AdEvent.Type.THIRD_QUARTILE];

  this.console = document.getElementById('ima-sample-console');
  this.linearAdPlaying = false;
  this.initialized = false;

  this.playlistDiv = document.getElementById('ima-sample-playlistDiv');
  if (this.playlistDiv) {
    this.playlistItems = this.playlistDiv.childNodes;
    for (var index in this.playlistItems) {
      if (this.playlistItems[index].tagName == 'DIV') {
        this.playlistItems[index].addEventListener(
            'click',
            this.bind(this, this.onPlaylistItemClick),
            false);
      }
    }
  }
  this.player.ima(
      this.options,
      this.bind(this, this.adsManagerLoadedCallback));

}

Ads.prototype.init = function() {
  this.initialized = true;
  this.player.ima.initializeAdDisplayContainer();
  this.player.ima.requestAds();
  this.player.play();
};

Ads.prototype.adsManagerLoadedCallback = function() {
  for (var index = 0; index < this.events.length; index++) {
    this.player.ima.addEventListener(
        this.events[index],
        this.bind(this, this.onAdEvent));
  }
  this.player.ima.start();
};

Ads.prototype.onAdEvent = function(event) {
  if (event.type == 'contentPauseRequested') {
    this.linearAdPlaying = true;
  } else if (event.type == 'contentResumeRequested') {
    this.linearAdPlaying = false;
  } else {
    this.console.innerHTML =
        this.console.innerHTML + '<br/>Ad event: ' + event.type;
  }
};

Ads.prototype.onPlaylistItemClick = function(event) {
  if (!this.linearAdPlaying) {
    this.player.ima.setContent(
        this.contents[event.target.id],
        null,
        true);
    this.player.poster(this.posters[event.target.id]);
    this.player.ima.requestAds();
  }
};

Ads.prototype.bind = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};
