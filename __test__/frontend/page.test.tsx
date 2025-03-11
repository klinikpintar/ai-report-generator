import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from '../../app/(chat)/page'; 
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock alert global
const mockAlert = jest.fn();
global.alert = mockAlert;

// Mock localStorage
const localStorageMock = (function () {
    let store: { [key: string]: string } = {};
    return {
        getItem: function (key: string) {
            return store[key] || null;
        },
        setItem: function (key: string, value: string) {
            store[key] = value;
        },
        removeItem: function (key: string) {
            delete store[key];
        },
        clear: function () {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Home Component', () => {
    let mockAxios: MockAdapter;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        localStorage.clear();
        jest.clearAllMocks();
        mockAlert.mockClear();
    });

    afterEach(() => {
        mockAxios.restore();
    });

    test('should redirect to login if no token is found', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        }, { timeout: 3000 });
    });

    test('should redirect to login if token is invalid', async () => {
        localStorage.setItem('access_token', 'invalid-token');
        mockAxios.onGet('/api/auth/token/verify').reply(401);

        render(<Home />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    test('should stay on the page if token is valid', async () => {
        localStorage.setItem('access_token', 'valid-token');
        mockAxios.onGet('/api/auth/token/verify').reply(200);

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('Welcome to AI Report Generator')).toBeInTheDocument();
        });
    });

    test('should logout and redirect to login when logout button is clicked', async () => {
        localStorage.setItem('access_token', 'valid-token');
        mockAxios.onGet('/api/auth/token/verify').reply(200);
        mockAxios.onPost('/api/auth/logout').reply(200);
    
        render(<Home />);
    
        await waitFor(() => {
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });
    
        const logoutButton = screen.getByText('Logout');
        await act(async () => {
            fireEvent.click(logoutButton);
        });
    
        await waitFor(() => {
            expect(localStorage.getItem('access_token')).toBeNull();
        });
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('should handle logout failure and show error', async () => {
        // Mock already login condition
        localStorage.setItem('access_token', 'valid-token');
        mockAxios.onGet('/api/auth/token/verify').reply(200);
        mockAxios.onPost('/api/auth/logout').reply(500);
    
        render(<Home />);
    
        await waitFor(() => {
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });
    
        await act(async () => {
            fireEvent.click(screen.getByText('Logout'));
        });
    
        await waitFor(() => {
            expect(mockAxios.history.post.length).toBe(1); // Wait for the logout API call
        });
    
        expect(localStorage.getItem('access_token')).toBe('valid-token');
        expect(mockPush).not.toHaveBeenCalledWith('/login');
        expect(mockAlert).toHaveBeenCalledWith('Logout failed. Please try again.');
    });

    test('should not call logout API if no token is found', async () => {
        render(<Home />);
    
        // If no token, component redirects to /login, so Logout button might not exist
        const logoutButton = screen.queryByText('Logout');
        if (logoutButton) {
            await act(async () => {
                fireEvent.click(logoutButton);
            });
        }
        await waitFor(() => {
            expect(mockAxios.history.post.length).toBe(0);
        });
        expect(mockPush).toHaveBeenCalledWith('/login');
    });
});