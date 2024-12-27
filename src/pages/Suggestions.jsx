import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch suggestions on component mount
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/suggestions/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuggestions(response.data.suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error.response?.data?.message || error.message);
        alert('Failed to fetch suggestions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleDelete = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/suggestions/delete',
        { suggestionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Remove deleted suggestion from state
      setSuggestions(suggestions.filter((s) => s._id !== suggestionId));
      alert('Suggestion deleted successfully.');
    } catch (error) {
      console.error('Error deleting suggestion:', error.response?.data?.message || error.message);
      alert('Failed to delete suggestion.');
    }
  };

  if (loading) return <div>Loading suggestions...</div>;

  return (
    <div className="p-6">
      {/* Dashboard Button */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => navigate('/dashboard')}
      >
        Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4">Suggestions</h1>

      {suggestions.length === 0 ? (
        <p>No suggestions available.</p>
      ) : (
        <ul className="space-y-4">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion._id}
              className="border p-4 rounded shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">Code:</p>
                <pre className="bg-gray-100 p-2 rounded mb-2">{suggestion.code}</pre>
                <p className="font-semibold">Suggestion:</p>
                <p>{suggestion.suggestion}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Created at: {new Date(suggestion.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleDelete(suggestion._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Suggestions;
