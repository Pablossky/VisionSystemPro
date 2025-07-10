import React, { useState } from 'react';
import FileViewer from '../components/FileViewer';

export default function MarkerSearch() {
  const [marker, setMarker] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    const res = await window.electronAPI.getMarker(marker);
    setResult(res);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Search Marker</h2>
      <input value={marker} onChange={e => setMarker(e.target.value)} placeholder="Enter marker number" />
      <button onClick={handleSearch}>Search</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Drawing:</strong> {result.drawing_path}</p>
          <p><strong>Material:</strong> {result.material}</p>
          <p><strong>Tolerance:</strong> {result.tolerance}</p>
          <FileViewer filePath={result.drawing_path} />
        </div>
      )}
    </div>
  );
}