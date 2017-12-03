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

var drawCircle = function(context, x, y) {
  context.beginPath();
  context.arc(x, y, /* radius= */ 20, 0, 2 * Math.PI, false);
  context.fillStyle = 'black';
  context.fill();
  context.lineWidth = 20;
  context.strokeStyle = '#FF0000';
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

var x0 = windowWidth / 2;
var y0 = windowHeight / 2;
var x = x0;
var y = y0;

/** Handles a message from the web socket. */
ws.onmessage = function(event) {
  var data = JSON.parse(event.data);

  if (data.width && data.height) {
    feedHeight = parseInt(data.height);
    feedWidth = parseInt(data.width);
    canvasFeedWidthRatio = windowWidth / feedWidth;
    canvasFeedHeightRatio = windowHeight / feedHeight;
    console.log('height: ' + feedHeight + ', width: ' + feedWidth);
  } else {
    x0 = x;
    y0 = y;

    var mX = data.m_x || feedWidth / 2;
    var mY = data.m_y || feedHeight / 2;

    x = (mX * canvasFeedWidthRatio);
    y = (mY * canvasFeedHeightRatio);
    console.log(x + ', ' + y);
  }
};

/** Called in a loop to draw a frame of the animation. */
var draw = function() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, windowWidth, windowHeight);

  if (!!x && !!y) {
    xAvg = (x + x0) / 2;
    yAvg = (y + y0) / 2;
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
    drawCircle(context, xEye, yEye);

    // Draw an ellipse denoting the boundary of the eyeball
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.beginPath();
    context.ellipse(xEyeTranslate + eyeWidth / 2, yEyeTranslate + eyeHeight / 2,
        eyeWidth / 2, eyeHeight / 2, 2 * Math.PI, 0, 2 * Math.PI);
    context.stroke();
  }
};

(function render() {
  requestAnimationFrame(render);
  draw();
})();