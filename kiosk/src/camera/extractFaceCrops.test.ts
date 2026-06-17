import { describe, expect, it, vi } from 'vitest';
import { extractFaceCrops } from './extractFaceCrops';

describe('extractFaceCrops', () => {
  it('crops each face region from the source frame', async () => {
    const drawImage = vi.fn();
    const source = document.createElement('canvas');

    const crops = await extractFaceCrops(
      source,
      640,
      480,
      [
        { x: 10, y: 20, width: 100, height: 120 },
        { x: 200, y: 40, width: 90, height: 110 },
      ],
      {
        createCanvas: () =>
          ({
            width: 0,
            height: 0,
            getContext: () => ({ drawImage }),
          }) as unknown as HTMLCanvasElement,
        toBlob: async (canvas) =>
          new Blob([`crop-${canvas.width}x${canvas.height}`], {
            type: 'image/jpeg',
          }),
      },
    );

    expect(crops).toHaveLength(2);
    expect(crops[0].type).toBe('image/jpeg');
    expect(drawImage).toHaveBeenCalledTimes(2);
    expect(drawImage).toHaveBeenCalledWith(
      source,
      10,
      20,
      100,
      120,
      0,
      0,
      100,
      120,
    );
  });

  it('caps output at four crops', async () => {
    const source = document.createElement('canvas');
    const faces = Array.from({ length: 6 }, (_, index) => ({
      x: index * 10,
      y: index * 10,
      width: 50,
      height: 50,
    }));

    const crops = await extractFaceCrops(source, 640, 480, faces, {
      createCanvas: () =>
        ({
          width: 50,
          height: 50,
          getContext: () => ({
            drawImage: vi.fn(),
          }),
        }) as unknown as HTMLCanvasElement,
      toBlob: async () => new Blob(['crop'], { type: 'image/jpeg' }),
    });

    expect(crops).toHaveLength(4);
  });
});
