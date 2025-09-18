import React from 'react';

export default function SimilarElementChooser({ options, onSelect }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
        <h4>Wybierz model elementu</h4>
        <ul>
          {options.map(opt => (
            <li key={opt} style={{ margin: 5 }}>
              <button onClick={() => onSelect(opt.replace('.json', ''))}>
                {opt.replace('.json', '')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
