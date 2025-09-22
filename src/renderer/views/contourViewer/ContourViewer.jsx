// ContourViewer.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShapeAccuracyCalculator from '../../components/ShapeAccuracyCalculator';

export default function ContourViewer({
  elements = [],
  tolerances,
  lineWidthModel,
  lineWidthReal,
  outlierPointSize,
  workspaceColor = '#006400', 
  fontSize = 16,
  selectedElementIdx,
  onSelectElement
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

  const getBoundingBox = (points) => {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = workspaceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    if (elements.length === 0) {
      ctx.restore();
      return;
    }

    const margin = 20;
    const elementsPerRow = Math.ceil(Math.sqrt(elements.length));
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const cellWidth = canvasWidth / elementsPerRow;
    const cellHeight = canvasHeight / elementsPerRow;

    elements.forEach(({ data, element_name }, idx) => {
      if (!data?.mainContour?.points) return;

      const modelPoints = data.mainContour.points.map(pt => pt.modelPosition);
      const realPoints = data.mainContour.points.map(pt => pt.position);
      const { minX, minY, maxX, maxY, width: elemWidth, height: elemHeight } = getBoundingBox(realPoints);

      const row = Math.floor(idx / elementsPerRow);
      const col = idx % elementsPerRow;
      const offsetX = col * cellWidth + margin - minX;
      const offsetY = row * cellHeight + margin - minY;

      ctx.save();
      ctx.translate(offsetX, offsetY);

      const accuracy = calculator.calculateAccuracy(data);

      // --- Rysowanie konturów modelu ---
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

      // --- Rysowanie konturu rzeczywistego ---
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

      // podpis
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

      // --- Ramka wokół wybranego elementu ---
      if (selectedElementIdx === idx) {
        ctx.save();
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 3;
        ctx.strokeRect(minX - 5, minY - 5, elemWidth + 10, elemHeight + 10);
        ctx.restore();
      }

      ctx.restore();
    });

    ctx.restore();
  }, [elements, zoom, offset, tolerances, calculator, lineWidthModel, lineWidthReal, outlierPointSize, selectedElementIdx, workspaceColor, fontSize]);

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

  const handleCanvasClick = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    let clickedIdx = null;
    elements.forEach(({ data }, idx) => {
      if (!data?.mainContour?.points) return;
      const { minX, minY, maxX, maxY } = getBoundingBox(data.mainContour.points.map(pt => pt.position));
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        clickedIdx = idx;
      }
    });

    if (clickedIdx !== null) onSelectElement(clickedIdx);
  };

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
        onClick={handleCanvasClick}
      />
    </div>
  );
}
