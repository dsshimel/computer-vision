import cv2
import numpy as np
import traceback

# Based on http://www.steinm.com/blog/motion-detection-webcam-python-opencv-differential-images/

def diff_img(frame0, frame1, frame2):
  diff0 = cv2.absdiff(frame0, frame1)
  diff1 = cv2.absdiff(frame1, frame2)
  return cv2.bitwise_and(diff0, diff1)

# Use "binary" return values to improve contour detection
def threshold_max(x):
  # This function could be replaced with cv2.threshold()
  return 1 if x > 15 else 0

def convert_to_bw(im):
  return cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)

def read_camera(capture, as_bw):
  ret, result = capture.read()
  if not ret:
    return None
  return convert_to_bw(result) if as_bw else result  

capture = cv2.VideoCapture(0)
if not capture.isOpened():
  capture = cv2.VideoCapture(1)
if not capture.isOpened():
  print('Could not open camera on channel 0 or 1')
  exit()

capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1920);
capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080);

# Example of what is read from the camera
# 'image' is a np.ndarray
ret, image = capture.read()
height, width, channels = image.shape
print('height: ' + str(height))
print('width: ' + str(width))
print('channels: ' + str(channels))
print('image cell value data type: ' + str(image[0][0].dtype))

t_minus2 = read_camera(capture, as_bw=True)
t_minus1 = read_camera(capture, as_bw=True)
t_color = read_camera(capture, as_bw=False)
t = convert_to_bw(t_color)

try:
  while True:
    result = diff_img(t_minus2, t_minus1, t)
    k_size = (3, 3)
    result_blur = cv2.blur(result, k_size)
    # vector_func = np.vectorize(threshold_max, otypes=[np.uint8])
    did_thresh, threshold_result = cv2.threshold(result_blur, 31, 1, cv2.THRESH_BINARY)
    
    # transformed_result is only of length 2
    # nested arrays are length 640 
    # transformed_result = vector_func(result_blur)

    # Calculate the x and y moments
    # This point is what the eye will look at
    moms = cv2.moments(threshold_result)
    m0 = moms['m00']
    m_x, m_y = None, None
    if m0 > 0:
      m_x = int(moms['m10'] / m0)
      m_y = int(moms['m01'] / m0)
      # print(str(m_x) + ', ' + str(m_y))

    im2, contours, hierarchy = cv2.findContours(threshold_result, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(t_color, contours, -1, (0, 255, 0), 1)

    if m_x and m_y:
      cv2.circle(t_color, (m_x, m_y), 10, (0, 0, 255), 1)

    cv2.imshow('Camera stream', t_color)

    t_minus2 = t_minus1
    t_minus1 = t
    t_color = read_camera(capture, as_bw=False)
    t = convert_to_bw(t_color)

    # Poll at 1 ms rate for keys to stop loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
      break
except Exception as e:
  traceback.print_exc()

capture.release()
cv2.destroyAllWindows()