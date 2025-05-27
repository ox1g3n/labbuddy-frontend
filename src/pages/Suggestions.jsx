import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaChevronLeft, FaCopy } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchSuggestions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}api/suggestions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error(
        'Error fetching suggestions:',
        error.response?.data?.message || error.message
      );
      alert('Failed to fetch suggestions.');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleDelete = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?'))
      return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}api/suggestions/delete`,
        { suggestionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuggestions(suggestions.filter((s) => s._id !== suggestionId));
      alert('Suggestion deleted successfully.');
    } catch (error) {
      console.error(
        'Error deleting suggestion:',
        error.response?.data?.message || error.message
      );
      alert('Failed to delete suggestion.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch((err) => console.error('Failed to copy:', err));
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='text-base md:text-xl text-blue-400 animate-pulse'>
          Loading suggestions...
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-4 sm:p-6 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header Section */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
            <button
              className='flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 border border-gray-700 text-sm sm:text-base'
              onClick={() => navigate('/dashboard')}
            >
              <FaChevronLeft className='text-blue-400' />
              <span>Dashboard</span>
            </button>
            <h1 className='text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500'>
              AI Suggestions
            </h1>
          </div>
        </div>

        {/* Content Section */}
        {suggestions.length === 0 ? (
          <div className='text-center py-8 sm:py-12 bg-gray-800/50 rounded-lg border border-gray-700 px-4'>
            <p className='text-lg sm:text-xl text-gray-400'>
              No suggestions available yet.
            </p>
            <p className='text-sm sm:text-base text-gray-500 mt-2'>
              Use the AI Help feature in the code editor to get suggestions.
            </p>
          </div>
        ) : (
          <div className='grid gap-4 sm:gap-6'>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion._id}
                className='bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300'
              >
                <div className='p-4 sm:p-6'>
                  {/* Code Section */}
                  <div className='mb-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <h3 className='text-base sm:text-lg font-semibold text-blue-400'>
                        Code
                      </h3>
                      <button
                        onClick={() => copyToClipboard(suggestion.code)}
                        className='p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300'
                        title='Copy code'
                      >
                        <FaCopy className='text-gray-400 hover:text-blue-400 text-sm sm:text-base' />
                      </button>
                    </div>
                    <div className='relative'>
                      <pre className='bg-gray-900/50 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono border border-gray-700 max-h-[400px] whitespace-pre-wrap break-all sm:break-normal'>
                        <code>{suggestion.code}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Suggestion Section */}
                  <div>
                    <div className='flex justify-between items-center mb-2'>
                      <h3 className='text-base sm:text-lg font-semibold text-purple-400'>
                        Suggestion
                      </h3>
                      <button
                        onClick={() => copyToClipboard(suggestion.suggestion)}
                        className='p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300'
                        title='Copy suggestion'
                      >
                        <FaCopy className='text-gray-400 hover:text-blue-400 text-sm sm:text-base' />
                      </button>
                    </div>
                    <div className='bg-gray-900/50 p-3 sm:p-4 rounded-lg border border-gray-700'>
                      <div className='prose prose-invert max-w-none prose-sm sm:prose-base'>
                        <ReactMarkdown
                          className='text-gray-200'
                          components={{
                            p: ({ _node, ...props }) => (
                              <p
                                className='mb-3 sm:mb-4 text-sm sm:text-base'
                                {...props}
                              />
                            ),
                            pre: ({ _node, ...props }) => (
                              <pre
                                className='bg-gray-800 p-3 sm:p-4 rounded-lg overflow-x-auto mb-3 sm:mb-4 text-xs sm:text-sm whitespace-pre-wrap'
                                {...props}
                              />
                            ),
                            code: ({ _node, inline, ...props }) =>
                              inline ? (
                                <code
                                  className='bg-gray-800 px-1 py-0.5 rounded text-xs sm:text-sm'
                                  {...props}
                                />
                              ) : (
                                <code
                                  className='block text-xs sm:text-sm font-mono'
                                  {...props}
                                />
                              ),
                            h1: ({ _node, ...props }) => (
                              <h1
                                className='text-lg sm:text-xl mb-4'
                                {...props}
                              />
                            ),
                            h2: ({ _node, ...props }) => (
                              <h2
                                className='text-base sm:text-lg mb-3'
                                {...props}
                              />
                            ),
                            ul: ({ _node, ...props }) => (
                              <ul
                                className='list-disc pl-4 mb-3 sm:mb-4'
                                {...props}
                              />
                            ),
                            ol: ({ _node, ...props }) => (
                              <ol
                                className='list-decimal pl-4 mb-3 sm:mb-4'
                                {...props}
                              />
                            ),
                            li: ({ _node, ...props }) => (
                              <li
                                className='mb-1 text-sm sm:text-base'
                                {...props}
                              />
                            ),
                          }}
                        >
                          {suggestion.suggestion}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className='mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500'>
                    <span className='order-2 sm:order-1'>
                      Created: {new Date(suggestion.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(suggestion._id)}
                      className='flex items-center space-x-2 px-2 sm:px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-300 order-1 sm:order-2 self-end'
                      title='Delete suggestion'
                    >
                      <FaTrash className='text-xs sm:text-sm' />
                      <span className='text-xs sm:text-sm'>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
