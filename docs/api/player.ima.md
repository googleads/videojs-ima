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

_defined in_: [src/videojs.ima.js#L720](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L720)

---

### addContentEndedListener( listener )
> Adds a listener for the 'ended' event of the video player. This should be
> used instead of setting an 'ended' listener directly to ensure that the
> ima can do proper cleanup of the SDK before other event listeners
> are called.

##### PARAMETERS: 
* __listener__ `function` The listener to be called when content completes.

_defined in_: [src/videojs.ima.js#L711](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L711)

---

### addEventListener( event, callback )
> Ads an EventListener to the AdsManager. For a list of available events,
> see
> https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type

##### PARAMETERS: 
* __event__ `google.ima.AdEvent.Type` The AdEvent.Type for which to listen.
* __callback__ `function` The method to call when the event is fired.

_defined in_: [src/videojs.ima.js#L657](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L657)

---

### getAdsManager()
> Returns the instance of the AdsManager.

##### RETURNS: 
* `google.ima.AdsManager` The AdsManager being used by the plugin.

_defined in_: [src/videojs.ima.js#L667](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L667)

---

### initializeAdDisplayContainer()
> Initializes the AdDisplayContainer. On mobile, this must be done as a
> result of user action.

_defined in_: [src/videojs.ima.js#L139](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L139)

---

### pauseAd()
> Pauses the ad.

_defined in_: [src/videojs.ima.js#L735](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L735)

---

### playAdBreak()
> Called by publishers in manual ad break playback mode to start an ad
> break.

_defined in_: [src/videojs.ima.js#L282](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L282)

---

### requestAds()
> Creates the AdsRequest and request ads through the AdsLoader.

_defined in_: [src/videojs.ima.js#L147](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L147)

---

### resumeAd()
> Resumes the ad.

_defined in_: [src/videojs.ima.js#L746](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L746)

---

### setAdBreakReadyListener( listener )
> Sets the listener to be called to trigger manual ad break playback.

##### PARAMETERS: 
* __listener__ `function` The listener to be called to trigger manual ad break playback.

_defined in_: [src/videojs.ima.js#L728](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L728)

---

### setShowCountdown( showCountdownIn )
> Changes the flag to show or hide the ad countdown timer.

##### PARAMETERS: 
* __showCountdownIn__ `boolean` Show or hide the countdown timer.

_defined in_: [src/videojs.ima.js#L800](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L800)

---

### start()
> Start ad playback, or content video playback in the absence of a
> pre-roll.

_defined in_: [src/videojs.ima.js#L225](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L225)

---

### updateCurrentTime()
> Updates the current time of the video

_defined in_: [src/videojs.ima.js#L768](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L768)

---

