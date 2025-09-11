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
export default function UserManager({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ username: '', password: '', role: 'operator' });
    const [message, setMessage] = useState('');
    const actor = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.username) || 'nieznany';
    useEffect(() => {
        fetchUsers();
    }, []);
    function fetchUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield window.electronAPI.getAllUsers();
                setUsers(data);
            }
            catch (e) {
                console.error(e);
                setMessage('Błąd podczas pobierania użytkowników');
            }
        });
    }
    function handleAddUser(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            try {
                const res = yield window.electronAPI.addUser(form);
                if (res.success) {
                    // Dodanie logu przez handler 'log-action'
                    try {
                        yield window.electronAPI.logAction({
                            username: actor,
                            action: 'Utworzono nowy profil',
                            details: `Użytkownik ${actor} utworzył profil ${form.username} z rolą ${form.role}`
                        });
                    }
                    catch (logError) {
                        console.error('Błąd zapisu logu:', logError);
                    }
                    setMessage('Utworzono nowy profil');
                    fetchUsers();
                    setForm({ username: '', password: '', role: 'operator' });
                }
                else {
                    setMessage(res.message || 'Błąd przy dodawaniu użytkownika');
                }
            }
            catch (err) {
                console.error(err);
                setMessage('Błąd podczas dodawania użytkownika');
            }
        });
    }
    function handleRoleChange(username, newRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldUser = users.find(u => u.username === username);
            const oldRole = (oldUser === null || oldUser === void 0 ? void 0 : oldUser.role) || 'nieznana';
            try {
                const res = yield window.electronAPI.updateUserRole({ username, newRole });
                if (res.success) {
                    // Dodanie logu przez handler 'log-action'
                    try {
                        yield window.electronAPI.logAction({
                            username: actor,
                            action: 'Zmiana roli',
                            details: `Użytkownik ${actor} zmienił rolę użytkownika ${username} z ${oldRole} na ${newRole}`
                        });
                    }
                    catch (logError) {
                        console.error('Błąd zapisu logu:', logError);
                    }
                    setMessage('Zmieniono rolę');
                    fetchUsers();
                }
                else {
                    setMessage(res.message || 'Błąd przy zmianie roli');
                }
            }
            catch (err) {
                console.error(err);
                setMessage('Błąd podczas zmiany roli');
            }
        });
    }
    return (React.createElement("div", { style: {
            backgroundColor: '#1e1e2f',
            color: '#fff',
            padding: 20,
            borderRadius: 12,
            maxWidth: 800,
            margin: '20px auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily: 'Segoe UI, sans-serif'
        } },
        React.createElement("h2", { style: { marginBottom: 20, borderBottom: '2px solid #333', paddingBottom: 10 } }, "Zarz\u0105dzanie u\u017Cytkownikami"),
        React.createElement("form", { onSubmit: handleAddUser, style: {
                display: 'flex',
                gap: 10,
                marginBottom: 20,
                flexWrap: 'wrap',
                alignItems: 'center'
            } },
            React.createElement("input", { placeholder: "Nazwa u\u017Cytkownika", value: form.username, onChange: e => setForm(Object.assign(Object.assign({}, form), { username: e.target.value })), required: true, style: {
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #444',
                    backgroundColor: '#2c2c3c',
                    color: '#fff',
                    flex: '1 1 200px'
                } }),
            React.createElement("input", { type: "password", placeholder: "Has\u0142o", value: form.password, onChange: e => setForm(Object.assign(Object.assign({}, form), { password: e.target.value })), required: true, style: {
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #444',
                    backgroundColor: '#2c2c3c',
                    color: '#fff',
                    flex: '1 1 150px'
                } }),
            React.createElement("select", { value: form.role, onChange: e => setForm(Object.assign(Object.assign({}, form), { role: e.target.value })), style: {
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #444',
                    backgroundColor: '#2c2c3c',
                    color: '#fff',
                    flex: '1 1 130px'
                } },
                React.createElement("option", { value: "programmer" }, "programmer"),
                React.createElement("option", { value: "service" }, "service"),
                React.createElement("option", { value: "admin" }, "admin"),
                React.createElement("option", { value: "operator" }, "operator")),
            React.createElement("button", { type: "submit", style: {
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: '0.2s',
                    flex: '0 0 auto'
                } }, "Dodaj u\u017Cytkownika")),
        message && (React.createElement("p", { style: { color: '#64ffda', marginBottom: 20, fontWeight: 500 } }, message)),
        React.createElement("div", { style: { overflowX: 'auto' } },
            React.createElement("table", { style: {
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: '#2c2c3c',
                    borderRadius: 10,
                    overflow: 'hidden'
                } },
                React.createElement("thead", null,
                    React.createElement("tr", { style: { backgroundColor: '#353656' } },
                        React.createElement("th", { style: { padding: 10, textAlign: 'left' } }, "U\u017Cytkownik"),
                        React.createElement("th", { style: { padding: 10, textAlign: 'left' } }, "Rola"),
                        React.createElement("th", { style: { padding: 10, textAlign: 'left' } }, "Zmie\u0144 rol\u0119"))),
                React.createElement("tbody", null, users.map(u => (React.createElement("tr", { key: u.id, style: { borderBottom: '1px solid #444' } },
                    React.createElement("td", { style: { padding: 10 } }, u.username),
                    React.createElement("td", { style: { padding: 10 } }, u.role),
                    React.createElement("td", { style: { padding: 10 } },
                        React.createElement("select", { value: u.role, onChange: e => handleRoleChange(u.username, e.target.value), style: {
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #555',
                                backgroundColor: '#1f1f35',
                                color: '#fff'
                            } },
                            React.createElement("option", { value: "programmer" }, "programmer"),
                            React.createElement("option", { value: "service" }, "service"),
                            React.createElement("option", { value: "admin" }, "admin"),
                            React.createElement("option", { value: "operator" }, "operator")))))))))));
}
