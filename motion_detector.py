# from builtins import str
import cv2
import json
import numpy as np
import time
import traceback

# Based on http://www.steinm.com/blog/motion-detection-webcam-python-opencv-differential-images/

def diff_img(frame0, frame1, frame2):
  diff0 = cv2.absdiff(frame0, frame1)
  diff1 = cv2.absdiff(frame1, frame2)
  return cv2.bitwise_and(diff0, diff1)

def convert_to_bw(im):
  return cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)

class MotionDetector:
  def __init__(self, socket):
    self.m_x = None
    self.m_y = None
    self.height = None
    self.width = None
    self.set_socket(socket)

  def read_camera(self, capture, as_bw):
    ret, result = capture.read()
    if not ret:
      return None
    return convert_to_bw(result) if as_bw else result

  def send_message(self, json_object):
    if self.socket:
      message = str(json.dumps(json_object))
      self.socket.sendMessage(message)

  def clear_socket(self):
    self.socket = None

  def set_socket(self, new_socket):
    self.socket = new_socket

  def run(self):
    capture = cv2.VideoCapture(0)
    if not capture.isOpened():
      capture = cv2.VideoCapture(1)
    if not capture.isOpened():
      print('Could not open camera on channel 0 or 1')
      exit()

    # Try to capture at 1920x1080, it'll fall back to a lower
    # resolution if your camera can't support this one.
    capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1920);
    capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080);

    # 'image' is a np.ndarray
    ret, image = capture.read()

    image = None
    while image is None:
      ret, image = capture.read()

    self.height, self.width, channels = image.shape
    print('height: ' + str(self.height))
    print('width: ' + str(self.width))
    print('channels: ' + str(channels))

    t_minus2 = self.read_camera(capture, as_bw=True)
    t_minus1 = self.read_camera(capture, as_bw=True)
    t_color = self.read_camera(capture, as_bw=False)
    t = convert_to_bw(t_color)

    frame_count = 0
    second_start = time.time()
    try:
      while True:
        diff_result = diff_img(t_minus2, t_minus1, t)
        k_size = (3, 3)
        blur_result = cv2.blur(diff_result, k_size)
        did_thresh, threshold_result = cv2.threshold(
            blur_result, thresh=31, maxval=1, type=cv2.THRESH_BINARY)

        # Calculate the x and y moments
        # This point is what the eye will look at
        moms = cv2.moments(threshold_result)
        m0 = moms['m00']
        if m0 > 0:
          self.m_x = int(moms['m10'] / m0)
          self.m_y = int(moms['m01'] / m0)
        else:
          self.m_x = None
          self.m_y = None

        # Draw the areas where motion was detected
        im2, contours, hierarchy = cv2.findContours(
            threshold_result, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(t_color, contours, -1, (0, 255, 0), 1)

        if self.m_x and self.m_y:
          cv2.circle(t_color, (self.m_x, self.m_y), 10, (0, 0, 255), 1)
        self.send_message({'m_x': self.m_x, 'm_y': self.m_y, 'height': self.height, 'width': self.width})

        half_size_img = cv2.resize(t_color, None, fx=0.5, fy=0.5)
        cv2.imshow('Camera stream', half_size_img)

        t_minus2 = t_minus1
        t_minus1 = t
        t_color = self.read_camera(capture, as_bw=False)
        t = convert_to_bw(t_color)

        # Poll at 1 ms rate for keys to stop loop
        if cv2.waitKey(1) & 0xFF == ord('q'):
          break

        # Frame rate on my laptop is about 30 FPS
        frame_count += 1
        if time.time() - second_start > 1:
          # print('frames per second: ' + str(frame_count))
          frame_count = 0
          second_start = time.time()
    except Exception as e:
      traceback.print_exc()

    capture.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
  md = MotionDetector(None)
  md.run()
