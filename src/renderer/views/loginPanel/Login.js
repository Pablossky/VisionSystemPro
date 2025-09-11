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
import './Login.css';
import Logo from './../../../assets/LOGO.png';
export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState('password'); // 'password' lub 'qr'
    const [qrCode, setQrCode] = useState('');
    const handleLogin = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setError('');
        if (mode === 'password') {
            const response = yield window.electronAPI.invoke('login-user', { username, password });
            if (response.success) {
                onLogin(response.user);
            }
            else {
                setError(response.message);
            }
        }
        else if (mode === 'qr') {
            if (!qrCode) {
                setError('Proszę zeskanować kod QR');
                return;
            }
            const response = yield window.electronAPI.invoke('login-user-qr', { qrCode });
            if (response.success) {
                onLogin(response.user);
            }
            else {
                setError(response.message);
            }
        }
    });
    const simulateQrScan = () => {
        setQrCode('PRZYKLADOWY_KOD_QR_123456');
        setError('');
    };
    return (React.createElement("div", { className: "login-wrapper" },
        React.createElement("div", { className: "login-header" },
            React.createElement("img", { src: Logo, alt: "Logo", className: "login-logo" }),
            React.createElement("h1", { className: "login-title" }, "Vision System - Pro")),
        React.createElement("div", { className: "login-panel card" },
            React.createElement("h2", null, "Panel logowania"),
            React.createElement("div", { className: "mode-switcher" },
                React.createElement("button", { className: mode === 'password' ? 'active' : '', onClick: () => { setMode('password'); setError(''); } }, "Login i has\u0142o"),
                React.createElement("button", { className: mode === 'qr' ? 'active' : '', onClick: () => { setMode('qr'); setError(''); } }, "Logowanie QR")),
            React.createElement("form", { onSubmit: handleLogin },
                mode === 'password' && (React.createElement(React.Fragment, null,
                    React.createElement("input", { type: "text", placeholder: "Login", value: username, onChange: (e) => setUsername(e.target.value), required: true, className: "login-input" }),
                    React.createElement("input", { type: "password", placeholder: "Has\u0142o", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "login-input" }))),
                mode === 'qr' && (React.createElement("div", { className: "qr-login" },
                    React.createElement("p", null, "Kliknij przycisk, aby zasymulowa\u0107 skanowanie kodu QR"),
                    React.createElement("button", { type: "button", onClick: simulateQrScan, className: "qr-scan-button" }, "Skanuj kod QR"),
                    qrCode && React.createElement("p", { className: "qr-code-text" },
                        "Zeskanowany kod: ",
                        qrCode))),
                React.createElement("button", { type: "submit", className: "log-button" }, "Zaloguj si\u0119"),
                error && React.createElement("p", { className: "error-text" }, error)))));
}
