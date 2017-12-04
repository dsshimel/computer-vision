var ws = new WebSocket('ws://localhost:7777');

// Higher values makes eye smaller
const EYE_SCALE_FACTOR = 2;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var eyeWidth = windowWidth / EYE_SCALE_FACTOR;
var eyeHeight = windowHeight / EYE_SCALE_FACTOR;
var xEyeTranslate = (windowWidth - eyeWidth) / 2;
var yEyeTranslate = (windowHeight - eyeHeight) / 2;

var canvas = document.getElementById('scene');
canvas.width = windowWidth;
canvas.height = windowHeight;
var context = canvas.getContext('2d');

var drawCircle = function(context, x, y, radius, color, strokeColor) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = radius / 10;
  context.strokeStyle = strokeColor || context.fillStyle;
  context.stroke();
};

/** https://www.xarg.org/2017/07/how-to-map-a-square-to-a-circle/ */
var mapSquareToCircle = function(x, y) {
  return [
      x * Math.sqrt(1 - Math.pow(y, 2) / 2),
      y * Math.sqrt(1 - Math.pow(x, 2) / 2)]
};

ws.onopen = function() {
  console.log('connection opened');
};

ws.onclose = function() {
  console.log('connection closed');
};

var feedHeight = null;
var feedWidth = null;
var canvasFeedWidthRatio = null;
var canvasFeedHeightRatio = null;

var historyLength = 3;
var xHistory = [];
var yHistory = [];
for (var i = 0; i < historyLength; i++) {
  xHistory.push(windowWidth / 2);
  yHistory.push(windowHeight / 2);
}

var average = function(history) {
  var sum = 0;
  for (var coord of history) {
    sum += coord;
  }
  return sum / history.length;
}

/** Handles a message from the web socket. */
ws.onmessage = function(event) {
  var data = JSON.parse(event.data);

  if (!feedWidth && !feedHeight) {
    feedWidth = parseInt(data.width);
    feedHeight = parseInt(data.height);
    canvasFeedWidthRatio = windowWidth / feedWidth;
    canvasFeedHeightRatio = windowHeight / feedHeight;
    console.log('height: ' + feedHeight + ', width: ' + feedWidth);
  }
    
  var mX = data.m_x;
  var mY = data.m_y;

  var x = xHistory[historyLength - 1];
  var y = yHistory[historyLength - 1];
  if (!!mX && !!mY) {
    // Mirror the feed. May not need this depending on setup
    mX = feedWidth - mX;
    x = (mX * canvasFeedWidthRatio + x) / 2;
    y = (mY * canvasFeedHeightRatio + y) / 2;
  }

  xHistory.push(x);
  yHistory.push(y);
  xHistory.shift();
  yHistory.shift();

  console.log(x + ', ' + y);
};

/** Called in a loop to draw a frame of the animation. */
var draw = function() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, windowWidth, windowHeight);

  xAvg = average(xHistory);
  yAvg = average(yHistory);
  // Scale x and y window coordinates to be on a unit square.
  // xUnit and yUnit are floating point numbers between -1 and 1
  xUnit = ((2 * xAvg) / windowWidth) - 1;
  yUnit = ((2 * yAvg) / windowHeight) - 1;

  var circleCoords = mapSquareToCircle(xUnit, yUnit);
  xCircle = ((circleCoords[0] + 1) / 2) * windowWidth;
  yCircle = ((circleCoords[1] + 1) / 2) * windowHeight;
  // Center the eye
  var xEye = (xCircle / EYE_SCALE_FACTOR) + xEyeTranslate; 
  var yEye = (yCircle / EYE_SCALE_FACTOR) + yEyeTranslate; 

  var irisRadius = Math.min(eyeWidth, eyeHeight) / 3;
  var pupilRadius = Math.min(eyeWidth, eyeHeight) / 6;

  var outerEyeWidth = (eyeWidth / 2) + irisRadius;
  var outerEyeHeight = (eyeHeight / 2) + pupilRadius;
  // Draw an ellipse denoting the boundary of the eyeball
  context.lineWidth = 2;
  context.strokeStyle = '#000000';
  context.beginPath();
  context.ellipse(xEyeTranslate + eyeWidth / 2, yEyeTranslate + eyeHeight / 2,
      outerEyeWidth, outerEyeHeight, 2 * Math.PI, 0, 2 * Math.PI);
  context.fillStyle = 'white';
  context.fill();
  context.stroke();

  // Draw iris, then pupil
  drawCircle(context, xEye, yEye, irisRadius, 'red', 'yellow');
  drawCircle(context, xEye, yEye, pupilRadius, 'black');
};

(function render() {
  requestAnimationFrame(render);
  draw();
})();