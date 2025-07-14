import React from 'react';

export default function ElementDetailsPanel({ elements, tolerance }) {
  return (
    <div style={{ width: 300, paddingLeft: 20 }}>
      <h3>Parametry elementów</h3>
      {elements.length === 0 ? (
        <p>Brak załadowanych elementów</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {elements.map((el) => (
            <li key={el.id} style={{
              marginBottom: 15,
              padding: 10,
              background: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: 5,
              color: 'black'
            }}>
              <strong>{el.element_name || `Element ${el.id}`}</strong>
              <br />
              Zgodność: <strong>{typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych'}</strong>
              <br />
              Tolerancja: <strong>{tolerance.toFixed(1)} mm</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
