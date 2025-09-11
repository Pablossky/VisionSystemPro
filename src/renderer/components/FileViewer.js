import React from 'react';
export default function FileViewer({ filePath }) {
    return (React.createElement("div", { style: { border: '1px solid black', marginTop: 20, padding: 10 } },
        React.createElement("h3", null, "DXF/PLT Viewer"),
        React.createElement("p", null,
            "File path: ",
            filePath),
        React.createElement("canvas", { id: "viewerCanvas", width: "600", height: "400", style: { background: '#eee' } })));
}
