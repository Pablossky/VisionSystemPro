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
import LogsWindow from './LogsWindow';
describe('LogsWindow', () => {
    beforeEach(() => {
        window.electronAPI = {
            getLogs: jest.fn().mockResolvedValue([
                {
                    id: 1,
                    timestamp: new Date().toISOString(),
                    username: 'tester',
                    action: 'skanowanie',
                    details: 'Element X',
                },
            ]),
        };
    });
    it('renders logs after fetching', () => __awaiter(void 0, void 0, void 0, function* () {
        render(React.createElement(LogsWindow, { onClose: jest.fn(), onReplayScan: jest.fn() }));
        expect(yield screen.findByText(/tester/)).toBeInTheDocument();
        expect(screen.getByText(/skanowanie/)).toBeInTheDocument();
    }));
    it('filters by username', () => __awaiter(void 0, void 0, void 0, function* () {
        render(React.createElement(LogsWindow, { onClose: jest.fn(), onReplayScan: jest.fn() }));
        yield screen.findByText(/tester/);
        fireEvent.change(screen.getByPlaceholderText(/filtruj po użytkowniku/i), {
            target: { value: 'test' },
        });
        expect(screen.getByText(/tester/)).toBeInTheDocument();
    }));
});
