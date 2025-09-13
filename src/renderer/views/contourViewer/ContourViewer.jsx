import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';

export default function ContourViewer({ elements = [], tolerance, lineWidthModel, lineWidthReal, outlierPointSize }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const calculator = useMemo(() => new ShapeAccuracyCalculator(tolerance), [tolerance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Zielone tło
    ctx.fillStyle = '#006400'; // ciemna zieleń
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    elements.forEach(({ data }) => {
      if (!data?.mainContour?.points) return;

      const accuracy = calculator.calculateAccuracy(data);
      const modelPoints = data.mainContour.points.map((pt) => pt.modelPosition);
      const realPoints = data.mainContour.points.map((pt) => pt.position);

      // --- Obszar tolerancji wokół linii modelu ---
      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthModel + 2 * tolerance; // szeroki pas tolerancji
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // półprzezroczysty biały
      ctx.stroke();

      // --- Obrys modelu ---
      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthModel;
      ctx.strokeStyle = 'white';
      ctx.stroke();



      // Obrys rzeczywisty
      ctx.beginPath();
      realPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = lineWidthReal;
      ctx.stroke();

      // Punkty poza tolerancją
      data.mainContour.points.forEach((pt) => {
        const [x, y] = pt.position;
        if (Math.abs(pt.distance) > tolerance) {
          ctx.beginPath();
          ctx.arc(x, y, outlierPointSize, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });

      // --- WYRÓŻNIENIE V-CUTÓW ---
      if (data.vcuts) {
        data.vcuts.forEach((vcut) => {
          if (!vcut.found) return;

          const startIdx = vcut.startPointIdx;
          const endIdx = vcut.endPointIdx;
          const highestIdx = vcut.highestDepthIdx;

          const vcutPoints = data.mainContour.points
            .slice(startIdx, endIdx + 1)
            .map(pt => pt.position);

          // Narysuj linię w innym kolorze
          ctx.beginPath();
          vcutPoints.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = lineWidthReal * 2;
          ctx.stroke();

          // Punkt największej głębokości
          if (highestIdx !== undefined && data.mainContour.points[highestIdx]) {
            const [hx, hy] = data.mainContour.points[highestIdx].position;
            ctx.beginPath();
            ctx.arc(hx, hy, outlierPointSize * 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
          }

          // Podpis wartości
          ctx.fillStyle = 'yellow';
          ctx.font = '14px Arial';
          ctx.fillText(
            `V-cut depth=${vcut.depth.toFixed(2)} w=${vcut.width.toFixed(2)}`,
            vcutPoints[0][0] + 5,
            vcutPoints[0][1] - 5
          );
        });
      }
      // --- KONIEC V-CUTÓW ---

      // Tekst zgodności
      if (modelPoints.length > 0) {
        const [x, y] = modelPoints[0];
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Zgodność: ${accuracy.toFixed(1)}%`, x + 10, y - 10);
      }
    });

    ctx.restore();
  }, [elements, zoom, offset, tolerance, calculator, lineWidthModel, lineWidthReal, outlierPointSize]);


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
