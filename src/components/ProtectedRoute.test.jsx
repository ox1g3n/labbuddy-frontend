import { render, screen } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../../../labbuddy-frontend/src/components/ProtectedRoute";
import PropTypes from 'prop-types';

// Mock react-router-dom's Navigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Navigate: MockedNavigate,
}));

// Add PropTypes to the mocked Navigate component
const MockedNavigate = ({ to }) => <div data-testid="navigate" data-to={to}></div>;

MockedNavigate.propTypes = {
  to: PropTypes.string.isRequired,
};

describe("ProtectedRoute", () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should render children if token exists in localStorage", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>,
      {
        wrapper: ({ children }) => <Routes>{children}</Routes>,
        initialEntries: ["/dashboard"],
      },
    ); // Use initialEntries to simulate navigation

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument(); // Ensure Navigate was not rendered
  });

  it("should navigate to login page if token does not exist", () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Login Page</div>} />{" "}
          {/* Add a route for the redirect */}
        </Routes>
      </BrowserRouter>,
      {
        wrapper: ({ children }) => <Routes>{children}</Routes>,
        initialEntries: ["/dashboard"],
      },
    );

    // Check if Navigate component was rendered with the correct 'to' prop
    const navigateElement = screen.getByTestId("navigate");
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute("data-to", "/");

    // You might also assert that the protected content is NOT rendered
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  // You might want to add more tests for edge cases or different routes
});
