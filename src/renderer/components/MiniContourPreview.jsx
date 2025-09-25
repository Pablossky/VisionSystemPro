import React, { useEffect, useRef } from 'react';
import shapesData from '../../api/shapes.json'; // dopasuj ścieżkę

export default function MiniContourPreview({ element, x = 0, y = 0, size = 150 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !element) return;

    try {
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let apiObj = null;
      let shapesArr = null;

      // --- rozpoznaj format elementu ---
      if (Array.isArray(element)) {
        shapesArr = element;
      } else if (Array.isArray(element?.shapes)) {
        shapesArr = element.shapes;
      } else if (element?.data?.mainContour || element?.mainContour) {
        apiObj = element.data?.mainContour ? element.data : element;
      } else if (element?.mainContour) {
        shapesArr = [element];
      } else if (element?.shapeId) {
        // szukamy shape w shapes.json
        const foundShape = shapesData.find(s => s.id === element.shapeId);
        if (foundShape) {
          shapesArr = [foundShape];
        } else {
          console.warn("⚠ shapeId nie znaleziony w shapes.json:", element.shapeId);
          return;
        }
      } else {
        console.warn("❓ Nie rozpoznano formatu elementu", element);
        return;
      }

      // --- funkcja zbierania punktów ---
      const collectPointsFromSingle = (el, isShape = false) => {
        const pts = [];
        if (!el) return pts;

        if (isShape) {
          const mc = el.mainContour;
          if (Array.isArray(mc?.fullContour)) pts.push(...mc.fullContour);
          if (Array.isArray(mc?.noCutsContour)) pts.push(...mc.noCutsContour);
          (el.additionalContours || []).forEach(c => {
            if (Array.isArray(c.fullContour)) pts.push(...c.fullContour);
            if (Array.isArray(c.noCutsContour)) pts.push(...c.noCutsContour);
          });
        } else {
          const mc = el.data?.mainContour ?? el.mainContour ?? el;
          if (Array.isArray(mc?.points)) {
            pts.push(
              ...mc.points
                .map(p => p.modelPosition || p.position)
                .filter(Boolean)
            );
          }
          if (Array.isArray(mc?.fullContour)) pts.push(...mc.fullContour);
          if (Array.isArray(mc?.noCutsContour)) pts.push(...mc.noCutsContour);

          const addContours = el.data?.additionalContours || el.additionalContours || [];
          addContours.forEach(c => {
            if (Array.isArray(c.points)) {
              pts.push(
                ...c.points
                  .map(p => p.modelPosition || p.position)
                  .filter(Boolean)
              );
            }
            if (Array.isArray(c.fullContour)) pts.push(...c.fullContour);
            if (Array.isArray(c.noCutsContour)) pts.push(...c.noCutsContour);
          });
        }
        return pts;
      };

      // --- zbierz wszystkie punkty ---
      let allPts = [];
      if (apiObj) allPts = collectPointsFromSingle(apiObj, false);
      else if (shapesArr) shapesArr.forEach(el => allPts.push(...collectPointsFromSingle(el, true)));

      if (allPts.length === 0) {
        console.warn("⚠️ Brak punktów do rysowania");
        return;
      }

      // --- wyznacz bbox i skalowanie ---
      const xs = allPts.map(p => p[0]);
      const ys = allPts.map(p => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      let w = maxX - minX;
      let h = maxY - minY;
      if (!isFinite(w) || w <= 0) w = 1;
      if (!isFinite(h) || h <= 0) h = 1;
      const padding = 8;
      const scale = Math.max(1e-6, Math.min((canvas.width - padding) / w, (canvas.height - padding) / h));

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, -scale);
      ctx.translate(-(minX + w / 2), -(minY + h / 2));

      const drawContour = (pts, color = 'blue', strokeWidth = 2) => {
        if (!Array.isArray(pts) || pts.length === 0) return;
        ctx.beginPath();
        pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
        ctx.closePath();
        ctx.lineWidth = Math.max(0.1, strokeWidth / scale);
        ctx.strokeStyle = color;
        ctx.stroke();
      };

      // --- rysowanie ---
      if (apiObj) {
        const mainPts = Array.isArray(apiObj.mainContour?.points)
          ? apiObj.mainContour.points.map(p => p.modelPosition || p.position).filter(Boolean)
          : (apiObj.mainContour?.fullContour || apiObj.mainContour?.noCutsContour || []);
        drawContour(mainPts, 'blue', 2);

        if (Array.isArray(apiObj.additionalContours)) {
          apiObj.additionalContours.forEach(c => {
            const pts = Array.isArray(c.points)
              ? c.points.map(p => p.modelPosition || p.position).filter(Boolean)
              : (c.fullContour || c.noCutsContour || []);
            drawContour(pts, 'green', 1.5);
          });
        }
      } else if (shapesArr) {
        shapesArr.forEach(item => {
          const mc = item.mainContour;
          if (!mc) return;
          if (Array.isArray(mc.fullContour)) drawContour(mc.fullContour, 'blue', 2);
          if (Array.isArray(mc.noCutsContour)) drawContour(mc.noCutsContour, 'orange', 1.5);
          (item.additionalContours || []).forEach(c => {
            const pts = c.fullContour || c.noCutsContour;
            if (Array.isArray(pts)) drawContour(pts, 'green', 1.5);
          });
        });
      }

      ctx.restore();
    } catch (err) {
      console.error('MiniContourPreview draw error:', err);
    }
  }, [element, size]);

  return (
    <div
      style={{
        position: 'fixed',
        top: y + 15,
        left: x + 15,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        zIndex: 2000,
      }}
    >
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}
