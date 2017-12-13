var test = require('selenium-webdriver/testing');
var logging = require('selenium-webdriver/lib/logging');

test.describe( 'Test Suite', function() {

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
    driver.get('http://localhost:8080/test/webdriver/index.html?ad=1');
    driver.findElement(By.id('content_video')).click();
    driver.wait(until.elementLocated(
      By.id('content_video_ima-controls-div')), 10000);
    driver.wait(until.elementIsVisible(driver.findElement(
      By.id('content_video_ima-controls-div'))), 10000);
    driver.sleep();
  });

  test.it( 'Displays skippable ad UI', function(){ 
    driver.get('http://localhost:8080/test/webdriver/index.html?ad=0');
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
