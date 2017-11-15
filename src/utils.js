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
 * Util functions used by multiple plugin classes.
 */
var Utils = {};

/**
 * Assigns the unique id and class names to the given element as well as the
 * style class.
 * @param element
 * @param controlName
 * @private
 */
Utils.assignControlAttributes = function(controlPrefix, element, controlName) {
  element.id = controlPrefix + controlName;
  element.className = controlPrefix + controlName + ' ' + controlName;
}.bind(this);
