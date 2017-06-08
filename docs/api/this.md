<!-- GENERATED FROM SOURCE -->

# this


---

## INDEX

- [METHODS](#methods)
  - [addContentAndAdsEndedListener](#addcontentandadsendedlistener-listener-)
  - [addContentEndedListener](#addcontentendedlistener-listener-)
  - [addEventListener](#addeventlistener-event-callback-)
  - [changeAdTag](#changeadtag-adtag-)
  - [getAdsManager](#getadsmanager)
  - [initializeAdDisplayContainer](#initializeaddisplaycontainer)
  - [localContentEndedListener](#localcontentendedlistener)
  - [pauseAd](#pausead)
  - [playAdBreak](#playadbreak)
  - [requestAds](#requestads)
  - [resumeAd](#resumead)
  - [setAdBreakReadyListener](#setadbreakreadylistener-listener-)
  - [setContent](#setcontent-contentsrc-adtag-playonload-)
  - [setContentWithAdTag](#setcontentwithadtag-contentsrc-adtag-playonload-)
  - [setContentWithAdsResponse](#setcontentwithadsresponse-contentsrc-adsresponse-playonload-)
  - [setShowCountdown](#setshowcountdown-showcountdownin-)
  - [start](#start)
  - [startFromReadyCallback](#startfromreadycallback)

- [PROPERTIES](#properties)
  - [VERSION](#version)
  - [adBreakReadyListener](#adbreakreadylistener)
  - [adDisplayContainerInitialized](#addisplaycontainerinitialized)
  - [adMuted](#admuted)
  - [adPlayheadTracker](#adplayheadtracker)
  - [adPlaying](#adplaying)
  - [adsActive](#adsactive)
  - [adsManagerDimensions](#adsmanagerdimensions)
  - [adsRenderingSettings](#adsrenderingsettings)
  - [allAdsCompleted](#alladscompleted)
  - [contentAndAdsEndedListeners](#contentandadsendedlisteners)
  - [contentComplete](#contentcomplete)
  - [contentEndedListeners](#contentendedlisteners)
  - [contentPlayheadTracker](#contentplayheadtracker)
  - [contentSource](#contentsource)
  - [resizeCheckInterval](#resizecheckinterval)
  - [seekCheckInterval](#seekcheckinterval)
  - [seekThreshold](#seekthreshold)

---

## METHODS

### addContentAndAdsEndedListener( listener )
> Adds a listener that will be called when content and all ads have
> finished playing.

##### PARAMETERS: 
* __listener__ `function` The listener to be called when content and ads complete.

_defined in_: [src/videojs.ima.js#L932](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L932)

---

### addContentEndedListener( listener )
> Adds a listener for the 'ended' event of the video player. This should be
> used instead of setting an 'ended' listener directly to ensure that the
> ima can do proper cleanup of the SDK before other event listeners
> are called.

##### PARAMETERS: 
* __listener__ `function` The listener to be called when content completes.

_defined in_: [src/videojs.ima.js#L923](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L923)

---

### addEventListener( event, callback )
> Ads an EventListener to the AdsManager. For a list of available events,
> see
> https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type

##### PARAMETERS: 
* __event__ `google.ima.AdEvent.Type` The AdEvent.Type for which to listen.
* __callback__ `function` The method to call when the event is fired.

_defined in_: [src/videojs.ima.js#L814](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L814)

---

### changeAdTag( adTag )
> Changes the ad tag. You will need to call requestAds after this method
> for the new ads to be requested.

##### PARAMETERS: 
* __adTag__ `?string` The ad tag to be requested the next time requestAds

_defined in_: [src/videojs.ima.js#L887](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L887)

---

### getAdsManager()
> Returns the instance of the AdsManager.

##### RETURNS: 
* `google.ima.AdsManager` The AdsManager being used by the plugin.

_defined in_: [src/videojs.ima.js#L824](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L824)

---

### initializeAdDisplayContainer()
> Initializes the AdDisplayContainer. On mobile, this must be done as a
> result of user action.

_defined in_: [src/videojs.ima.js#L206](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L206)

---

### localContentEndedListener()
> Local content ended listener for contentComplete.

_defined in_: [src/videojs.ima.js#L1296](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1296)

---

### pauseAd()
> Pauses the ad.

_defined in_: [src/videojs.ima.js#L947](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L947)

---

### playAdBreak()
> Called by publishers in manual ad break playback mode to start an ad
> break.

_defined in_: [src/videojs.ima.js#L380](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L380)

---

### requestAds()
> Creates the AdsRequest and request ads through the AdsLoader.

_defined in_: [src/videojs.ima.js#L214](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L214)

---

### resumeAd()
> Resumes the ad.

_defined in_: [src/videojs.ima.js#L958](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L958)

---

### setAdBreakReadyListener( listener )
> Sets the listener to be called to trigger manual ad break playback.

##### PARAMETERS: 
* __listener__ `function` The listener to be called to trigger manual ad break playback.

_defined in_: [src/videojs.ima.js#L940](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L940)

---

### setContent( contentSrc, adTag, playOnLoad )
> DEPRECATED: Use setContentWithAdTag.
> Sets the content of the video player. You should use this method instead
> of setting the content src directly to ensure the proper ad tag is
> requested when the video content is loaded.

##### PARAMETERS: 
* __contentSrc__ `?string` The URI for the content to be played. Leave
* __adTag__ `?string` The ad tag to be requested when the content loads.
* __playOnLoad__ `?boolean` True to play the content once it has loaded,

_defined in_: [src/videojs.ima.js#L840](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L840)

---

### setContentWithAdTag( contentSrc, adTag, playOnLoad )
> Sets the content of the video player. You should use this method instead
> of setting the content src directly to ensure the proper ad tag is
> requested when the video content is loaded.

##### PARAMETERS: 
* __contentSrc__ `?string` The URI for the content to be played. Leave
* __adTag__ `?string` The ad tag to be requested when the content loads.
* __playOnLoad__ `?boolean` True to play the content once it has loaded,

_defined in_: [src/videojs.ima.js#L858](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L858)

---

### setContentWithAdsResponse( contentSrc, adsResponse, playOnLoad )
> Sets the content of the video player. You should use this method instead
> of setting the content src directly to ensure the proper ads response is
> used when the video content is loaded.

##### PARAMETERS: 
* __contentSrc__ `?string` The URI for the content to be played. Leave
* __adsResponse__ `?string` The ads response to be requested when the
* __playOnLoad__ `?boolean` True to play the content once it has loaded,

_defined in_: [src/videojs.ima.js#L875](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L875)

---

### setShowCountdown( showCountdownIn )
> Changes the flag to show or hide the ad countdown timer.

##### PARAMETERS: 
* __showCountdownIn__ `boolean` Show or hide the countdown timer.

_defined in_: [src/videojs.ima.js#L1033](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1033)

---

### start()
> DEPRECATED: Use startFromReadyCallback
> Start ad playback, or content video playback in the absence of a
> pre-roll.

_defined in_: [src/videojs.ima.js#L306](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L306)

---

### startFromReadyCallback()
> Start ad playback, or content video playback in the absence of a
> pre-roll. **NOTE**: This method only needs to be called if you provide
> your own readyCallback as the second parameter to player.ima(). If you
> only provide options and do not provide your own readyCallback,
> **DO NOT** call this method. If you do provide your own readyCallback,
> you should call this method in the last line of that callback. For more
> info, see this method's usage in our advanced and playlist examples.

_defined in_: [src/videojs.ima.js#L321](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L321)

---

## PROPERTIES

### VERSION
> Current plugin version.

_defined in_: [src/videojs.ima.js#L1041](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1041)

---

### adBreakReadyListener
> Listener to be called to trigger manual ad break playback.

_defined in_: [src/videojs.ima.js#L1285](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1285)

---

### adDisplayContainerInitialized
> True if the AdDisplayContainer has been initialized. False otherwise.

_defined in_: [src/videojs.ima.js#L1131](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1131)

---

### adMuted
> True if the ad is muted, false otherwise.

_defined in_: [src/videojs.ima.js#L1189](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1189)

---

### adPlayheadTracker
> Stores data for the ad playhead tracker.

_defined in_: [src/videojs.ima.js#L1249](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1249)

---

### adPlaying
> True if ad is currently playing, false if ad is paused or ads are not
> currently displayed.

_defined in_: [src/videojs.ima.js#L1184](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1184)

---

### adsActive
> True if ads are currently displayed, false otherwise.
> True regardless of ad pause state if an ad is currently being displayed.

_defined in_: [src/videojs.ima.js#L1178](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1178)

---

### adsManagerDimensions
> Stores the dimensions for the ads manager.

_defined in_: [src/videojs.ima.js#L1260](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1260)

---

### adsRenderingSettings
> IMA SDK AdsRenderingSettings.

_defined in_: [src/videojs.ima.js#L1146](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1146)

---

### allAdsCompleted
> True if ALL_ADS_COMPLETED has fired, false until then.

_defined in_: [src/videojs.ima.js#L1199](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1199)

---

### contentAndAdsEndedListeners
> Content and ads ended listeners passed by the publisher to the plugin.
> These will be called when the plugin detects that content *and all
> ads* have completed. This differs from the contentEndedListeners in that
> contentEndedListeners will fire between content ending and a post-roll
> playing, whereas the contentAndAdsEndedListeners will fire after the
> post-roll completes.

_defined in_: [src/videojs.ima.js#L1280](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1280)

---

### contentComplete
> True if our content video has completed, false otherwise.

_defined in_: [src/videojs.ima.js#L1194](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1194)

---

### contentEndedListeners
> Content ended listeners passed by the publisher to the plugin. Publishers
> should allow the plugin to handle content ended to ensure proper support
> of custom ad playback.

_defined in_: [src/videojs.ima.js#L1270](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1270)

---

### contentPlayheadTracker
> Stores data for the content playhead tracker.

_defined in_: [src/videojs.ima.js#L1239](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1239)

---

### contentSource
> Stores the content source so we can re-populate it manually after a
> post-roll on iOS.

_defined in_: [src/videojs.ima.js#L1291](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1291)

---

### resizeCheckInterval
> Interval (ms) to check for player resize for fluid support.

_defined in_: [src/videojs.ima.js#L1225](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1225)

---

### seekCheckInterval
> Interval (ms) on which to check if the user is seeking through the
> content.

_defined in_: [src/videojs.ima.js#L1215](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1215)

---

### seekThreshold
> Threshold by which to judge user seeking. We check every 1000 ms to see
> if the user is seeking. In order for us to decide that they are *not*
> seeking, the content video playhead must only change by 900-1100 ms
> between checks. Any greater change and we assume the user is seeking
> through the video.

_defined in_: [src/videojs.ima.js#L1234](https://github.com/googleads/videojs-ima/blob/master/src/videojs.ima.js#L1234)

---

