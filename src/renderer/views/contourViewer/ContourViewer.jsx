import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';

export default function ContourViewer({
  elements = [],
  tolerances = {},          // 🔹 zabezpieczenie na wypadek braku
  lineWidthModel = 2,
  lineWidthReal = 2,
  outlierPointSize = 4,
  workspaceColor = '#006400',
  fontSize = 16
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // 🔹 bezpieczne wyciąganie wartości tolerancji
  const pointTolerance = tolerances?.Points?.value ?? 0;
  const pointColor = tolerances?.Points?.color ?? 'blue';
  const vcutTolerance = tolerances?.Vcuts?.value ?? 0;
  const vcutColor = tolerances?.Vcuts?.color ?? 'purple';
  const additionalTolerance = tolerances?.Additional?.value ?? 0;
  const additionalColor = tolerances?.Additional?.color ?? 'green';

  const calculator = useMemo(
    () => new ShapeAccuracyCalculator(pointTolerance),
    [pointTolerance]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 🔹 czyszczenie tła
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = workspaceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    if (!elements || elements.length === 0) {
      ctx.restore();
      return;
    }

    // 🔹 siatka
    const margin = 20;
    const elementsPerRow = Math.ceil(Math.sqrt(elements.length));
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const cellWidth = canvasWidth / elementsPerRow;
    const cellHeight = canvasHeight / elementsPerRow;

    elements.forEach(({ data, element_name }, idx) => {
      if (!data?.mainContour?.points) return;

      const modelPoints = data.mainContour.points.map(pt => pt.modelPosition);
      const xs = modelPoints.map(p => p[0]);
      const ys = modelPoints.map(p => p[1]);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      // 🔹 przesunięcie w siatce
      const row = Math.floor(idx / elementsPerRow);
      const col = idx % elementsPerRow;
      const offsetX = col * cellWidth + margin - minX;
      const offsetY = row * cellHeight + margin - minY;

      ctx.save();
      ctx.translate(offsetX, offsetY);

      const accuracy = calculator.calculateAccuracy(data);

      // 🔹 model kontur (gruba tolerancja)
      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthModel + 2 * pointTolerance;
      ctx.strokeStyle = pointColor + '66';
      ctx.stroke();

      // 🔹 model kontur (dokładna linia)
      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthModel;
      ctx.strokeStyle = pointColor;
      ctx.stroke();

      // 🔹 real kontur
      const realPoints = data.mainContour.points.map(pt => pt.position);
      ctx.beginPath();
      realPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthReal;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      // 🔹 punkty poza tolerancją
      data.mainContour.points.forEach(pt => {
        const [x, y] = pt.position;
        if (Math.abs(pt.distance) > pointTolerance) {
          ctx.beginPath();
          ctx.arc(x, y, outlierPointSize, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });

      // 🔹 podpisy
      const padding = 4;
      ctx.font = `${fontSize}px Arial`;
      const accText = `Zgodność: ${accuracy.toFixed(1)}%`;
      const nameText = element_name ?? 'Bez nazwy';
      const boxWidth = Math.max(
        ctx.measureText(accText).width,
        ctx.measureText(nameText).width
      ) + padding * 2;
      const boxHeight = 16 + 14 + padding * 2 + 4;
      const textX = maxX + 10;
      const textY = minY + 10;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(textX - padding, textY - padding, boxWidth, boxHeight);

      ctx.fillStyle = 'white';
      ctx.fillText(accText, textX, textY + 14);
      ctx.fillStyle = 'yellow';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(nameText, textX, textY + 14 + 18);

      // 🔹 V-CUTS
      if (Array.isArray(data.vcuts)) {
        data.vcuts.forEach(vcut => {
          if (!vcut.found) return;
          const pts = data.mainContour.points.slice(
            vcut.startPointIdx,
            vcut.endPointIdx + 1
          );
          ctx.beginPath();
          pts.forEach((pt, i) =>
            i === 0
              ? ctx.moveTo(pt.position[0], pt.position[1])
              : ctx.lineTo(pt.position[0], pt.position[1])
          );
          ctx.lineWidth = lineWidthReal * 2;
          ctx.strokeStyle = vcutColor;
          ctx.stroke();

          if (
            vcut.highestDepthIdx !== undefined &&
            data.mainContour.points[vcut.highestDepthIdx]
          ) {
            const [hx, hy] = data.mainContour.points[vcut.highestDepthIdx].position;
            ctx.beginPath();
            ctx.arc(hx, hy, outlierPointSize * 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = vcutColor;
            ctx.fill();
          }

          const startPos = pts[0]?.position || [0, 0];
          ctx.fillStyle = vcutColor;
          ctx.font = '14px Arial';
          ctx.fillText(
            `depth=${vcut.depth.toFixed(2)} w=${vcut.width.toFixed(2)}`,
            startPos[0] + 5,
            startPos[1] - 5
          );

          if (Math.abs(vcut.depth) > vcutTolerance) {
            ctx.beginPath();
            ctx.arc(startPos[0], startPos[1], outlierPointSize, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.fill();
          }
        });
      }

      // 🔹 dodatkowe kontury
      if (Array.isArray(data.additionalContours)) {
        data.additionalContours.forEach(contour => {
          const modelPts = contour.points.map(pt => pt.modelPosition);
          const realPts = contour.points.map(pt => pt.position);

          // model
          ctx.beginPath();
          modelPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthModel + 2 * additionalTolerance;
          ctx.strokeStyle = additionalColor + '66';
          ctx.stroke();

          ctx.beginPath();
          modelPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthModel;
          ctx.strokeStyle = additionalColor;
          ctx.stroke();

          // real
          ctx.beginPath();
          realPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthReal;
          ctx.strokeStyle = 'black';
          ctx.stroke();

          // outliers
          contour.points.forEach(pt => {
            const [x, y] = pt.position;
            if (Math.abs(pt.distance) > additionalTolerance) {
              ctx.beginPath();
              ctx.arc(x, y, outlierPointSize, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
          });
        });
      }

      ctx.restore();
    });

    ctx.restore();
  }, [elements, zoom, offset, tolerances, calculator, lineWidthModel, lineWidthReal, outlierPointSize, workspaceColor, fontSize]);

  // 🔹 obsługa interakcji
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
