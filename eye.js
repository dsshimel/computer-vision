var ws = new WebSocket('ws://localhost:7777');

var height = null;
var width = null;

ws.onopen = function() {
  console.log('connection opened');
};

ws.onclose = function() {
  console.log('connection closed');
};

ws.onmessage = function(event) {
  var data = JSON.parse(event.data);
  if(!height && !width) {
    height = parseInt(data['height']);
    width = parseInt(data['width']);
    console.log('height: ' + height + ', width: ' + width);    
  } else {
    console.log(data['m_x'] + ', ' + data['m_y']);    
  }
};
