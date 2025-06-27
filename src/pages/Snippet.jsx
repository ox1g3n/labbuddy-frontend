import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Search, Code2, Copy, Trash2, Plus, 
  FileCode, Terminal, Layers, Clock, Zap, Star,
  Edit3, MoreVertical, Send
} from 'lucide-react';
import { sendCodeToChat, initializeSocket } from '../utils/socket';

const Snippet = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [snippets, setSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '' });
  const [activeDropdown, setActiveDropdown] = useState(null);
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
    
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (token) {
      initializeSocket(token);
    }
  }, [fetchSnippets]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.relative')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

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

  const openEditModal = (snippet) => {
    setEditingSnippet(snippet);
    setEditForm({ name: snippet.name, code: snippet.code });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const updateSnippet = async () => {
    if (!editForm.name.trim()) {
      alert('Snippet name is required');
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}api/snippets/update`,
        {
          snippetId: editingSnippet._id,
          name: editForm.name,
          code: editForm.code
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the snippet in the local state
      setSnippets(snippets.map(snippet => 
        snippet._id === editingSnippet._id 
          ? { ...snippet, name: editForm.name, code: editForm.code }
          : snippet
      ));
      
      setShowEditModal(false);
      setEditingSnippet(null);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating snippet');
    }
  };

  const sendToChat = (snippet) => {
    const success = sendCodeToChat('snippet', {
      name: snippet.name,
      code: snippet.code,
      language: snippet.language
    });
    
    setActiveDropdown(null);
    if (success) {
      toast.success('Snippet sent to group chat!');
    } else {
      toast.error('Failed to send to chat. Please ensure you\'re connected.');
    }
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
                        <div className='relative'>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === snippet._id ? null : snippet._id)}
                            className='group/btn flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200'
                            title='More actions'
                          >
                            <MoreVertical className='w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200' />
                          </button>
                          
                          {activeDropdown === snippet._id && (
                            <div className='absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10'>
                              <div className='py-2'>
                                <button
                                  onClick={() => copyToClipboard(snippet.code)}
                                  className='w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors duration-200'
                                >
                                  <Copy className='w-4 h-4' />
                                  Copy Code
                                </button>
                                <button
                                  onClick={() => openEditModal(snippet)}
                                  className='w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 transition-colors duration-200'
                                >
                                  <Edit3 className='w-4 h-4' />
                                  Edit Snippet
                                </button>
                                <button
                                  onClick={() => sendToChat(snippet)}
                                  className='w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 flex items-center gap-2 transition-colors duration-200'
                                >
                                  <Send className='w-4 h-4' />
                                  Send to Chat
                                </button>
                                <div className='border-t border-slate-700 my-1'></div>
                                <button
                                  onClick={() => deleteSnippet(snippet._id)}
                                  className='w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors duration-200'
                                >
                                  <Trash2 className='w-4 h-4' />
                                  Delete Snippet
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                        <span className='text-xs text-slate-400 ml-2'>{snippet.language}</span>
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

        {/* Edit Modal */}
        {showEditModal && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
            <div className='bg-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-700 relative overflow-hidden'>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-6 h-6 text-blue-400" />
                  <h2 className='text-2xl font-bold text-white'>Edit Code Snippet</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Snippet Name</label>
                    <input
                      type='text'
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder='Enter snippet name...'
                      className='w-full p-4 bg-slate-700 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-slate-400'
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
                    <div className="bg-slate-700 border border-slate-600 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 p-3 border-b border-slate-600 bg-slate-800">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-slate-400 text-sm ml-2 font-mono">code</span>
                      </div>
                      <textarea
                        value={editForm.code}
                        onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                        className='w-full p-4 bg-transparent text-slate-300 h-64 resize-none font-mono text-sm'
                        placeholder='Enter your code here...'
                      />
                    </div>
                  </div>
                </div>
                
                <div className='flex justify-end space-x-4 mt-8'>
                  <button
                    className='px-6 py-3 bg-slate-600 text-slate-300 rounded-xl hover:bg-slate-500 transition-all duration-300'
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2'
                    onClick={updateSnippet}
                  >
                    <Edit3 className="w-4 h-4" />
                    Update Snippet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Snippet;
