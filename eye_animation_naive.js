/*
  This just multiplies eyes with no transitions, re-drawing the grid each time.
*/

var MAX_ROWS = 8;

var width = window.innerWidth;
var height = window.innerHeight;

var eyes = [];

function removeEyes() {
  eyes.forEach(function(eye) {
    eye.remove();
  });
  eyes = [];
}

function indexToCoordinates(i, numColumns) {
  return [Math.floor(i / numColumns), i % numColumns];
}

function drawEyes(numRows, numColumns) {
  var cellWidth = width / numColumns;
  var cellHeight = height / numRows;
  var radius = Math.min(cellWidth, cellHeight) / 3;

  for (var i = 0; i < numRows; i++) {
    for (var j = 0; j < numColumns; j++) {
      var x = j * cellWidth + (cellWidth / 2);
      var y = i * cellHeight + (cellHeight / 2);

      var eye = new Path.Circle({
        center: [x, y],
        radius: radius,
        fillColor: 'black',
      });

      eyes.push(eye);
    }
  }
}

var numRows = 1;
var numColumns = 1;
var splitSideways = true;

drawEyes(numRows, numColumns);

var interval = setInterval(function() {
  splitSideways = !splitSideways;

  numRows += (splitSideways ? 1 : 0);
  numColumns += (splitSideways ? 0 : 1);

  removeEyes();
  drawEyes(numRows, numColumns);

  if (numRows > MAX_ROWS || numColumns > MAX_ROWS) {
    clearInterval(interval);
  }
}, 1000);
