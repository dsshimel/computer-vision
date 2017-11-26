from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from motion_detector import MotionDetector

# based on https://www.smashingmagazine.com/2016/02/simple-augmented-reality-with-opencv-a-three-js/#3-websockets-in-both-front-end-and-back-end

md = MotionDetector()
md.run()