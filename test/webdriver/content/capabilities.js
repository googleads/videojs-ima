// Describe browser test capabilities
// 
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

var browserstack = {
    name: 'browserstack-chrome-windows',
    server: 'http://hub-cloud.browserstack.com/wd/hub',
    capabilities: {
     'browserName' : 'Chrome',
     'browser_version' : '62.0',
     'os' : 'Windows',
     'os_version' : '10',
     'resolution' : '1024x768',
     'browserstack.debug' : 'true',
     'browserstack.user' : process.env.browserstackUser,
     'browserstack.key' : process.env.browserstackKey,
     'browserstack.local' : 'true',
     'browserstack.localIdentifier' : 'Test123'
    }
};

exports.browsers = browsers;
exports.browserstack = browserstack;
