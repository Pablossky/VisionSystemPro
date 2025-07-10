import React from 'react';

export default function FileViewer({ filePath }) {
  return (
    <div style={{ border: '1px solid black', marginTop: 20, padding: 10 }}>
      <h3>DXF/PLT Viewer</h3>
      <p>File path: {filePath}</p>
      <canvas id="viewerCanvas" width="600" height="400" style={{ background: '#eee' }}></canvas>
    </div>
  );
}