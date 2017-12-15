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

test.describe( 'Basic Tests', function() {

  this.timeout(10 * 1000);

  var webdriver = require('selenium-webdriver'),
      until = webdriver.until;
      By = webdriver.By;

  const chromedriver = require('chromedriver');
  const chromeCapabilities = webdriver.Capabilities.chrome();
  chromeCapabilities.set('chromeOptions', {args: ['--headless']});

  var driver = new webdriver.Builder()
      .forBrowser('chrome')
      .withCapabilities(chromeCapabilities)
      .build();

  test.after(function() {
    driver.quit();
  });

  test.it( 'Displays ad UI', function(){ 
    driver.get('http://localhost:8080/test/webdriver/index.html?ad=0');
    driver.findElement(By.id('content_video')).click();
    driver.wait(until.elementLocated(
      By.id('content_video_ima-controls-div')), 10000);
    driver.wait(until.elementIsVisible(driver.findElement(
      By.id('content_video_ima-controls-div'))), 10000);
    driver.sleep();
  });

  test.it( 'Displays skippable ad UI', function(){ 
    driver.get('http://localhost:8080/test/webdriver/index.html?ad=1');
    driver.findElement(By.id('content_video')).click();
    driver.wait(until.elementLocated(
      By.id('content_video_ima-controls-div')), 10000);
    driver.wait(until.elementIsVisible(driver.findElement(
      By.id('content_video_ima-controls-div'))), 10000);
    driver.sleep();
  });
  test.it( 'Handles ad error: wrappers', function(){ 
    driver.get('http://localhost:8080/test/webdriver/index.html?ad=2');
    let log = driver.findElement(By.id('log'));
    driver.wait(until.elementTextContains(log, '303'), 10000);
    driver.sleep();
  });
});
