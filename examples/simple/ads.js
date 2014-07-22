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

var player = videojs('content_video');

var options = {
  id: 'content_video',
  adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480' +
        '&iu=%2F3510761%2FadRulesSampleTags' +
        '&ciu_szs=160x600%2C300x250%2C728x90' +
        '&cust_params=adrule%3Dpremidpostpodandbumpers&impl=s&gdfp_req=1&' +
        'env=vp&ad_rule=1&vid=47570401&cmsid=481&output=xml_vast2' +
        '&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]',
};

player.ima(options);

// Remove controls from the player on iPad to stop native controls from stealing
// our click
var contentPlayer =  document.getElementById('content_video_html5_api');
if (navigator.userAgent.match(/iPad/i) != null &&
    contentPlayer.hasAttribute('controls')) {
  contentPlayer.removeAttribute('controls');
}

// Initialize the ad container when the video player is clicked, but only the
// first time it's clicked.
var clickedOnce = false;
player.on('click', function() {
    if (!clickedOnce) {
      player.ima.initializeAdDisplayContainer();
      player.ima.requestAds();
      player.play();
      clickedOnce = true;
    }
});
