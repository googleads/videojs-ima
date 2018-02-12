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
 */
var onAdErrorEvent = function(event) {
  console.log(event);
};

var adTags = {
  linear: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/' +
    '124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&' +
    'env=vp&output=vast&unviewed_position_start=1&cust_params=' +
    'deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',
  skippable: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/' +
    '124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&' +
    'env=vp&output=vast&unviewed_position_start=1&cust_params=' +
    'deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=',
  vmap_preroll: 'http://localhost:8080/test/webdriver/content/canned_ads/' +
    'vmap_preroll.xml',
  vmap_midroll: 'http://localhost:8080/test/webdriver/content/canned_ads/' +
    'vmap_midroll.xml',
  nonlinear: 'http://pubads.g.doubleclick.net/gampad/ads?sz=480x70&iu=/' +
    '124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&' +
    'env=vp&output=vast&unviewed_position_start=1&cust_params=' + 
    'deployment%3Ddevsite%26sample_ct%3Dnonlinear&correlator=',
  error_303: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/' +
    '124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&' +
    'env=vp&output=vast&unviewed_position_start=1&cust_params=' +
    'deployment%3Ddevsite%26sample_ct%3Dredirecterror&nofb=1&correlator='
};

var searchParams = new URLSearchParams(location.search);
var adTagName = searchParams.get('ad');

var player = videojs('content_video');

var onAdsManagerLoaded = function() {
  player.ima.addEventListener(google.ima.AdEvent.Type.STARTED, onAdStarted);
};

var onAdStarted = function(event) {
  var message = event.type;
  var log = document.getElementById('log');
  log.innerHTML += message + "<br>";
};

var options = {
  id: 'content_video',
  disableFlagAds: true,
  adTagUrl: adTags[adTagName],
  adsManagerLoadedCallback: onAdsManagerLoaded
};

player.ima(options);

// Remove controls from the player on iPad to stop native controls from stealing
// our click
var contentPlayer =  document.getElementById('content_video_html5_api');
if ((navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) &&
    contentPlayer.hasAttribute('controls')) {
  contentPlayer.removeAttribute('controls');
}

// Initialize the ad container when the video player is clicked, but only the
// first time it's clicked.
var startEvent = 'click';
if (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i)) {
  startEvent = 'touchend';
}

player.on("adserror", function(event) {
  var log = document.getElementById('log');
  log.innerHTML += event.data.AdError + "<br>";
});

player.on("playing", function(event) {
  var log = document.getElementById('log');
  log.innerHTML += event.type + "<br>";
});

player.one(startEvent, function() {
    player.ima.initializeAdDisplayContainer();
});

