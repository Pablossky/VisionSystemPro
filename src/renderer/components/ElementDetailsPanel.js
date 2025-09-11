import React from 'react';
export default function ElementDetailsPanel({ elements, tolerance }) {
    return (React.createElement("div", { style: { width: 300, paddingLeft: 20 } },
        React.createElement("h3", null, "Parametry element\u00F3w"),
        elements.length === 0 ? (React.createElement("p", null, "Brak za\u0142adowanych element\u00F3w")) : (React.createElement("ul", { style: { listStyle: 'none', padding: 0 } }, elements.map((el) => (React.createElement("li", { key: el.id, style: {
                marginBottom: 15,
                padding: 10,
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: 5,
                color: 'black'
            } },
            React.createElement("strong", null, el.element_name || `Element ${el.id}`),
            React.createElement("br", null),
            "Zgodno\u015B\u0107: ",
            React.createElement("strong", null, typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych'),
            React.createElement("br", null),
            "Tolerancja: ",
            React.createElement("strong", null,
                tolerance.toFixed(1),
                " mm"))))))));
}
