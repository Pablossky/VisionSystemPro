import React from 'react';
export default function RightSidebar({ elements, tolerance, replayComment, isReplay }) {
    return (React.createElement("div", { className: "right-sidebar" },
        React.createElement("h3", null, "Parametry element\u00F3w"),
        elements.length === 0 ? (React.createElement("p", null, "Brak za\u0142adowanych element\u00F3w")) : (React.createElement("ul", { style: { listStyle: 'none', padding: 0 } }, elements.map((el) => {
            var _a, _b;
            return (React.createElement("li", { key: el.id, style: {
                    marginBottom: 15,
                    padding: 10,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: 5,
                    color: '#222'
                } },
                React.createElement("strong", null, el.element_name
                    || el.marker_number
                    || ((_a = el.data) === null || _a === void 0 ? void 0 : _a.name)
                    || ((_b = el.data) === null || _b === void 0 ? void 0 : _b.element_name)
                    || `Element ${el.id || ''}`),
                React.createElement("br", null),
                "Zgodno\u015B\u0107: ",
                React.createElement("strong", null, typeof el.accuracy === 'number' ? `${el.accuracy.toFixed(1)}%` : 'brak danych'),
                React.createElement("br", null),
                "Tolerancja: ",
                React.createElement("strong", null,
                    tolerance.toFixed(1),
                    " mm")));
        }))),
        isReplay && (React.createElement("div", { style: {
                marginTop: 20,
                backgroundColor: '#eef5ff',
                border: '1px solid #99bbff',
                borderRadius: 6,
                padding: 10,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                color: '#224477',
            } },
            React.createElement("h4", null, "Komentarz do odtwarzanego logu:"),
            React.createElement("p", null, replayComment || 'Brak komentarza')))));
}
