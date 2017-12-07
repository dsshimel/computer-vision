/*
  This multiplies the eyes with a transition.

  NOTE: Cannot use es6 syntax with paper.js for some godawful reason???
*/

// onFrame fires every 0.016s or every 16ms
var MAX_SPLITS = 6;
var ANIMATION_DURATION = 0.5; // in seconds
var FRAMES_PER_SECOND = 1 / 0.016;
var INTERVAL = 1; // in seconds
var FRAME_INTERVAL = Math.ceil(INTERVAL * FRAMES_PER_SECOND);
var ANIMATION_FRAMES = ANIMATION_DURATION * FRAMES_PER_SECOND;

var width = window.innerWidth;
var height = window.innerHeight;

var eyes = [];
var numRows = 1;
var numColumns = 1;
var splitSideways = true;
var numSplits = 0;
var radius = height / 3;

var eye = new Path.Circle({
  center: [width / 2, height / 2],
  radius: radius,
  fillColor: 'black',
});

eyes.push(eye);

var animating = false;
var animationTime = 0;

function onFrame(event) {
  if (numSplits < MAX_SPLITS) {
    animate(event);
  }
}

function animate(event) {
  // Animation interval start
  if (event.count > 0 && event.count % FRAME_INTERVAL === 0) {
    animationTime = event.time;
    animating = true;

    numSplits += 1;
    splitSideways = !splitSideways;

    numRows *= (splitSideways ? 1 : 2);
    numColumns *= (splitSideways ? 2 : 1);

    var cellWidth = width / numColumns;
    var cellHeight = height / numRows;
    var newRadius = Math.min(cellWidth, cellHeight) / 3;
    var radiusDelta = radius - newRadius;
    radius = newRadius;

    var dx;
    var dy;
    if (splitSideways) {
      dx = cellWidth / 2;
      dy = 0;
    } else {
      dx = 0;
      dy = cellHeight / 2;
    }

    var clones = [];
    eyes.forEach(function(eye, i) {
      var clone = eye.clone();

      eye.step = {
        x: dx / ANIMATION_FRAMES,
        y: dy / ANIMATION_FRAMES,
        r: radiusDelta / ANIMATION_FRAMES,
      };
      clone.step = {
        x: -dx / ANIMATION_FRAMES,
        y: -dy / ANIMATION_FRAMES,
        r: radiusDelta / ANIMATION_FRAMES,
      };

      clones.push(clone);
    });

    eyes = eyes.concat(clones);
  }

  // During animation
  if (animating) {
    eyes.forEach(function(eye) {
      eye.position.x += eye.step.x;
      eye.position.y += eye.step.y;

      setRadius(eye, eye.step.r);
    });
  }

  // Animation interval end
  if (animating && event.time - animationTime > ANIMATION_DURATION) {
    animating = false;
  }
}

function setRadius(eye, delta) {
  var currRadius = eye.bounds.width / 2;
  var newRadius = currRadius - delta;
  eye.scale(newRadius / currRadius);
}
