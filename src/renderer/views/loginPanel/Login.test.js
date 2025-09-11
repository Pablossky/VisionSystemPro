var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
describe('Login Component', () => {
    it('should render login form', () => {
        render(React.createElement(Login, { onLogin: jest.fn() }));
        expect(screen.getByPlaceholderText('Login')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Hasło')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument();
    });
    it('should display error message on failed login', () => __awaiter(void 0, void 0, void 0, function* () {
        window.electronAPI = {
            invoke: jest.fn().mockResolvedValue({ success: false, message: 'Niepoprawne dane' }),
        };
        render(React.createElement(Login, { onLogin: jest.fn() }));
        fireEvent.change(screen.getByPlaceholderText('Login'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: '1234' } });
        fireEvent.click(screen.getByRole('button'));
        yield screen.findByText('Niepoprawne dane');
        expect(screen.getByText('Niepoprawne dane')).toBeInTheDocument();
    }));
});
