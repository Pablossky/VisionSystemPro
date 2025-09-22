import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';

export default function ContourViewer({
  elements = [],
  tolerances,
  lineWidthModel,
  lineWidthReal,
  outlierPointSize,
  workspaceColor = '#006400', // domyślna wartość
  fontSize = 16               // domyślna wartość
}) {

  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const calculator = useMemo(
    () => new ShapeAccuracyCalculator(tolerances.Points.value),
    [tolerances.Points.value]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // najpierw czyść cały canvas i wypełnij tłem
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resetuje wszystkie transformacje
    ctx.fillStyle = workspaceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // teraz stosujemy zoom i przesunięcie
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    if (elements.length === 0) {
      ctx.restore();
      return;
    }

    // ustawienia siatki dla rozkładu elementów
    const margin = 20;
    const elementsPerRow = Math.ceil(Math.sqrt(elements.length));
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const cellWidth = canvasWidth / elementsPerRow;
    const cellHeight = canvasHeight / elementsPerRow;

    elements.forEach(({ data, element_name }, idx) => {
      if (!data || !data.mainContour?.points) return;

      // bounding box konturu
      const modelPoints = data.mainContour.points.map(pt => pt.modelPosition);
      const xs = modelPoints.map(p => p[0]);
      const ys = modelPoints.map(p => p[1]);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const elemWidth = maxX - minX;
      const elemHeight = maxY - minY;

      // przesunięcie w siatce
      const row = Math.floor(idx / elementsPerRow);
      const col = idx % elementsPerRow;
      const offsetX = col * cellWidth + margin - minX;
      const offsetY = row * cellHeight + margin - minY;

      ctx.save();
      ctx.translate(offsetX, offsetY);

      const accuracy = calculator.calculateAccuracy(data);

      // 1) GŁÓWNY KONTUR
      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthModel + 2 * tolerances.Points.value;
      ctx.strokeStyle = tolerances.Points.color + '66';
      ctx.stroke();

      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = lineWidthModel;
      ctx.strokeStyle = tolerances.Points.color;
      ctx.stroke();

      const realPoints = data.mainContour.points.map(pt => pt.position);
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

      // podpisy po prawej stronie konturu
      const padding = 4;
      ctx.font = `${fontSize}px Arial`;
      const accText = `Zgodność: ${accuracy.toFixed(1)}%`;
      const nameText = element_name;
      const boxWidth = Math.max(ctx.measureText(accText).width, ctx.measureText(nameText).width) + padding * 2;
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

      // 2) V-CUTS
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

          if (vcut.highestDepthIdx !== undefined && data.mainContour.points[vcut.highestDepthIdx]) {
            const [hx, hy] = data.mainContour.points[vcut.highestDepthIdx].position;
            ctx.beginPath();
            ctx.arc(hx, hy, outlierPointSize * 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = tolerances.Vcuts.color;
            ctx.fill();
          }

          const startPos = pts[0]?.position || [0, 0];
          ctx.fillStyle = tolerances.Vcuts.color;
          ctx.font = '14px Arial';
          ctx.fillText(`depth=${vcut.depth.toFixed(2)} w=${vcut.width.toFixed(2)}`, startPos[0] + 5, startPos[1] - 5);

          if (Math.abs(vcut.depth) > tolerances.Vcuts.value) {
            ctx.beginPath();
            ctx.arc(startPos[0], startPos[1], outlierPointSize, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.fill();
          }
        });
      }

      // 3) DODATKOWE KONTURY
      if (data.additionalContours) {
        data.additionalContours.forEach(contour => {
          const modelPts = contour.points.map(pt => pt.modelPosition);
          const realPts = contour.points.map(pt => pt.position);

          ctx.beginPath();
          modelPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthModel + 2 * tolerances.Additional.value;
          ctx.strokeStyle = tolerances.Additional.color + '66';
          ctx.stroke();

          ctx.beginPath();
          modelPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthModel;
          ctx.strokeStyle = tolerances.Additional.color;
          ctx.stroke();

          ctx.beginPath();
          realPts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.closePath();
          ctx.lineWidth = lineWidthReal;
          ctx.strokeStyle = 'black';
          ctx.stroke();

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

      ctx.restore();
    });

    ctx.restore();
  }, [elements, zoom, offset, tolerances, calculator, lineWidthModel, lineWidthReal, outlierPointSize]);

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
