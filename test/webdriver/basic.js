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

var browsers = require('./content/capabilities');

browsers.browsers.forEach(function(browser) {

    describe('Basic Tests ' + browser.name, function() {

    this.timeout(0);
    this.slow(15000);

    var webdriver = require('selenium-webdriver'),
        until = webdriver.until;
        By = webdriver.By;

    var driver;

    before(async function() {
      driver = await new webdriver.Builder()
            .forBrowser(browser.capabilities.browserName)
            .usingServer(browser.server)
            .withCapabilities(browser.capabilities)
            .build();
      return driver;
    });

    after(async function() {
      await driver.quit();
    });

    it( 'Displays ad UI ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=linear');
      await driver.findElement(By.id('content_video')).click();
      let log = await driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, 'start'), 60000);
      await driver.wait(until.elementIsVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 60000);
    });

    it( 'Hides controls when ad ends ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=linear');
      await driver.findElement(By.id('content_video')).click();
      let log = await driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, 'start'), 60000);
      await driver.wait(until.elementIsNotVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 60000);
      await driver.sleep();
    });

    it( 'Plays content when ad ends ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=linear');
      await driver.findElement(By.id('content_video')).click();
      let log = await driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, 'start'), 60000);
      await driver.wait(until.elementIsNotVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 60000);
      await driver.wait(until.elementTextContains(log, 'playing'), 60000);
      await driver.sleep();
    });

    it( 'Displays skip ad button ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=skippable');
      await driver.findElement(By.id('content_video')).click();
      let log = driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, 'start'), 60000);
      await driver.switchTo().frame(driver.findElement(
        By.css('#content_video_ima-ad-container > div:nth-child(1) > iframe')));
      let skipButton = await driver.findElement(
        By.css('body > div.videoAdUi > div.videoAdUiSkipContainer.html5-stop-propagation > button'));
      await driver.wait(until.elementIsVisible(skipButton), 60000);
      await driver.sleep();
    });

     it( 'VMAP: Preroll ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=vmap_preroll');
      await driver.findElement(By.id('content_video')).click();
      let log = await driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, 'start'), 60000);
      await driver.wait(until.elementIsVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 60000);
      await driver.sleep();
    });

    it( 'VMAP: Midroll ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=vmap_midroll');
      await driver.findElement(By.id('content_video')).click();
      await driver.wait(until.elementIsVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 60000);
      await driver.sleep();
    });

    it( 'Nonlinear ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=nonlinear');
      await driver.findElement(By.id('content_video')).click();
      let log = await driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, 'start'), 60000);
      await driver.switchTo().frame(driver.findElement(
        By.css('#content_video_ima-ad-container > div:nth-child(1) > iframe')));
      await driver.wait(until.elementIsVisible(driver.findElement(
        By.id('GDFP'))), 60000);
      await driver.sleep();
    });

    it( 'Handles ad error 303: wrappers ' + browser.name, async function(){
      await driver.get('http://localhost:8000/test/webdriver/index.html?ad=error_303');
      let log = await driver.findElement(By.id('log'));
      await driver.wait(until.elementTextContains(log, '303'), 60000);
      await driver.sleep();
    });
  });
});
