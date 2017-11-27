var ws = new WebSocket('ws://localhost:7777');

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var canvas = document.getElementById('scene');
canvas.width = windowWidth;
canvas.height = windowHeight;
var context = canvas.getContext('2d');

var drawCircle = function(context, x, y) {
  context.beginPath();
  context.arc(x, y, /* radius= */ 10, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = '#003300';
  context.stroke();
};

var feedHeight = null;
var feedWidth = null;
var canvasFeedWidthRatio = null;
var canvasFeedHeightRatio = null;

ws.onopen = function() {
  console.log('connection opened');
};

ws.onclose = function() {
  console.log('connection closed');
};

var x0 = windowWidth / 2;
var y0 = windowHeight / 2;
var x = x0;
var y = y0;

ws.onmessage = function(event) {
  var data = JSON.parse(event.data);
  if(!feedHeight && !feedWidth) {
    feedHeight = parseInt(data['height']);
    feedWidth = parseInt(data['width']);
    console.log('height: ' + feedHeight + ', width: ' + feedWidth);
    canvasFeedWidthRatio = windowWidth / feedWidth;
    canvasFeedHeightRatio = windowHeight / feedHeight;
  } else {
    x0 = x;
    y0 = y;

    var mX = data['m_x'];
    var mY = data['m_y'];

    if (!mX || !mY) {
      x = windowWidth / 2;
      y = windowHeight / 2;
      return;
    }

    x = (mX * canvasFeedWidthRatio);
    y = (mY * canvasFeedHeightRatio);
    console.log(x + ', ' + y);
  }
};

var draw = function() {
  context.clearRect(0, 0, windowWidth, windowHeight);
  if (!!x && !!y) {
    drawCircle(context, (x + x0) / 2, (y + y0) / 2);
  }
};

(function render() {
  // console.log('in render loop');
  requestAnimationFrame(render);
  draw();
})();