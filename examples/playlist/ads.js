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
  if ((navigator.userAgent.match(/iPad/i) ||
          navigator.userAgent.match(/Android/i)) &&
      contentPlayer.hasAttribute('controls')) {
    contentPlayer.removeAttribute('controls');
  }

  // Start ads when the video player is clicked, but only the first time it's
  // clicked.
  var startEvent = 'click';
  if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) {
    startEvent = 'touchend';
  }
  this.player.one(startEvent, this.initFromStart.bind(this));

  this.options = {
    id: 'content_video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&' +
        'iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&' +
        'impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&' +
        'cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&' +
        'cmsid=496&vid=short_onecue&correlator=',
    adsManagerLoadedCallback: this.adsManagerLoadedCallback.bind(this)
  };

  this.contents = ['http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4',
                   'http://rmcdn.2mdn.net/Demo/html5/output.mp4'];
  this.posters = ['../posters/android.png', '../posters/dfp.png'];
  this.currentContent = 0;

  this.console = document.getElementById('ima-sample-console');
  this.linearAdPlaying = false;
  this.initialized = false;
  this.playlistItemClicked = false;

  this.playlistDiv = document.getElementById('ima-sample-playlistDiv');
  if (this.playlistDiv) {
    this.playlistItems = this.playlistDiv.childNodes;
    for (var index in this.playlistItems) {
      if (this.playlistItems[index].tagName == 'DIV') {
        this.playlistItems[index].addEventListener(
            'click',
            this.onPlaylistItemClick.bind(this),
            false);
      }
    }
  }
  this.player.ima(this.options);

}

Ads.prototype.initFromStart = function() {
  if (!this.initialized) {
    this.init();
  }
}

Ads.prototype.init = function() {
  this.initialized = true;
  this.player.ima.initializeAdDisplayContainer();
};

Ads.prototype.adsManagerLoadedCallback = function() {
  var events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
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
  for (var index = 0; index < events.length; index++) {
    this.player.ima.addEventListener(
        events[index],
        this.onAdEvent.bind(this));
  }

  // When the page first loads, don't autoplay. After that, when the user
  // clicks a playlist item to switch videos, autoplay.
  if (this.playlistItemClicked) {
    this.player.play();
  }
};

Ads.prototype.onAdEvent = function(event) {
  if (event.type == google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED) {
    this.linearAdPlaying = true;
  } else if (event.type == google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED) {
    this.linearAdPlaying = false;
  } else {
    this.console.innerHTML =
        this.console.innerHTML + '<br/>Ad event: ' + event.type;
  }
};

Ads.prototype.onPlaylistItemClick = function(event) {
  if (!this.linearAdPlaying) {
    if (!this.initialized) {
      // Handles the case where the user loads the page, clicks a playlist item
      // immediately, and never clicks the play button on the player.
      this.init();
    }
    this.player.ima.setContentWithAdTag(
        this.contents[event.target.id],
        null,
        false);
    this.player.poster(this.posters[event.target.id]);
    this.player.ima.requestAds();
  }
  this.playlistItemClicked = true;
};
