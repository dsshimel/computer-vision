from motion_detector import MotionDetector
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import threading
import time

# SimpleWebSocketServer: https://github.com/dpallot/simple-websocket-server
# based on https://www.smashingmagazine.com/2016/02/simple-augmented-reality-with-opencv-a-three-js/#3-websockets-in-both-front-end-and-back-end

client = None
server = None

class MotionReporterSocket(WebSocket):
  def handleConnected(self):
    global client
    # clients.push(self)
    client = self
    print('client connected')

  def handleClose(self):
    global clients
    # clients.remove(self)
    client = None
    print('client closed')

def run_server():
  global server
  # empirically determined
  frame_rate = 30.0
  server = SimpleWebSocketServer(host='', port=7777, websocketclass=MotionReporterSocket, selectInterval=1.0 / frame_rate)
  print('server is serving forever')
  server.serveforever()

t = threading.Thread(target=run_server)
t.start()

while not client:
  print('waiting for client to connect')
  time.sleep(1)

print('client connected')

md = MotionDetector(client)
md.run()

if server:
  print('closing server')
  server.close()
