import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainMenu from './MainMenu';

jest.mock('./../ControlPanel', () => () => <div>Mocked ControlPanel</div>);

describe('MainMenu', () => {
    const mockUser = {
        username: 'jan_kowalski',
        role: 'operator',
    };

    const mockOnLogout = jest.fn();

    beforeAll(() => {
        window.electronAPI = {
            invoke: jest.fn((channel) => {
                if (channel === 'get-parameter') return Promise.resolve(2.0);
                return Promise.resolve(null);
            }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders user info and role correctly', async () => {
        render(<MainMenu user={mockUser} onLogout={mockOnLogout} />);
        await waitFor(() => {
            expect(screen.getByText(/Użytkownik: jan_kowalski/i)).toBeInTheDocument();
            expect(screen.getByText(/Rola:/i)).toBeInTheDocument();
            expect(screen.getByText(/operator/i)).toBeInTheDocument();
        });
    });

    it('displays available options for operator', async () => {
        render(<MainMenu user={mockUser} onLogout={mockOnLogout} />);
        await waitFor(() => {
            expect(screen.getByText('Skanuj marker')).toBeInTheDocument();
            expect(screen.getByText('Wyszukaj marker')).toBeInTheDocument();
            expect(screen.getByText('Podgląd konturu')).toBeInTheDocument();
            expect(screen.getByText('Wyloguj się')).toBeInTheDocument();
        });
    });

    it('activates selected option on click', async () => {
        await act(async () => {
            render(<MainMenu user={mockUser} onLogout={mockOnLogout} />);
        });

        const markerOption = screen.getByText('Skanuj marker');

        await act(async () => {
            fireEvent.click(markerOption);
        });

        await waitFor(() => {
            expect(markerOption).toHaveClass('selected');
        });
    });

    it('calls logout when clicking "Wyloguj się"', async () => {
        await act(async () => {
            render(<MainMenu user={mockUser} onLogout={mockOnLogout} />);
        });

        const logoutOption = screen.getByText('Wyloguj się');

        await act(async () => {
            fireEvent.click(logoutOption);
        });

        expect(mockOnLogout).toHaveBeenCalled();
    });
});
