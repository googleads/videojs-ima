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
  // Create player and start ads when the video player is clicked, but only the
  // first time it's clicked.
  this.clickedOnce = false;
  this.placeholder = document.getElementById('ima-sample-placeholder');
  this.placeholder.addEventListener('click', this.bind(this, this.init));

  this.options = {
    id: 'content_video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&' +
        'iu=%2F3510761%2FadRulesSampleTags&' +
        'ciu_szs=160x600%2C300x250%2C728x90&' +
        'cust_params=adrule%3Dpremidpostpodandbumpers&impl=s&gdfp_req=1&' +
        'env=vp&ad_rule=1&vid=47570401&cmsid=481&output=xml_vast2&' +
        'unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]',
    debug: true,
    nativeControlsForTouch: false
  };

  this.events = [
    google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
    google.ima.AdEvent.Type.CLICK,
    google.ima.AdEvent.Type.COMPLETE,
    google.ima.AdEvent.Type.FIRST_QUARTILE,
    google.ima.AdEvent.Type.LOADED,
    google.ima.AdEvent.Type.MIDPOINT,
    google.ima.AdEvent.Type.PAUSED,
    google.ima.AdEvent.Type.STARTED,
    google.ima.AdEvent.Type.THIRD_QUARTILE
  ];

  this.console = document.getElementById('ima-sample-console');
};

Ads.prototype.init = function() {
  // Create the player
  this.createPlayer();
  this.player = videojs('content_video');

  // Initialize the IMA plugin
  this.player.ima(
      this.options,
      this.bind(this, this.adsManagerLoadedCallback));
  this.player.ima.initializeAdDisplayContainer();

  // Request ads and play the video
  this.player.ima.requestAds();
  this.player.play();
};

Ads.prototype.createPlayer = function() {
  var dumbPlayer = document.createElement('video');
  dumbPlayer.id = 'content_video';
  dumbPlayer.className = 'video-js vjs-default-skin';
  dumbPlayer.setAttribute('width', '640px');
  dumbPlayer.setAttribute('height', '360px');
  var contentSrc = document.createElement('source');
  contentSrc.setAttribute('src', 'http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4');
  contentSrc.setAttribute('type', 'video/mp4');
  dumbPlayer.appendChild(contentSrc);
  this.placeholder.parentNode.appendChild(dumbPlayer);
  this.placeholder.parentNode.removeChild(this.placeholder);
}

Ads.prototype.adsManagerLoadedCallback = function() {
  for (var index = 0; index < this.events.length; index++) {
    this.player.ima.addEventListener(
        this.events[index],
        this.bind(this, this.onAdEvent));
  }
  this.player.ima.start();
};

Ads.prototype.onAdEvent = function(event) {
  this.console.innerHTML =
      this.console.innerHTML + '<br/>Ad event: ' + event.type;
};

Ads.prototype.bind = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};
