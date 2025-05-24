import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Snippet from "./pages/Snippet.jsx";
import Notebooks from "./pages/Notebooks.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import GroupChat from "./components/GroupChat.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="chat" element={<GroupChat />} />
        </Route>
        <Route
          path="/snippets"
          element={
            <ProtectedRoute>
              <Snippet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notebooks"
          element={
            <ProtectedRoute>
              <Notebooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <ProtectedRoute>
              <Suggestions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
