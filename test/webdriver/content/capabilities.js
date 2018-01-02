// Describe browser test capabilities
// 
var webdriver = require('selenium-webdriver');

const chromeHeadless = webdriver.Capabilities.chrome();
chromeHeadless.set('chromeOptions', {args: ['--headless']});

var browsers = [
  { 
    name: 'chrome-local',
    server: '', //local
    capabilities: chromeHeadless
  },
  {
    name: 'browserstack-chrome-windows',
    server: 'http://hub-cloud.browserstack.com/wd/hub',
    capabilities: {
     'browserName' : 'Chrome',
     'browser_version' : '62.0',
     'os' : 'Windows',
     'os_version' : '10',
     'resolution' : '1024x768',
     'browserstack.user' : 'yurypavlotsky1',
     'browserstack.key' : 'LyymYtkBDwVWsJ233ykX',
     'browserstack.local' : 'true',
     'browserstack.localIdentifier' : 'Test123'
    },  
  },
];

exports.browsers = browsers;
