var video, player;

module('Ad Framework', {
  setup: function() {
    video = document.createElement('video');
    video.id = 'video';
    document.getElementById('qunit-fixture').appendChild(video);
    player = videojs(video);
  },
  teardown: function() {
  }
});

test('the environment is sane', function() {
  ok(true, 'true is ok');
});

test('video plays on bad ad tag', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://this.site.does.not.exist.google.com'
  };
  player.ima(options);
  var playCount = 0;
  player.play = function() {
    playCount++;
  }
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();
  setTimeout(function() {
    // Play called once by us and once by the plugin on error.
    equal(2, playCount);
    start();
  }, 5000);
});

test('ad plays on good ad tag', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
        'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
        'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
        'url=[referrer_url]&correlator=[timestamp]'
  }
  player.ima(options);
  var contentPauseCount = 0;
  player.ima.onContentPauseRequested_ = function() {
    contentPauseCount++;
  }
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();
  setTimeout(function() {
    equal(1, contentPauseCount);
    start();
  }, 5000);
});
