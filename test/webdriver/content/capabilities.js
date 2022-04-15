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
  'browserstack.console': 'verbose',
  'browserstack.key' : process.env.BROWSERSTACK_ACCESS_KEY,
  'browserstack.local' : 'true',
  'browserstack.localIdentifier' : process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
  'browserstack.networkLogs': 'true',
  'browserstack.user' : process.env.BROWSERSTACK_USER,
  'build' : '1.1.0',
  'project' : 'videojs_ima'
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
];

for (let browser of browsers) {
  if (browser.server == 'http://hub-cloud.browserstack.com/wd/hub') {
    browser.capabilities =
        Object.assign(browser.capabilities, browserstackCapabilities);
  }
}

// Remove if we don't have browserstack credentials.
if (process.env.BROWSERSTACK_USER === undefined ||
    process.env.BROWSERSTACK_ACCESS_KEY === undefined) {
  browsers = browsers.filter(browser =>
    browser.server != 'http://hub-cloud.browserstack.com/wd/hub');
}

exports.browsers = browsers;
