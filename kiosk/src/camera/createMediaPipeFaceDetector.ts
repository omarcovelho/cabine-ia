import type { FaceDetector } from './useFaceDetection';

let detectorPromise: Promise<FaceDetector> | null = null;

export async function createMediaPipeFaceDetector(): Promise<FaceDetector> {
  if (!detectorPromise) {
    detectorPromise = import('@mediapipe/tasks-vision').then(
      ({ FaceDetector, FilesetResolver }) =>
        FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
        ).then((vision) =>
          FaceDetector.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
              delegate: 'GPU',
            },
            runningMode: 'IMAGE',
          }),
        ).then((faceDetector) => ({
          detect: async (source: CanvasImageSource) => {
            const result = faceDetector.detect(source as HTMLCanvasElement);
            return {
              faces: result.detections.slice(0, 4).map((detection) => {
                const box = detection.boundingBox;
                if (!box) {
                  return { x: 0, y: 0, width: 0, height: 0 };
                }
                return {
                  x: box.originX,
                  y: box.originY,
                  width: box.width,
                  height: box.height,
                };
              }),
            };
          },
        })),
    );
  }

  return detectorPromise;
}
