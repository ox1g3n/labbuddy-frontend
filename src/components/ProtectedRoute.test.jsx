import React from 'react'; // Add this line
import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Routes,
  Route,
  Navigate as OriginalNavigate,
} from 'react-router-dom'; // Import actual components
import ProtectedRoute from './ProtectedRoute';
import PropTypes from 'prop-types';

// Mock Navigate using jest.fn() for more control
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    Navigate: (props) => {
      mockNavigate(props); // Call our mock function with Navigate's props
      return <div data-testid='navigate' data-to={props.to}></div>; // Render a simple div for testing
    },
  };
});

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorage.clear();
    mockNavigate.mockClear(); // Clear the mockNavigate calls
  });

  it('should render children if token exists in localStorage', () => {
    localStorage.setItem('token', 'fake-token');

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

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled(); // Ensure Navigate was not called
  });

  it("should call Navigate with to='/' if token does not exist", () => {
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

    // Check if our mockNavigate was called with the correct props
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    expect(screen.getByTestId('navigate')).toBeInTheDocument(); // Check if the placeholder div is rendered
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');

    // You might also assert that the protected content is NOT rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
