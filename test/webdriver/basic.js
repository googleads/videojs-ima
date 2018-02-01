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

var test = require('selenium-webdriver/testing');
var browsers = require('./content/capabilities');

test.describe('Basic Tests', function() {
  this.timeout(15 * 1000);

  browsers.browsers.forEach(function(browser) {

    var webdriver = require('selenium-webdriver'),
        until = webdriver.until;
        By = webdriver.By;

    var driver;

    test.before(function() {
      driver = new webdriver.Builder()
            .forBrowser(browser.capabilities.browserName)
            .usingServer(browser.server)
            .withCapabilities(browser.capabilities)
            .build();
    });

    test.after(function() {
      driver.quit();
    });

    test.it( 'Displays ad UI ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=linear');
      driver.findElement(By.id('content_video')).click();
      driver.sleep(1000);
      driver.wait(until.elementIsVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 30000);
      driver.sleep();
    });

    test.it( 'Hides controls when ad ends ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=linear');
      driver.findElement(By.id('content_video')).click();
      driver.sleep(1000);
      driver.wait(until.elementIsNotVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 14000);
      driver.sleep();
    });

    test.it( 'Clicks skippable ad skip button ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=skippable');
      driver.findElement(By.id('content_video')).click();

      driver.sleep(6000);
      driver.switchTo().frame(driver.findElement(
        By.css('#content_video_ima-ad-container > div:nth-child(1) > iframe')));
      let skipButton = driver.findElement(
        By.css('body > div.videoAdUi > div.videoAdUiSkipContainer.html5-stop-propagation > button'));
      driver.wait(until.elementIsVisible(skipButton), 10000);

      skipButton.click();

      driver.wait(until.stalenessOf(skipButton), 10000);
      driver.sleep();
    });

     test.it( 'VMAP: Preroll ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=vmap_preroll');
      driver.findElement(By.id('content_video')).click();
      driver.sleep(1000);
      driver.wait(until.elementIsVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 10000);
      driver.sleep();
    });

    test.it( 'VMAP: Midroll ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=vmap_midroll');
      driver.findElement(By.id('content_video')).click();
      driver.wait(until.elementIsVisible(driver.findElement(
        By.id('content_video_ima-controls-div'))), 10000);
      driver.sleep();
    });

    test.it( 'Nonlinear ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=nonlinear');
      driver.findElement(By.id('content_video')).click();
      driver.sleep(1000);
      driver.switchTo().frame(driver.findElement(
        By.css('#content_video_ima-ad-container > div:nth-child(1) > iframe')));
      driver.wait(until.elementIsVisible(driver.findElement(
        By.id('GDFP'))), 10000);
      driver.sleep();
    });

    test.it( 'Handles ad error 303: wrappers ' + browser.name, function(){
      driver.get('http://localhost:8080/test/webdriver/index.html?ad=error_303');
      let log = driver.findElement(By.id('log'));
      driver.wait(until.elementTextContains(log, '303'), 10000);
      driver.sleep();
    });
  });
});