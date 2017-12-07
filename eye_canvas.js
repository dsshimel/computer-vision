var ws = new WebSocket('ws://localhost:7777');

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var xCenter = windowWidth / 2;
var yCenter = windowHeight / 2;
var eyeOuterDiameter = Math.min(windowWidth, windowHeight);
var xEyeTranslate = (windowWidth - eyeOuterDiameter) / 2;
var yEyeTranslate = (windowHeight - eyeOuterDiameter) / 2;
var irisRadius = eyeOuterDiameter / 5;
var pupilRadius = eyeOuterDiameter / 10;

var canvas = document.getElementById('scene');
canvas.width = windowWidth;
canvas.height = windowHeight;
var context = canvas.getContext('2d');

var drawCircle = function(context, x, y, radius, color, strokeColor) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = pupilRadius / 12;
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
  xCircle = circleCoords[0] * ((eyeOuterDiameter / 2) - irisRadius);
  yCircle = circleCoords[1] * ((eyeOuterDiameter / 2) - irisRadius);
  // Center the eye
  var xEye = xCircle + xCenter;
  var yEye = yCircle + yCenter;

  // Draw a circle denoting the boundary of the eyeball
  context.lineWidth = 2;
  context.strokeStyle = '#000000';
  context.beginPath();
  context.ellipse(xCenter, yCenter, eyeOuterDiameter / 2, eyeOuterDiameter / 2,
      2 * Math.PI, 0, 2 * Math.PI);
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