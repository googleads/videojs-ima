/**
 * Copyright 2018 Google Inc.
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

require('chromedriver');
require('geckodriver');

var browserstackCapabilities = {
  'build' : '1.0.5',
  'project' : 'videojs_ima',
  'browserstack.local' : 'true',
  'browserstack.localIdentifier' : process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
  'browserstack.user' : process.env.BROWSERSTACK_USER,
  'browserstack.key' : process.env.BROWSERSTACK_ACCESS_KEY
}

var browsers = [
  {
    name: 'chrome-local',
    server: '', //local
    capabilities: {
      'browserName' : 'chrome',
      'chromeOptions' : {args: ['--headless']}
    }
  },
  {
    name: 'firefox-local',
    server: '', //local
    capabilities: {
      'browserName' : 'firefox',
      'moz:firefoxOptions' : {args: ['-headless']}
    }
  },
  {
    name: 'browserstack-win10-chrome',
    server: 'http://hub-cloud.browserstack.com/wd/hub',
    capabilities: {
      'browserName' : 'Chrome',
      'browser_version' : '62.0',
      'os' : 'Windows',
      'os_version' : '10',
      'resolution' : '1024x768',
    }
  },
  {
    name: 'browserstack-win10-firefox',
    server: 'http://hub-cloud.browserstack.com/wd/hub',
    capabilities: {
      'browserName' : 'Firefox',
      'browser_version' : '58.0',
      'os' : 'Windows',
      'os_version' : '10',
      'resolution' : '1024x768',
    }
  },
];

for (let browser of browsers) {
  if (browser.server == 'http://hub-cloud.browserstack.com/wd/hub') {
    browser.capabilities =
        Object.assign(browser.capabilities, browserstackCapabilities);
  }
}

// Remove if we don't have browserstack credentials.
if (process.env.TRAVIS_PULL_REQUEST === false||
    process.env.BROWSERSTACK_USER === undefined ||
    process.env.BROWSERSTACK_ACCESS_KEY === undefined) {
  browsers = browsers.filter(browser =>
    browser.server != 'http://hub-cloud.browserstack.com/wd/hub');
}

console.log('TRAVIS_PULL_REQUEST:' + process.env.TRAVIS_PULL_REQUEST);

exports.browsers = browsers;
