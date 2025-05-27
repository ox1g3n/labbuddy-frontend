import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Snippet from './pages/Snippet.jsx';
import Notebooks from './pages/Notebooks.jsx';
import Suggestions from './pages/Suggestions.jsx';
import GroupChat from './components/GroupChat.jsx';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Just initialize loading state
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path='chat' element={<GroupChat />} />
        </Route>
        <Route
          path='/snippets'
          element={
            <ProtectedRoute>
              <Snippet />
            </ProtectedRoute>
          }
        />
        <Route
          path='/notebooks'
          element={
            <ProtectedRoute>
              <Notebooks />
            </ProtectedRoute>
          }
        />
        <Route
          path='/suggestions'
          element={
            <ProtectedRoute>
              <Suggestions />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
};

export default App;
