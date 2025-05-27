import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the api module
jest.mock('../utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Mock Navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    Navigate: (props) => {
      mockNavigate(props);
      // eslint-disable-next-line react/prop-types
      return <div data-testid='navigate' data-to={props.to}></div>;
    },
  };
});

// Import after mocking
import ProtectedRoute from './ProtectedRoute';
import api from '../utils/api';

const mockApi = jest.mocked(api);

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockApi.get.mockClear();
  });

  test('should render children if token exists and API verification succeeds', async () => {
    mockApi.get.mockResolvedValue({ data: { valid: true } });
    localStorage.setItem('token', 'valid-token');

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should redirect to login if no token exists', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path='/' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('should redirect to login if token exists but API verification fails', async () => {
    mockApi.get.mockRejectedValue(new Error('Invalid token'));
    localStorage.setItem('token', 'invalid-token');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path='/' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    });

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
