import { getRadianAngle, rotateSize } from './cropper';

describe('getRadianAngle', () => {
  it('converts 0 degrees to 0 radians', () => {
    expect(getRadianAngle(0)).toBe(0);
  });

  it('converts 180 degrees to PI radians', () => {
    expect(getRadianAngle(180)).toBeCloseTo(Math.PI);
  });

  it('converts 90 degrees to PI/2 radians', () => {
    expect(getRadianAngle(90)).toBeCloseTo(Math.PI / 2);
  });
});

describe('rotateSize', () => {
  it('returns the original dimensions when there is no rotation', () => {
    const result = rotateSize(100, 50);
    expect(result.width).toBeCloseTo(100);
    expect(result.height).toBeCloseTo(50);
  });

  it('swaps width and height at a 90 degree rotation', () => {
    const result = rotateSize(100, 50, 90);
    expect(result.width).toBeCloseTo(50);
    expect(result.height).toBeCloseTo(100);
  });

  it('returns the original dimensions at a 180 degree rotation', () => {
    const result = rotateSize(100, 50, 180);
    expect(result.width).toBeCloseTo(100);
    expect(result.height).toBeCloseTo(50);
  });

  it('produces a larger bounding box at a 45 degree rotation', () => {
    const result = rotateSize(100, 50, 45);
    expect(result.width).toBeGreaterThan(100);
    expect(result.height).toBeGreaterThan(50);
  });
});
