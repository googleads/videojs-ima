var PlayerWrapper = function() {
  this.playhead = {
    currentTime: 0,
    duration: 0
  };
};

PlayerWrapper.prototype.incrementTime = function() {
  this.playhead.currentTime += 1;
  this.playhead.duration += 10;
};

PlayerWrapper.prototype.getPlayhead = function() {
  return this.playhead;
};

var SdkImpl = function(controller) {
  this.playhead = controller.getPlayhead();
};

var Controller = function() {
  this.pW = new PlayerWrapper();
  this.sI = new SdkImpl(this);

  console.log('PW playhead: ');
  console.log(this.pW.playhead);
  console.log('SI playhead: ');
  console.log(this.sI.playhead);
  this.pW.incrementTime();
  console.log('After increment');
  console.log('PW playhead: ');
  console.log(this.pW.playhead);
  console.log('SI playhead: ');
  console.log(this.sI.playhead);
};

Controller.prototype.getPlayhead = function() {
  return this.pW.getPlayhead();
};

var myC = new Controller();