import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Search, Code2, Copy, Trash2, Plus, 
  FileCode, Terminal, Layers, Clock, Zap, Star
} from 'lucide-react';

const Snippet = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [snippets, setSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSnippets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}api/snippets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnippets(response.data.snippets);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching snippets');
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const deleteSnippet = async (snippetId) => {
    if (!window.confirm('Are you sure you want to delete this snippet?'))
      return;

    try {
      const response = await axios.post(
        `${BASE_URL}api/snippets/delete`,
        { snippetId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSnippets(snippets.filter((snippet) => snippet._id !== snippetId));
      alert(response.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting snippet');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert('Copied to clipboard!'))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <Terminal className="w-8 h-8 text-emerald-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>Loading Code Snippets</h2>
          <p className='text-slate-400'>Fetching your code collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
        <div className='text-center max-w-md'>
          <div className='w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Code2 className='w-10 h-10 text-red-400' />
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>Error Loading Snippets</h2>
          <p className='text-red-400 mb-4'>{error}</p>
          <button
            onClick={fetchSnippets}
            className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Spectacular Header */}
        <div className='mb-10'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/dashboard')}
                className='group flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600 hover:border-emerald-500'
              >
                <ArrowLeft className='w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform duration-200' />
                <span className='text-slate-300 font-medium'>Back</span>
              </button>
              
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg'>
                  <FileCode className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-white'>Code Snippets</h1>
                  <p className='text-slate-400 text-sm'>Your personal code library and quick references</p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-600'>
                <Layers className='w-4 h-4 text-cyan-400' />
                <span className='text-slate-300 font-medium'>{snippets.length} Snippets</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className='group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all duration-200 shadow-lg'
              >
                <Plus className='w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200' />
                <span className='text-white font-medium'>New Snippet</span>
              </button>
            </div>
          </div>

          {/* Advanced Search Bar */}
          <div className='relative max-w-lg'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Search snippets by name or content...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-100 placeholder-slate-400'
            />
          </div>
        </div>

        {/* Content Area */}
        {snippets.length === 0 ? (
          <div className='text-center py-20'>
            <div className='max-w-md mx-auto'>
              <div className='w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700'>
                <Code2 className='w-12 h-12 text-slate-500' />
              </div>
              <h2 className='text-2xl font-bold text-white mb-4'>No snippets yet</h2>
              <p className='text-slate-400 text-lg leading-relaxed mb-6'>
                Start building your personal code library. Save and organize your most useful code snippets for quick access.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all duration-200 text-white font-medium shadow-lg'
              >
                <Plus className='w-4 h-4' />
                Create First Snippet
              </button>
              <div className='mt-6 flex items-center justify-center gap-2 text-sm text-slate-500'>
                <Terminal className='w-4 h-4' />
                <span>Code smarter, not harder</span>
              </div>
            </div>
          </div>
        ) : (
          <div className='grid gap-6 md:gap-8'>
            {snippets
              .filter((snippet) =>
                snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                snippet.code.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((snippet, index) => (
                <div
                  key={snippet._id}
                  className='group bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 opacity-100 animate-fadeIn'
                  style={{ 
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Card Header */}
                  <div className='px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-750/80 border-b border-slate-700/50'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 bg-emerald-400 rounded-full animate-pulse'></div>
                        <h3 className='text-lg font-semibold text-white'>{snippet.name}</h3>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-slate-400'>
                        <Clock className='w-4 h-4' />
                        <span>{new Date(snippet.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <Terminal className='w-5 h-5 text-emerald-400' />
                        <h4 className='text-lg font-semibold text-emerald-400'>Code</h4>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => copyToClipboard(snippet.code)}
                          className='group/btn flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200'
                          title='Copy code'
                        >
                          <Copy className='w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200' />
                          <span className='hidden sm:inline'>Copy</span>
                        </button>
                        <button
                          onClick={() => deleteSnippet(snippet._id)}
                          className='group/btn flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200'
                          title='Delete snippet'
                        >
                          <Trash2 className='w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200' />
                          <span className='hidden sm:inline'>Delete</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Code Block */}
                    <div className='bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden'>
                      <div className='px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2'>
                        <div className='flex gap-2'>
                          <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                          <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                          <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                        </div>
                        <span className='text-xs text-slate-400 ml-2'>snippet.code</span>
                      </div>
                      <div className='p-4'>
                        <pre className='text-sm font-mono text-slate-100 overflow-x-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 whitespace-pre-wrap break-words'>
                          {snippet.code}
                        </pre>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className='flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50'>
                      <div className='flex items-center gap-2 text-sm text-slate-500'>
                        <Star className='w-3 h-3' />
                        <span>Added to collection</span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-slate-500'>
                        <Zap className='w-3 h-3' />
                        <span>{snippet.code.split('\n').length} lines</span>
                      </div>
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

export default Snippet;
