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

  this.options = {
    id: 'content_video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&' +
        'iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&' +
        'impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&' +
        'cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&' +
        'cmsid=496&vid=short_onecue&correlator=',
    debug: true,
    adsManagerLoadedCallback: this.adsManagerLoadedCallback.bind(this)
  };

  this.contents = ['http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4',
                   'http://rmcdn.2mdn.net/Demo/html5/output.mp4'];
  this.posters = ['../posters/android.png', '../posters/dfp.png'];
  this.currentContent = 0;

  this.linearAdPlaying = false;
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

Ads.prototype.adsManagerLoadedCallback = function() {
  // When the page first loads, don't autoplay. After that, when the user
  // clicks a playlist item to switch videos, autoplay.
  if (this.playlistItemClicked) {
    console.log('Calling player.play()');
    this.player.play();
  }
};

Ads.prototype.onPlaylistItemClick = function(event) {
  if (!this.linearAdPlaying) {
    this.player.ima.setContentWithAdTag(
        this.contents[event.target.id],
        null,
        false);
    this.player.poster(this.posters[event.target.id]);
    this.player.ima.requestAds();
  }
  this.playlistItemClicked = true;
};
