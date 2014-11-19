#IMA SDK Plugin for Video.js

##Introduction
The IMA SDK Plugin for Video.js provides a quick and easy IMA SDK integration for the Video.js player.

The framework is currently in beta, allowing interested developers to try it out and send feedback before we finalize the APIs and features.

To see the plugin in action, check out our [samples](//googleads.github.io/videojs-ima/).

##Features
- Easily integrate the Google IMA SDK into Video.js to enable advertising on your video content.

##Getting started
The easiest way to get started is by using [npm](//www.npmjs.org/).

```
npm install videojs-ima
```

If you don't use npm, you can download the source from the src/ folder and include it directly in your project. You'll also need to download the source for the [videojs-contrib-ads plugin](//github.com/videojs/videojs-contrib-ads).

In your index.html file, create a new video.js player and load a (currently empty) javascript file:

```html
<html>
  <head>
    <!-- Load dependent stylesheets. -->
    <link href="//vjs.zencdn.net/4.5/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="path/to/videojs.ads.css" />
    <link rel="stylesheet" href="path/to/videojs.ima.css" />
  </head>

  <body>
    <video id="content_video" class="video-js vjs-default-skin"
        controls preload="auto" width="YOUR_VIDEO_WIDTH" height="YOUR_VIDEO_HEIGHT">
      <source src="PATH_TO_YOUR_CONTENT_VIDEO" type="YOUR_CONTENT_VIDEO_TYPE" />
    </video>
    <!-- Load dependent scripts -->
    <script src="//vjs.zencdn.net/4.5/video.js"></script>
    <script src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
    <script src="/path/to/videojs.ads.js"></script>
    <script src="/path/to/videojs.ima.js"></script>
    <script src="player.js"></script>
  </body>
</html>
```

In player.js, load the ads library and set up the IMA plugin:

```javascript
var player = videojs('content_video');

var options = {
  id: 'content_video',
  adTagUrl: 'YOUR_AD_TAG'
};

player.ima(options);
player.ima.requestAds();
// On mobile devices, you must call initializeAdDisplayContainer as the result
// of a user action (e.g. button click). If you do not make this call, the SDK
// will make it for you, but not as the result of a user action. For more info
// see our examples, all of which are set up to work on mobile devices.
// player.ima.initializeAdDisplayContainer();
player.play();
```

That's all there is to it!

## Additional settings
The plugin accepts additional settings beyond the two required settings shown in the previous snippet. A summary of all settings follows:
```javascript
{
  id: <string> REQUIRED The id of your video player
  adTagUrl: <string> REQUIRED A URL which returns a VAST response
  adsRenderingSettings: <Object> JSON object with ads rendering settings as defined in the IMA SDK Docs(1).
  debug: <boolean> True to load the debug version of the plugin, false to load the non-debug version. Defaults to false.
  locale: <string> Locale for ad localization. This may be any  ISO 639-1 (two-letter) or ISO 639-2 (three-letter) code(2). Defaults to 'en'.
  nonLinearWidth: <Number> Desired width of non-linear ads. Defaults to player width.
  nonLinearHeight: <Number> Desired height for non-linear ads. Defaults to 1/3 player height.
  vpaidAllowed: <boolean> Whether or not to allow VPAID ads. Defaults to true.
}
```
(1) [IMA SDK Docs](//developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdsRenderingSettings)
<br />
(2) [Valid locale codes](http://www.loc.gov/standards/iso639-2/php/English_list.php)

##Where do I report issues?
Please report issues on the [issues page](../../issues).

##Support
If you have questions about the framework, you can ask them at //groups.google.com/d/forum/google-media-framework

##How do I contribute?
See [this wiki article](../../wiki/Becoming-a-contributor) for details.

##Requirements
  - Your favorite text editor
  - A JavaScript enabled browser

##Authors
  - api.sbusolits@gmail.com (Shawn Busolits) Please direct questions or bug reports to the Github issues page.
