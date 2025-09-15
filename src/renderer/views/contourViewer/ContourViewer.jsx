import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';

export default function ContourViewer({
  elements = [],
  tolerances, // <-- teraz obiekt: { Points: { value, color }, Vcuts: {...}, Additional: {...} }
  lineWidthModel,
  lineWidthReal,
  outlierPointSize
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // kalkulator tylko dla głównych punktów
  const calculator = useMemo(
    () => new ShapeAccuracyCalculator(tolerances.Points.value),
    [tolerances.Points.value]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // tło
    ctx.fillStyle = '#006400';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    elements.forEach(({ data }) => {
      if (!data) return;

      // -----------------------
      // 1) GŁÓWNY KONTUR (Points)
      // -----------------------
      if (data.mainContour?.points) {
        const modelPoints = data.mainContour.points.map(pt => pt.modelPosition);
        const realPoints = data.mainContour.points.map(pt => pt.position);
        const accuracy = calculator.calculateAccuracy(data);

        // pas tolerancji
        ctx.beginPath();
        modelPoints.forEach(([x, y], i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.closePath();
        ctx.lineWidth = lineWidthModel + 2 * tolerances.Points.value;
        ctx.strokeStyle = tolerances.Points.color + '66'; // półprzezroczysty
        ctx.stroke();

        // obrys modelu
        ctx.beginPath();
        modelPoints.forEach(([x, y], i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.closePath();
        ctx.lineWidth = lineWidthModel;
        ctx.strokeStyle = tolerances.Points.color;
        ctx.stroke();

        // obrys rzeczywisty
        ctx.beginPath();
        realPoints.forEach(([x, y], i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.closePath();
        ctx.lineWidth = lineWidthReal;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // punkty poza tolerancją
        data.mainContour.points.forEach(pt => {
          const [x, y] = pt.position;
          if (Math.abs(pt.distance) > tolerances.Points.value) {
            ctx.beginPath();
            ctx.arc(x, y, outlierPointSize, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });

        // podpis zgodności
        if (modelPoints.length > 0) {
          const [x, y] = modelPoints[0];
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.fillText(`Zgodność: ${accuracy.toFixed(1)}%`, x + 10, y - 10);
        }
      }

      // -----------------------
      // 2) V-CUTS
      // -----------------------
      if (data.vcuts) {
        data.vcuts.forEach(vcut => {
          if (!vcut.found) return;

          const pts = data.mainContour.points.slice(vcut.startPointIdx, vcut.endPointIdx + 1);

          ctx.beginPath();
          pts.forEach((pt, i) =>
            i === 0 ? ctx.moveTo(pt.position[0], pt.position[1]) : ctx.lineTo(pt.position[0], pt.position[1])
          );
          ctx.lineWidth = lineWidthReal * 2;
          ctx.strokeStyle = tolerances.Vcuts.color;
          ctx.stroke();

          // punkt największej głębokości
          if (vcut.highestDepthIdx !== undefined && data.mainContour.points[vcut.highestDepthIdx]) {
            const [hx, hy] = data.mainContour.points[vcut.highestDepthIdx].position;
            ctx.beginPath();
            ctx.arc(hx, hy, outlierPointSize * 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = tolerances.Vcuts.color;
            ctx.fill();
          }

          // podpis wartości
          const startPos = pts[0]?.position || [0, 0];
          ctx.fillStyle = tolerances.Vcuts.color;
          ctx.font = '14px Arial';
          ctx.fillText(
            `depth=${vcut.depth.toFixed(2)} w=${vcut.width.toFixed(2)}`,
            startPos[0] + 5,
            startPos[1] - 5
          );

          // sprawdzanie czy poza tolerancją (np. szerokość > tolerance)
          if (Math.abs(vcut.depth) > tolerances.Vcuts.value) {
            ctx.beginPath();
            ctx.arc(startPos[0], startPos[1], outlierPointSize, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.fill();
          }
        });
      }

      // -----------------------
      // 3) DODATKOWE KONTURY
      // -----------------------
      if (data.additionalContours) {
        data.additionalContours.forEach(contour => {
          const modelPts = contour.points.map(pt => pt.modelPosition);
          const realPts = contour.points.map(pt => pt.position);

          // pas tolerancji
          ctx.beginPath();
          modelPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthModel + 2 * tolerances.Additional.value;
          ctx.strokeStyle = tolerances.Additional.color + '66';
          ctx.stroke();

          // obrys modelu
          ctx.beginPath();
          modelPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthModel;
          ctx.strokeStyle = tolerances.Additional.color;
          ctx.stroke();

          // obrys rzeczywisty
          ctx.beginPath();
          realPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthReal;
          ctx.strokeStyle = 'black';
          ctx.stroke();

          // punkty poza tolerancją
          contour.points.forEach(pt => {
            const [x, y] = pt.position;
            if (Math.abs(pt.distance) > tolerances.Additional.value) {
              ctx.beginPath();
              ctx.arc(x, y, outlierPointSize, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
          });
        });
      }
    });

    ctx.restore();
  }, [elements, zoom, offset, tolerances, calculator, lineWidthModel, lineWidthReal, outlierPointSize]);

  // zoom + drag
  const handleWheel = e => {
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.min(10, Math.max(0.1, z * delta)));
  };
  const handleMouseDown = e => {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = e => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
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
