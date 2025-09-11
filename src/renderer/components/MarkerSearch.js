var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
import FileViewer from './FileViewer';
export default function MarkerSearch() {
    const [marker, setMarker] = useState('');
    const [result, setResult] = useState(null);
    const handleSearch = () => __awaiter(this, void 0, void 0, function* () {
        const res = yield window.electronAPI.getMarker(marker);
        setResult(res);
    });
    return (React.createElement("div", { style: { padding: 20 } },
        React.createElement("h2", null, "Search Marker"),
        React.createElement("input", { value: marker, onChange: e => setMarker(e.target.value), placeholder: "Enter marker number" }),
        React.createElement("button", { onClick: handleSearch }, "Search"),
        result && (React.createElement("div", { style: { marginTop: 20 } },
            React.createElement("p", null,
                React.createElement("strong", null, "Drawing:"),
                " ",
                result.drawing_path),
            React.createElement("p", null,
                React.createElement("strong", null, "Material:"),
                " ",
                result.material),
            React.createElement("p", null,
                React.createElement("strong", null, "Tolerance:"),
                " ",
                result.tolerance),
            React.createElement(FileViewer, { filePath: result.drawing_path })))));
}
