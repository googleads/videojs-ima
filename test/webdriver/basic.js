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

driver.get('http://localhost:8080/test/webdriver/');
driver.findElement(By.id('content_video')).click();
driver.wait(until.elementIsVisible(
  driver.findElement(By.id('content_video_ima-controls-div'))), 8000);
driver.quit();
