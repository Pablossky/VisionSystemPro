import React, { useEffect, useRef } from 'react';

export default function MiniContourPreview({ element, x = 0, y = 0, size = 150 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !element) return;

    try {
      const ctx = canvas.getContext('2d');
      // ustaw rozmiary (prostota: nie obsługujemy DPR tutaj)
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Helper: rozpoznaj formaty ---
      const apiObj = element?.data ?? (element?.mainContour ? element : null);
      const shapesArr = Array.isArray(element) ? element : (Array.isArray(element?.shapes) ? element.shapes : null);

      // --- Helper: zbieranie punktów z jednego "elementu" (API-like or shape item) ---
      const collectPointsFromSingle = (el) => {
        const pts = [];
        if (!el) return pts;

        const mc = el.mainContour ?? el; // jeśli el to mainContour już lub root
        if (mc?.points) pts.push(...mc.points.map(p => p.modelPosition).filter(Boolean));
        if (mc?.fullContour) pts.push(...mc.fullContour.filter(Boolean));
        if (mc?.noCutsContour) pts.push(...mc.noCutsContour.filter(Boolean));

        if (el.additionalContours) {
          el.additionalContours.forEach(c => {
            if (c.points) pts.push(...c.points.map(p => p.modelPosition).filter(Boolean));
            if (c.fullContour) pts.push(...c.fullContour.filter(Boolean));
            if (c.noCutsContour) pts.push(...c.noCutsContour.filter(Boolean));
          });
        }

        return pts;
      };

      // --- Zbierz wszystkie punkty (wszystkie kontury) ---
      let allPts = [];
      if (apiObj) {
        allPts = collectPointsFromSingle(apiObj);
      } else if (shapesArr) {
        shapesArr.forEach(el => {
          allPts.push(...collectPointsFromSingle(el));
        });
      } else {
        // nic rozpoznanego
        return;
      }

      if (!allPts || allPts.length === 0) return;

      const xs = allPts.map(p => p[0]);
      const ys = allPts.map(p => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      let w = maxX - minX;
      let h = maxY - minY;
      // zabezpieczenia
      if (!isFinite(w) || w <= 0) w = 1;
      if (!isFinite(h) || h <= 0) h = 1;

      const padding = 8;
      const scale = Math.max(1e-6, Math.min((canvas.width - padding) / w, (canvas.height - padding) / h));

      // --- Transform (środek canvas -> center konturu, odwrócenie Y) ---
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, -scale);
      ctx.translate(-(minX + w / 2), -(minY + h / 2));

      const drawContour = (pts, color = 'blue', strokeWidth = 2) => {
        if (!pts || pts.length === 0) return;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const [px, py] = pts[i];
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        try { ctx.closePath(); } catch (e) {}
        ctx.lineWidth = Math.max(0.1, strokeWidth / scale);
        ctx.strokeStyle = color;
        ctx.stroke();
      };

      // --- Rysuj vcut fragment z indeksów (API style) ---
      const drawVcutSegment = (mainPointsArr, vcut) => {
        if (!mainPointsArr || !Array.isArray(mainPointsArr)) return;
        if (vcut.startPointIdx !== undefined && vcut.endPointIdx !== undefined) {
          const slice = mainPointsArr.slice(vcut.startPointIdx, vcut.endPointIdx + 1).map(p => p.modelPosition || p);
          if (slice.length > 0) {
            ctx.beginPath();
            slice.forEach((pt, i) => i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1]));
            ctx.lineWidth = Math.max(0.1, 2 / scale);
            ctx.strokeStyle = 'red';
            ctx.stroke();
          }
          if (typeof vcut.highestDepthIdx === 'number' && mainPointsArr[vcut.highestDepthIdx]) {
            const hp = mainPointsArr[vcut.highestDepthIdx].modelPosition || mainPointsArr[vcut.highestDepthIdx];
            ctx.beginPath();
            ctx.arc(hp[0], hp[1], Math.max(1e-3, 3 / scale), 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        } else if (vcut.position) {
          // shapes-style vcut: pozycja bez indeksów
          ctx.beginPath();
          ctx.arc(vcut.position[0], vcut.position[1], Math.max(1e-3, 3 / scale), 0, Math.PI * 2);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      };

      // --- Rysowanie w zależności od formatu ---
      if (apiObj) {
        // mainContour
        const mainPts = apiObj.mainContour?.points
          ? apiObj.mainContour.points.map(p => p.modelPosition)
          : (apiObj.mainContour?.fullContour || apiObj.mainContour?.noCutsContour || []);
        drawContour(mainPts, 'blue', 2);

        // additionalContours
        if (apiObj.additionalContours) {
          apiObj.additionalContours.forEach(c => {
            const pts = c.points ? c.points.map(p => p.modelPosition) : (c.fullContour || c.noCutsContour || []);
            drawContour(pts, 'green', 1.5);
          });
        }

        // vcuts (API-style może mieć indeksy)
        if (apiObj.vcuts) {
          const mainPoints = apiObj.mainContour?.points || null;
          apiObj.vcuts.forEach(v => {
            drawVcutSegment(mainPoints, v);
          });
        }
      } else if (shapesArr) {
        // shapes: tablica elementów (każdy ma mainContour.fullContour + mainContour.vcuts)
        shapesArr.forEach(item => {
          const mainFull = item.mainContour?.fullContour || item.mainContour?.noCutsContour || [];
          drawContour(mainFull, 'blue', 2);

          if (item.additionalContours) {
            item.additionalContours.forEach(c => {
              drawContour(c.fullContour || c.noCutsContour || [], 'green', 1.5);
            });
          }

          // vcuts (shapes.json ma vcuts z position)
          if (item.mainContour?.vcuts) {
            item.mainContour.vcuts.forEach(v => {
              drawVcutSegment(item.mainContour.points || null, v); // jeśli points są - użyj; jeśli nie, użyj position
            });
          }
        });
      }

      ctx.restore();
    } catch (err) {
      // pokaż w konsoli — ułatwi debug
      // eslint-disable-next-line no-console
      console.error('MiniContourPreview draw error:', err);
    }
  }, [element, size]);

  // Jeśli chcesz debugować, możesz chwilowo włączyć pointerEvents i obrócić to w absolut/relative
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
