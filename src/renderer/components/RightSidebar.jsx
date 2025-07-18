import React from 'react';


export default function RightSidebar({ elements, tolerance, replayComment, isReplay }) {
    return (
        <div className="right-sidebar">
            <h3>Parametry elementów</h3>
            {elements.length === 0 ? (
                <p>Brak załadowanych elementów</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {elements.map((el) => (
                        <li key={el.id} style={{
                            marginBottom: 15,
                            padding: 10,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 5,
                            color: '#222'
                        }}>
                            <strong>
                                {el.element_name
                                    || el.marker_number
                                    || el.data?.name
                                    || el.data?.element_name
                                    || `Element ${el.id || ''}`}
                            </strong>
                            <br />
                            Zgodność: <strong>{typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych'}</strong><br />
                            Tolerancja: <strong>{tolerance.toFixed(1)} mm</strong>
                        </li>
                    ))}
                </ul>
            )}
            {isReplay && (
                <div style={{
                    marginTop: 20,
                    backgroundColor: '#eef5ff',
                    border: '1px solid #99bbff',
                    borderRadius: 6,
                    padding: 10,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    color: '#224477',
                }}>
                    <h4>Komentarz do odtwarzanego logu:</h4>
                    <p>{replayComment || 'Brak komentarza'}</p>
                </div>
            )}

        </div>
    );
}
