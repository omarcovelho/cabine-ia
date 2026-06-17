export type FaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ExtractFaceCropsOptions = {
  createCanvas?: () => HTMLCanvasElement;
  toBlob?: (canvas: HTMLCanvasElement) => Promise<Blob>;
};

export async function extractFaceCrops(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  faces: FaceBox[],
  options: ExtractFaceCropsOptions = {},
): Promise<Blob[]> {
  const createCanvas =
    options.createCanvas ??
    (() => document.createElement('canvas'));
  const toBlob =
    options.toBlob ??
    ((canvas: HTMLCanvasElement) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create crop blob'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.92,
        );
      }));

  void sourceWidth;
  void sourceHeight;

  const crops: Blob[] = [];

  for (const face of faces.slice(0, 4)) {
    const canvas = createCanvas();
    canvas.width = face.width;
    canvas.height = face.height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context unavailable');
    }

    context.drawImage(
      source,
      face.x,
      face.y,
      face.width,
      face.height,
      0,
      0,
      face.width,
      face.height,
    );

    crops.push(await toBlob(canvas));
  }

  return crops;
}
