import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ContourViewer from './ContourViewer';

beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation((type) => {
        if (type === '2d') {
            return {
                save: jest.fn(),
                restore: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                closePath: jest.fn(),
                stroke: jest.fn(),
                fill: jest.fn(),
                translate: jest.fn(),
                scale: jest.fn(),
                arc: jest.fn(),
                clearRect: jest.fn(),
                fillRect: jest.fn(),
                getImageData: jest.fn(() => ({ data: [] })),
                putImageData: jest.fn(),
                createImageData: jest.fn(),
                setTransform: jest.fn(),
                drawImage: jest.fn(),
            };
        }
        return null;
    });
});



describe('ContourViewer', () => {
    it('renders canvas element', () => {
        const { container } = render(<ContourViewer elements={[]} tolerance={1} />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    it('responds to mouse events', () => {
        const { container } = render(<ContourViewer elements={[]} tolerance={1} />);
        const canvas = container.querySelector('canvas');

        fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
        fireEvent.mouseMove(canvas, { clientX: 15, clientY: 15 });
        fireEvent.mouseUp(canvas);

        fireEvent.wheel(canvas, { deltaY: -100 }); // zoom in
    });
});
