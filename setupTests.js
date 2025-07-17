import '@testing-library/jest-dom';

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addPage: jest.fn(),
    save: jest.fn(),
  }));
});

jest.mock('jspdf-autotable', () => jest.fn());

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function (type) {
    console.log('Mock getContext called with type:', type);
    if (type === '2d') {
      return {
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: [] })),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      };
    }
    return null;
  };
});
