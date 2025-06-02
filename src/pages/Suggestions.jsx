import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Lightbulb, Code, Sparkles, ArrowLeft, Copy, 
  Trash2, Clock, Bot, FileText 
} from 'lucide-react';
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
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <Bot className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>Loading AI Suggestions</h2>
          <p className='text-gray-400'>Fetching your personalized insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Modern Header */}
        <div className='mb-10'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/dashboard')}
                className='group flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 hover:border-purple-500'
              >
                <ArrowLeft className='w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform duration-200' />
                <span className='text-gray-300 font-medium'>Back</span>
              </button>
              
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg'>
                  <Lightbulb className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-white'>AI Suggestions</h1>
                  <p className='text-gray-400 text-sm'>Smart code insights and recommendations</p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-600'>
              <Sparkles className='w-4 h-4 text-yellow-400' />
              <span className='text-gray-300 font-medium'>{suggestions.length} Total</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {suggestions.length === 0 ? (
          <div className='text-center py-20'>
            <div className='max-w-md mx-auto'>
              <div className='w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6'>
                <FileText className='w-12 h-12 text-gray-500' />
              </div>
              <h2 className='text-2xl font-bold text-white mb-4'>No suggestions yet</h2>
              <p className='text-gray-400 text-lg leading-relaxed'>
                Use the AI Help feature in the code editor to generate personalized suggestions and insights for your projects.
              </p>
              <div className='mt-6 flex items-center justify-center gap-2 text-sm text-gray-500'>
                <Bot className='w-4 h-4' />
                <span>AI-powered recommendations</span>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-8'>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion._id}
                className='bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg opacity-100 animate-fadeIn'
                style={{ 
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Card Header */}
                <div className='px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
                      <h3 className='text-lg font-semibold text-white'>Code Analysis</h3>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-400'>
                      <Clock className='w-4 h-4' />
                      <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className='p-6 space-y-6'>
                  {/* Code Section */}
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <Code className='w-5 h-5 text-blue-400' />
                        <h4 className='text-lg font-semibold text-blue-400'>Your Code</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.code)}
                        className='group flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200'
                        title='Copy code'
                      >
                        <Copy className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                        <span className='hidden sm:inline'>Copy</span>
                      </button>
                    </div>
                    <div className='relative'>
                      <pre className='bg-gray-900 p-4 rounded-lg overflow-y-auto text-sm font-mono text-gray-300 border border-gray-700 max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800'>
                        <code className='whitespace-pre-wrap break-words'>{suggestion.code}</code>
                      </pre>
                    </div>
                  </div>

                  {/* AI Suggestion Section */}
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <Bot className='w-5 h-5 text-purple-400' />
                        <h4 className='text-lg font-semibold text-purple-400'>AI Recommendation</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.suggestion)}
                        className='group flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200'
                        title='Copy suggestion'
                      >
                        <Copy className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                        <span className='hidden sm:inline'>Copy</span>
                      </button>
                    </div>
                    <div className='bg-gray-900 p-4 rounded-lg border border-gray-700 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800'>
                      <div className='prose prose-invert max-w-none text-gray-300'>
                        <ReactMarkdown
                          components={{
                            p: ({ _node, ...props }) => (
                              <p className='mb-4 text-gray-300 leading-relaxed' {...props} />
                            ),
                            pre: ({ _node, ...props }) => (
                              <pre className='bg-gray-800 p-3 rounded-md overflow-x-auto mb-4 text-sm border border-gray-600' {...props} />
                            ),
                            code: ({ _node, inline, ...props }) =>
                              inline ? (
                                <code className='bg-gray-800 px-2 py-1 rounded text-sm text-purple-300 border border-gray-600' {...props} />
                              ) : (
                                <code className='block text-sm font-mono text-gray-300' {...props} />
                              ),
                            h1: ({ _node, ...props }) => (
                              <h1 className='text-xl mb-4 text-white font-bold' {...props} />
                            ),
                            h2: ({ _node, ...props }) => (
                              <h2 className='text-lg mb-3 text-white font-semibold' {...props} />
                            ),
                            ul: ({ _node, ...props }) => (
                              <ul className='list-disc pl-5 mb-4 text-gray-300 space-y-1' {...props} />
                            ),
                            ol: ({ _node, ...props }) => (
                              <ol className='list-decimal pl-5 mb-4 text-gray-300 space-y-1' {...props} />
                            ),
                            li: ({ _node, ...props }) => (
                              <li className='text-gray-300' {...props} />
                            ),
                          }}
                        >
                          {suggestion.suggestion}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className='flex items-center justify-between pt-4 border-t border-gray-700'>
                    <div className='text-sm text-gray-500'>
                      Generated on {new Date(suggestion.createdAt).toLocaleDateString()} at {new Date(suggestion.createdAt).toLocaleTimeString()}
                    </div>
                    <button
                      onClick={() => handleDelete(suggestion._id)}
                      className='group flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/40'
                      title='Delete suggestion'
                    >
                      <Trash2 className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                      <span className='text-sm font-medium'>Delete</span>
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
