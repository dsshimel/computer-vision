from motion_detector import MotionDetector
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import threading
import time
import traceback

# SimpleWebSocketServer: https://github.com/dpallot/simple-websocket-server
# based on https://www.smashingmagazine.com/2016/02/simple-augmented-reality-with-opencv-a-three-js/#3-websockets-in-both-front-end-and-back-end

client = None
server = None
motion_detector = MotionDetector(None)

class MotionReporterSocket(WebSocket):
  def handleConnected(self):
    global client
    client = self
    motion_detector.set_socket(client)
    print('client connected')

  def handleClose(self):
    global clients
    # clients.remove(self)
    client = None
    motion_detector.clear_socket()
    print('client closed')

def run_server():
  global server
  # empirically determined by measuring the webcam's output
  frame_rate = 30.0
  server = SimpleWebSocketServer(
      host='', port=7777, websocketclass=MotionReporterSocket, selectInterval=1.0 / frame_rate)
  print('server is serving forever')
  server.serveforever()

t = threading.Thread(target=run_server)
t.start()

# Have to use CTRL+Break to get out of this loop.
# Maybe there's a more graceful way to this?
try:
  while True:
    while not client:
      print('waiting for client to connect')
      time.sleep(1)
    # This line will block until the webcam feed is closed
    motion_detector.run()
    client.close()
    client = None
except Exception as e:
  traceback.print_exc()

if client:
  print('closing client')
  client.close()
if server:
  print('closing server')
  server.close()
