var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useState } from 'react';
export default function CommentManager() {
    const [comments, setComments] = useState([]);
    const [newText, setNewText] = useState('');
    const fetchComments = () => __awaiter(this, void 0, void 0, function* () {
        const rows = yield window.electronAPI.invoke('get-approval-comments');
        setComments(rows);
    });
    useEffect(() => {
        fetchComments();
    }, []);
    const handleAdd = () => __awaiter(this, void 0, void 0, function* () {
        if (newText.trim() === '')
            return;
        yield window.electronAPI.invoke('add-approval-comment', newText.trim());
        setNewText('');
        fetchComments();
    });
    const handleDelete = (id) => __awaiter(this, void 0, void 0, function* () {
        yield window.electronAPI.invoke('delete-approval-comment', id);
        fetchComments();
    });
    return (React.createElement("div", { style: { padding: 20 } },
        React.createElement("h3", null, "Zarz\u0105dzanie gotowymi komentarzami"),
        React.createElement("input", { type: "text", value: newText, onChange: e => setNewText(e.target.value), placeholder: "Nowy komentarz", style: { marginRight: 10 } }),
        React.createElement("button", { onClick: handleAdd }, "Dodaj"),
        React.createElement("ul", { style: { marginTop: 20 } }, comments.map(c => (React.createElement("li", { key: c.id, style: { marginBottom: 10 } },
            c.text,
            React.createElement("button", { style: { marginLeft: 10 }, onClick: () => handleDelete(c.id) }, "Usu\u0144")))))));
}
