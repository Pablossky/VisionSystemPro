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
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainMenu from './MainMenu';
jest.mock('./../ControlPanel', () => () => React.createElement("div", null, "Mocked ControlPanel"));
describe('MainMenu', () => {
    const mockUser = {
        username: 'jan_kowalski',
        role: 'operator',
    };
    const mockOnLogout = jest.fn();
    beforeAll(() => {
        window.electronAPI = {
            invoke: jest.fn((channel) => {
                if (channel === 'get-parameter')
                    return Promise.resolve(2.0);
                return Promise.resolve(null);
            }),
        };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('renders user info and role correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        render(React.createElement(MainMenu, { user: mockUser, onLogout: mockOnLogout }));
        yield waitFor(() => {
            expect(screen.getByText(/Użytkownik: jan_kowalski/i)).toBeInTheDocument();
            expect(screen.getByText(/Rola:/i)).toBeInTheDocument();
            expect(screen.getByText(/operator/i)).toBeInTheDocument();
        });
    }));
    it('displays available options for operator', () => __awaiter(void 0, void 0, void 0, function* () {
        render(React.createElement(MainMenu, { user: mockUser, onLogout: mockOnLogout }));
        yield waitFor(() => {
            expect(screen.getByText('Skanuj marker')).toBeInTheDocument();
            expect(screen.getByText('Wyszukaj marker')).toBeInTheDocument();
            expect(screen.getByText('Podgląd konturu')).toBeInTheDocument();
            expect(screen.getByText('Wyloguj się')).toBeInTheDocument();
        });
    }));
    it('activates selected option on click', () => __awaiter(void 0, void 0, void 0, function* () {
        yield act(() => __awaiter(void 0, void 0, void 0, function* () {
            render(React.createElement(MainMenu, { user: mockUser, onLogout: mockOnLogout }));
        }));
        const markerOption = screen.getByText('Skanuj marker');
        yield act(() => __awaiter(void 0, void 0, void 0, function* () {
            fireEvent.click(markerOption);
        }));
        yield waitFor(() => {
            expect(markerOption).toHaveClass('selected');
        });
    }));
    it('calls logout when clicking "Wyloguj się"', () => __awaiter(void 0, void 0, void 0, function* () {
        yield act(() => __awaiter(void 0, void 0, void 0, function* () {
            render(React.createElement(MainMenu, { user: mockUser, onLogout: mockOnLogout }));
        }));
        const logoutOption = screen.getByText('Wyloguj się');
        yield act(() => __awaiter(void 0, void 0, void 0, function* () {
            fireEvent.click(logoutOption);
        }));
        expect(mockOnLogout).toHaveBeenCalled();
    }));
});
