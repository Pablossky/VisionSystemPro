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

    it('renders logs after fetching', async () => {
        render(<LogsWindow onClose={jest.fn()} onReplayScan={jest.fn()} />);
        expect(await screen.findByText(/tester/)).toBeInTheDocument();
        expect(screen.getByText(/skanowanie/)).toBeInTheDocument();
    });

    it('filters by username', async () => {
        render(<LogsWindow onClose={jest.fn()} onReplayScan={jest.fn()} />);
        await screen.findByText(/tester/);

        fireEvent.change(screen.getByPlaceholderText(/filtruj po użytkowniku/i), {
            target: { value: 'test' },
        });

        expect(screen.getByText(/tester/)).toBeInTheDocument();
    });
});
