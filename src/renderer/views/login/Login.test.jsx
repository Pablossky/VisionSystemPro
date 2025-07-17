import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
    it('should render login form', () => {
        render(<Login onLogin={jest.fn()} />);
        expect(screen.getByPlaceholderText('Login')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Hasło')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument();
    });

    it('should display error message on failed login', async () => {
        window.electronAPI = {
            invoke: jest.fn().mockResolvedValue({ success: false, message: 'Niepoprawne dane' }),
        };
        render(<Login onLogin={jest.fn()} />);
        fireEvent.change(screen.getByPlaceholderText('Login'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: '1234' } });
        fireEvent.click(screen.getByRole('button'));

        await screen.findByText('Niepoprawne dane');
        expect(screen.getByText('Niepoprawne dane')).toBeInTheDocument();
    });
});
