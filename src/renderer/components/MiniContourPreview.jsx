import React, { useEffect, useRef } from 'react';

export default function MiniContourPreview({ element, x, y }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !element?.data?.mainContour?.points) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { data } = element;

    // --- zbierz wszystkie punkty, żeby policzyć bounding box ---
    const allPts = [];
    if (data.mainContour?.points) {
      allPts.push(...data.mainContour.points.map(pt => pt.modelPosition));
    }
    if (data.additionalContours) {
      data.additionalContours.forEach(c =>
        allPts.push(...c.points.map(pt => pt.modelPosition))
      );
    }

    if (allPts.length === 0) return;

    const xs = allPts.map(p => p[0]);
    const ys = allPts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX;
    const h = maxY - minY;

    const scale = Math.min(
      (canvas.width - 10) / w,
      (canvas.height - 10) / h
    );

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, -scale);
    ctx.translate(-(minX + w / 2), -(minY + h / 2));

    // ----------------
    // MAIN CONTOUR
    // ----------------
    if (data.mainContour?.points) {
      const modelPoints = data.mainContour.points.map(pt => pt.modelPosition);

      ctx.beginPath();
      modelPoints.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.closePath();
      ctx.lineWidth = 2 / scale;
      ctx.strokeStyle = 'blue';
      ctx.stroke();
    }

    // ----------------
    // ADDITIONAL CONTOURS
    // ----------------
    if (data.additionalContours) {
      data.additionalContours.forEach(contour => {
        const modelPts = contour.points.map(pt => pt.modelPosition);
        ctx.beginPath();
        modelPts.forEach(([x, y], i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.closePath();
        ctx.lineWidth = 1.5 / scale;
        ctx.strokeStyle = 'green';
        ctx.stroke();
      });
    }

    // ----------------
    // V-CUTS
    // ----------------
    if (data.vcuts && data.mainContour?.points) {
      data.vcuts.forEach(vcut => {
        if (!vcut.found) return;
        const pts = data.mainContour.points.slice(vcut.startPointIdx, vcut.endPointIdx + 1);
        if (pts.length === 0) return;

        ctx.beginPath();
        pts.forEach((pt, i) =>
          i === 0 ? ctx.moveTo(pt.modelPosition[0], pt.modelPosition[1]) : ctx.lineTo(pt.modelPosition[0], pt.modelPosition[1])
        );
        ctx.lineWidth = 2 / scale;
        ctx.strokeStyle = 'red';
        ctx.stroke();

        // punkt największej głębokości
        if (vcut.highestDepthIdx !== undefined && data.mainContour.points[vcut.highestDepthIdx]) {
          const [hx, hy] = data.mainContour.points[vcut.highestDepthIdx].modelPosition;
          ctx.beginPath();
          ctx.arc(hx, hy, 3 / scale, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });
    }

    ctx.restore();
  }, [element]);

  return (
    <div
      style={{
        position: 'fixed',
        top: y + 15,
        left: x + 15,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        zIndex: 2000,
      }}
    >
      <canvas ref={canvasRef} width={150} height={150} />
    </div>
  );
}
