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
 * Header JavaScript for the final distribution.
 */
(function(factory) {
  if (typeof define === 'function' && define['amd']) {
    define(['video.js', 'videojs-contrib-ads'],
        function(videojs){ factory(window, document, videojs) });
  } else if (typeof exports === 'object' && typeof module === 'object') {
    var vjs = require('video.js');
    require('videojs-contrib-ads');
    factory(window, document, vjs);
  } else {
    factory(window, document, videojs);
  }
})(function(window, document, videojs) {
  "use strict";

  // support es6 style import
  videojs = videojs.default || videojs;

  var init = function(options) {
    this.ima = new ImaPlugin(this, options);
  };
