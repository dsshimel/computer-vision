import cv2
import numpy

# Based on http://www.steinm.com/blog/motion-detection-webcam-python-opencv-differential-images/

def diff_img(frame0, frame1, frame2):
  diff0 = cv2.absdiff(frame0, frame1)
  diff1 = cv2.absdiff(frame1, frame2)
  return cv2.bitwise_and(diff0, diff1)

def threshold_max(x):
  return ((x + 255) / 2) if x > 15 else 0

def read_camera(capture, as_bw):
  did_read, result = capture.read()
  if not did_read:
    return None
  return cv2.cvtColor(result, cv2.COLOR_RGB2GRAY) if as_bw else result  

capture = cv2.VideoCapture(0)

# Example of what is read from the camera
# 'image' is a numpy.ndarray
ret, image = capture.read()
height, width, channels = image.shape
print('height: ' + str(height))
print('width: ' + str(width))
print('channels: ' + str(channels))
print('image cell value data type: ' + str(image[0][0].dtype))

t_minus2 = read_camera(capture, as_bw=True)
t_minus1 = read_camera(capture, as_bw=True)
t = read_camera(capture, as_bw=True)

while True:
  result = diff_img(t_minus2, t_minus1, t)
  k_size = (3, 3)
  result_blur = cv2.blur(result, k_size)
  vector_func = numpy.vectorize(threshold_max, otypes=[numpy.uint8])
  transformed_result = vector_func(result_blur)
  cv2.imshow('Camera stream', transformed_result)

  t_minus2 = t_minus1
  t_minus1 = t
  t = read_camera(capture, as_bw=True)

  # Poll at 1 ms rate for keys to stop loop
  if cv2.waitKey(1) & 0xFF == ord('q'):
    break

capture.release()
cv2.destroyAllWindows()