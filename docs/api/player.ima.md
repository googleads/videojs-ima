<!-- GENERATED FROM SOURCE -->

# player.ima


---

## INDEX

- [METHODS](#methods)
  - [addContentAndAdsEndedListener](#addcontentandadsendedlistener-listener-)
  - [addContentEndedListener](#addcontentendedlistener-listener-)
  - [addEventListener](#addeventlistener-event-callback-)
  - [getAdsManager](#getadsmanager)
  - [initializeAdDisplayContainer](#initializeaddisplaycontainer)
  - [pauseAd](#pausead)
  - [playAdBreak](#playadbreak)
  - [requestAds](#requestads)
  - [resumeAd](#resumead)
  - [setAdBreakReadyListener](#setadbreakreadylistener-listener-)
  - [setShowCountdown](#setshowcountdown-showcountdownin-)
  - [start](#start)
  - [updateCurrentTime](#updatecurrenttime)

---

## METHODS

### addContentAndAdsEndedListener( listener )
> Adds a listener that will be called when content and all ads have
> finished playing.

##### PARAMETERS: 
* __listener__ `function` The listener to be called when content and ads complete.

_defined in_: [src/videojs.ima.js#L689](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L689)

---

### addContentEndedListener( listener )
> Adds a listener for the 'ended' event of the video player. This should be
> used instead of setting an 'ended' listener directly to ensure that the
> ima can do proper cleanup of the SDK before other event listeners
> are called.

##### PARAMETERS: 
* __listener__ `function` The listener to be called when content completes.

_defined in_: [src/videojs.ima.js#L680](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L680)

---

### addEventListener( event, callback )
> Ads an EventListener to the AdsManager. For a list of available events,
> see
> https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type

##### PARAMETERS: 
* __event__ `google.ima.AdEvent.Type` The AdEvent.Type for which to listen.
* __callback__ `function` The method to call when the event is fired.

_defined in_: [src/videojs.ima.js#L630](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L630)

---

### getAdsManager()
> Returns the instance of the AdsManager.

##### RETURNS: 
* `google.ima.AdsManager` The AdsManager being used by the plugin.

_defined in_: [src/videojs.ima.js#L640](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L640)

---

### initializeAdDisplayContainer()
> Initializes the AdDisplayContainer. On mobile, this must be done as a
> result of user action.

_defined in_: [src/videojs.ima.js#L145](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L145)

---

### pauseAd()
> Pauses the ad.

_defined in_: [src/videojs.ima.js#L704](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L704)

---

### playAdBreak()
> Called by publishers in manual ad break playback mode to start an ad
> break.

_defined in_: [src/videojs.ima.js#L278](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L278)

---

### requestAds()
> Creates the AdsRequest and request ads through the AdsLoader.

_defined in_: [src/videojs.ima.js#L153](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L153)

---

### resumeAd()
> Resumes the ad.

_defined in_: [src/videojs.ima.js#L715](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L715)

---

### setAdBreakReadyListener( listener )
> Sets the listener to be called to trigger manual ad break playback.

##### PARAMETERS: 
* __listener__ `function` The listener to be called to trigger manual ad break playback.

_defined in_: [src/videojs.ima.js#L697](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L697)

---

### setShowCountdown( showCountdownIn )
> Changes the flag to show or hide the ad countdown timer.

##### PARAMETERS: 
* __showCountdownIn__ `boolean` Show or hide the countdown timer.

_defined in_: [src/videojs.ima.js#L769](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L769)

---

### start()
> Start ad playback, or content video playback in the absence of a
> pre-roll.

_defined in_: [src/videojs.ima.js#L229](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L229)

---

### updateCurrentTime()
> Updates the current time of the video

_defined in_: [src/videojs.ima.js#L737](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L737)

---

