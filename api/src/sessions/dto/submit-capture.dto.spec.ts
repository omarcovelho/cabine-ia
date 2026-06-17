import { BadRequestException } from '@nestjs/common';
import {
  assertValidCropCount,
  parseUploadedCropFiles,
} from './submit-capture.dto';

describe('submit-capture.dto', () => {
  describe('parseUploadedCropFiles', () => {
    it('returns an empty array when files are missing', () => {
      expect(parseUploadedCropFiles(undefined)).toEqual([]);
      expect(parseUploadedCropFiles(null)).toEqual([]);
    });

    it('rejects non-array uploads', () => {
      expect(() => parseUploadedCropFiles({})).toThrow(BadRequestException);
    });

    it('accepts valid crop file buffers', () => {
      const files = [{ buffer: Buffer.from('crop') }];
      expect(parseUploadedCropFiles(files)).toEqual(files);
    });
  });

  describe('assertValidCropCount', () => {
    it('rejects counts outside 1 to 4', () => {
      expect(() => assertValidCropCount(0)).toThrow(BadRequestException);
      expect(() => assertValidCropCount(5)).toThrow(BadRequestException);
    });
  });
});
