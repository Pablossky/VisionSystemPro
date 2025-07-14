import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShapeAccuracyCalculator from './../components/ShapeAccuracyCalculator';

export default function ContourViewer({ elements = [], tolerance }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const calculator = useMemo(() => new ShapeAccuracyCalculator(tolerance), [tolerance]);

  useEffect(() => {
    console.log('ContourViewer elements:', elements);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    elements.forEach(({ data }, index) => {
      const color = ['white', 'black', 'blue', 'purple'][index % 4];
      const accuracy = calculator.calculateAccuracy(data);

      // Rysuj model
      ctx.beginPath();
      data.mainContour.points.forEach((pt, i) => {
        const [x, y] = pt.modelPosition;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rysuj rzeczywiste punkty
      ctx.beginPath();
      data.mainContour.points.forEach((pt, i) => {
        const [x, y] = pt.position;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Punkty poza tolerancją
      data.mainContour.points.forEach((pt) => {
        const [x, y] = pt.position;
        if (Math.abs(pt.distance) > tolerance) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });

      // Tekst z nową wartością accuracy
      if (data.mainContour.points.length > 0) {
        const [x, y] = data.mainContour.points[0].modelPosition;
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(`Zgodność: ${accuracy.toFixed(1)}%`, x + 10, y - 10);
      }
    });

    ctx.restore();
  }, [elements, zoom, offset, tolerance, calculator]);


  const handleWheel = (e) => {
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.min(10, Math.max(0.1, z * delta)));
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div style={{ padding: 20 }}>
      <h3>Podgląd konturów elementów</h3>
      <canvas
        ref={canvasRef}
        width={1000}
        height={800}
        style={{ border: '1px solid black', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
