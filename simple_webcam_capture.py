import cv2

# Based on http://www.steinm.com/blog/motion-detection-webcam-python-opencv-differential-images/

def diff_img(frame0, frame1, frame2):
  diff0 = cv2.absdiff(frame0, frame1)
  diff1 = cv2.absdiff(frame1, frame2)
  return cv2.bitwise_and(diff0, diff1)

# VideoCapture
capture = cv2.VideoCapture(0)

ret_minus2, image_minus2 = capture.read()
ret_minus1, image_minus1 = capture.read()
ret, image = capture.read()
height, width, channels = image.shape
print('height: ' + str(height))
print('width: ' + str(width))
print('channels: ' + str(channels))

t_minus2 = cv2.cvtColor(image_minus2, cv2.COLOR_RGB2GRAY)
t_minus1 = cv2.cvtColor(image_minus1, cv2.COLOR_RGB2GRAY)
t = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
# t_minus2 = image_minus2
# t_minus1 = image_minus1
# t = image

while True:
  # 'image' is a numpy.ndarray
  # ret, image = capture.read()
  # bwImage = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

  
  # scale = 640.0 / width
  # print('scale: ' + str(scale))  
  # image = cv2.resize(image, (0,0), fx=scale, fy=scale)

  # cv2.imshow('Camera stream', image)
  # cv2.imshow('Camera stream', bwImage)
  result = diff_img(t_minus2, t_minus1, t)
  kSize = (3, 3)
  resultBlur = cv2.blur(result, kSize)
  cv2.imshow('Camera stream', resultBlur)

  t_minus2 = t_minus1
  t_minus1 = t
  t = cv2.cvtColor(capture.read()[1], cv2.COLOR_RGB2GRAY)
  # t = capture.read()[1]

  # Poll at 1 ms rate for keys to stop loop
  if cv2.waitKey(1) & 0xFF == ord('q'):
    break

capture.release()
cv2.destroyAllWindows()