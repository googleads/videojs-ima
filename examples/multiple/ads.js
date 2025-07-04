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

function pause(id) {
  var player = videojs(id);
  player.ima.pauseAd();
}

var Player = function(id) {
  this.id = id;
  this.init = function() {
    this.player = videojs(this.id);

    var options = {
      id: id,
      adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&' +
          'iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&' +
          'gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&' +
          'cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&' +
          'vid=short_onecue&correlator='
    };

    this.player.ima(options);

    // Remove controls from the player on iPad to stop native controls from stealing
    // our click
    var contentPlayer =  document.getElementById(id + '_html5_api');
    if ((navigator.userAgent.match(/iPad/i) ||
          navigator.userAgent.match(/Android/i)) &&
        contentPlayer.hasAttribute('controls')) {
      contentPlayer.removeAttribute('controls');
    }

    // Initialize the ad container when the video player is clicked, but only the
    // first time it's clicked.
    this.startEvent = 'click';
    if (navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
      this.startEvent = 'touchend';
    }

    this.wrapperDiv = document.getElementById(this.id);
    this.boundInitAdDisplayContainer = this.initAdDisplayContainer.bind(this);
    this.wrapperDiv.addEventListener(
        this.startEvent, this.boundInitAdDisplayContainer);
  }

  this.initAdDisplayContainer = function() {
    this.player.ima.initializeAdDisplayContainer();
    this.wrapperDiv.removeEventListener(
        this.startEvent, this.boundInitAdDisplayContainer);
  }
}

var player1 = new Player('content_video');
player1.init();
var player2 = new Player('content_video1');
player2.init();
