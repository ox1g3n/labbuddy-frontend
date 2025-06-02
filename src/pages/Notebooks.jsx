import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, 
  X, Code2, Search, Download, Lightbulb, FileText, Calendar,
  Clock, Sparkles, Play, Copy, Bot, Zap, Star, BookMarked
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { createNotebookPDFTemplate } from '../utils/pdfFormatters';

function Notebooks() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [notebooks, setNotebooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [expandedNotebookId, setExpandedNotebookId] = useState(null);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newQA, setNewQA] = useState({ question: '', language: '', code: '' });
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const navigate = useNavigate();

  const fetchNotebooks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}api/notebooks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotebooks(response.data.notebooks || []);
    } catch (error) {
      console.error(
        'Error fetching notebooks:',
        error.response?.data?.message || error.message
      );
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  const createNotebook = async () => {
    if (!newNotebookName.trim()) return alert('Notebook name is required');
    try {
      await axios.post(
        `${BASE_URL}api/notebooks/create`,
        { name: newNotebookName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchNotebooks();
      setShowNotebookModal(false);
      setNewNotebookName('');
    } catch (error) {
      console.error('Error creating notebook:', error);
    }
  };

  const deleteNotebook = async (notebookId) => {
    if (!window.confirm('Are you sure you want to delete this notebook?'))
      return;

    try {
      await axios.post(
        `${BASE_URL}api/notebooks/delete`,
        { notebookId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchNotebooks();
    } catch (error) {
      console.error('Error deleting notebook:', error);
    }
  };

  const toggleNotebook = (notebookId) => {
    setExpandedNotebookId(
      notebookId === expandedNotebookId ? null : notebookId
    );
  };

  const createQA = async () => {
    const { question, language, code } = newQA;
    if (!question || !language || !code)
      return alert('Please fill out all fields to create a QA');
    try {
      await axios.post(
        `${BASE_URL}api/qa/createQA`,
        { ...newQA, nbid: selectedNotebookId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchNotebooks();
      setShowQAModal(false);
      setNewQA({ question: '', language: '', code: '' });
    } catch (error) {
      console.error('Error creating QA:', error);
    }
  };

  const deleteQA = async (qaId) => {
    if (!window.confirm('Are you sure you want to delete this QA?')) return;

    try {
      await axios.post(
        `${BASE_URL}api/qa/delete`,
        { qaId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchNotebooks();
    } catch (error) {
      console.error('Error deleting QA:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const exportToPdf = async (notebook) => {
    let element = null;
    try {
      setLoading(true);
      toast.loading('Generating PDF...', { id: 'pdf-export' });

      element = document.createElement('div');
      element.innerHTML = createNotebookPDFTemplate(notebook);
      document.body.appendChild(element);

      const opt = {
        filename: `${notebook.name.replace(/\s+/g, '_')}_notebook.pdf`,
        margin: [10, 10, 10, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().from(element).set(opt).save();
      toast.success('PDF exported successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF', { id: 'pdf-export' });
    } finally {
      if (element && element.parentNode) {
        document.body.removeChild(element);
      }
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Modern Header */}
        <div className='mb-10'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/dashboard')}
                className='group flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 hover:border-blue-500'
              >
                <ArrowLeft className='w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform duration-200' />
                <span className='text-gray-300 font-medium'>Back</span>
              </button>
              
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
                  <BookOpen className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-white'>Notebooks</h1>
                  <p className='text-gray-400 text-sm'>Organize your code solutions and learning notes</p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-600'>
                <BookMarked className='w-4 h-4 text-emerald-400' />
                <span className='text-gray-300 font-medium'>{notebooks.length} Notebooks</span>
              </div>
              <button
                onClick={() => setShowNotebookModal(true)}
                className='group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-200'
              >
                <Plus className='w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200' />
                <span className='text-white font-medium'>New Notebook</span>
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Search notebooks by name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400'
            />
          </div>
        </div>

        {/* Content Area */}
        {notebooks.length === 0 ? (
          <div className='text-center py-20'>
            <div className='max-w-md mx-auto'>
              <div className='w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6'>
                <FileText className='w-12 h-12 text-gray-500' />
              </div>
              <h2 className='text-2xl font-bold text-white mb-4'>No notebooks yet</h2>
              <p className='text-gray-400 text-lg leading-relaxed'>
                Create your first notebook to organize your code solutions and learning notes.
              </p>
              <div className='mt-6 flex items-center justify-center gap-2 text-sm text-gray-500'>
                <BookOpen className='w-4 h-4' />
                <span>Start your learning journey</span>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {notebooks
              .filter((notebook) =>
                notebook.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((notebook, index) => (
                <div
                  key={notebook._id}
                  className='bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg opacity-100 animate-fadeIn'
                  style={{ 
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div
                    className='px-6 py-5 cursor-pointer hover:bg-gray-750/50 transition-colors duration-200'
                    onClick={() => toggleNotebook(notebook._id)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
                          <BookOpen className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <h3 className='text-xl font-bold text-white mb-1'>{notebook.name}</h3>
                          <div className='flex items-center gap-4 text-sm text-gray-400'>
                            <span className='flex items-center gap-1'>
                              <FileText className='w-3 h-3' />
                              {notebook.qa.length} {notebook.qa.length === 1 ? 'item' : 'items'}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              Updated recently
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotebookId(notebook._id);
                            setShowQAModal(true);
                          }}
                          className='group flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200'
                          title='Add new Q&A'
                        >
                          <Plus className='w-4 h-4 group-hover:rotate-90 transition-transform duration-200' />
                          <span className='hidden sm:inline'>Add Q&A</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotebook(notebook._id);
                          }}
                          className='group flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200'
                          title='Delete notebook'
                        >
                          <Trash2 className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToPdf(notebook);
                          }}
                          disabled={isLoading}
                          className={`group flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 rounded-lg ${
                            isLoading 
                              ? 'text-gray-500 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                          }`}
                          title='Export to PDF'
                        >
                          {isLoading ? (
                            <Zap className='w-4 h-4 animate-pulse' />
                          ) : (
                            <Download className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                          )}
                        </button>
                        <div className='ml-2'>
                          {expandedNotebookId === notebook._id ? (
                            <ChevronUp className='w-5 h-5 text-gray-400' />
                          ) : (
                            <ChevronDown className='w-5 h-5 text-gray-400' />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedNotebookId === notebook._id && (
                    <div className='border-t border-gray-700'>
                      {notebook.qa.length === 0 ? (
                        <div className='p-8 text-center'>
                          <div className='flex flex-col items-center gap-4'>
                            <div className='w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/30'>
                              <Code2 className='w-8 h-8 text-purple-400' />
                            </div>
                            <div>
                              <h3 className='text-lg font-semibold text-gray-300 mb-2'>No Q&As yet</h3>
                              <p className='text-gray-500 text-sm'>Start adding your code solutions and questions to build your knowledge base</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedNotebookId(notebook._id);
                                setShowQAModal(true);
                              }}
                              className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg transition-all duration-200 text-white text-sm font-medium'
                            >
                              <Plus className='w-4 h-4' />
                              Add First Q&A
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className='p-6 space-y-4'>
                          {notebook.qa.map((qa, qaIndex) => (
                            <div
                              key={qa._id}
                              className='group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/30 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 opacity-100 animate-fadeIn'
                              style={{ 
                                animationDelay: `${qaIndex * 0.1}s`
                              }}
                            >
                              {/* Q&A Header */}
                              <div className='flex items-start justify-between mb-4'>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
                                    <span className='text-xs font-medium text-purple-400 uppercase tracking-wider'>Question</span>
                                  </div>
                                  <h4 className='text-lg font-semibold text-white leading-relaxed'>
                                    {qa.question}
                                  </h4>
                                </div>
                                <button
                                  onClick={() => deleteQA(qa._id)}
                                  className='group/btn flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
                                  title='Delete Q&A'
                                >
                                  <Trash2 className='w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200' />
                                </button>
                              </div>

                              {/* Code Section */}
                              <div className='bg-gray-900/80 border border-gray-700/50 rounded-lg overflow-hidden'>
                                <div className='flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700/50'>
                                  <div className='flex items-center gap-2'>
                                    <Code2 className='w-4 h-4 text-emerald-400' />
                                    <span className='text-sm font-medium text-emerald-400 capitalize'>
                                      {qa.language}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(qa.code)}
                                    className='group/copy flex items-center gap-2 px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-md transition-all duration-200'
                                    title='Copy code'
                                  >
                                    <Copy className='w-3 h-3 group-hover/copy:scale-110 transition-transform duration-200' />
                                    <span>Copy</span>
                                  </button>
                                </div>
                                <div className='p-4'>
                                  <pre className='text-sm font-mono text-gray-100 overflow-x-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 whitespace-pre-wrap break-words'>
                                    {qa.code}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Notebook Modal */}
      {showNotebookModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden'>
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-4 border-b border-gray-700/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                    <BookOpen className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-xl font-bold text-white'>Create New Notebook</h2>
                </div>
                <button
                  onClick={() => setShowNotebookModal(false)}
                  className='group flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200'
                >
                  <X className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className='p-6'>
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Notebook Name
                </label>
                <input
                  type='text'
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder='Enter notebook name...'
                  className='w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200'
                  autoFocus
                />
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setShowNotebookModal(false)}
                  className='flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200'
                >
                  Cancel
                </button>
                <button
                  onClick={createNotebook}
                  className='flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg'
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create QA Modal */}
      {showQAModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700/50 overflow-hidden max-h-[90vh] flex flex-col'>
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-6 py-4 border-b border-gray-700/50 flex-shrink-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center'>
                    <Code2 className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-xl font-bold text-white'>Add New Q&A</h2>
                </div>
                <button
                  onClick={() => setShowQAModal(false)}
                  className='group flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200'
                >
                  <X className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600'>
              <div className='p-6 space-y-6'>
                {/* Question Field */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-300 mb-3'>
                    <Lightbulb className='w-4 h-4 text-yellow-400' />
                    Question
                  </label>
                  <input
                    type='text'
                    value={newQA.question}
                    onChange={(e) =>
                      setNewQA({ ...newQA, question: e.target.value })
                    }
                    placeholder='What problem does this code solve?'
                    className='w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200'
                  />
                </div>

                {/* Language Field */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-300 mb-3'>
                    <Code2 className='w-4 h-4 text-emerald-400' />
                    Programming Language
                  </label>
                  <select
                    value={newQA.language}
                    onChange={(e) =>
                      setNewQA({ ...newQA, language: e.target.value })
                    }
                    className='w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200'
                  >
                    <option value=''>Select Language</option>
                    <option value='python'>Python</option>
                    <option value='javascript'>JavaScript</option>
                    <option value='typescript'>TypeScript</option>
                    <option value='java'>Java</option>
                    <option value='cpp'>C++</option>
                    <option value='c'>C</option>
                    <option value='go'>Go</option>
                    <option value='rust'>Rust</option>
                    <option value='php'>PHP</option>
                    <option value='ruby'>Ruby</option>
                  </select>
                </div>

                {/* Code Field */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-300 mb-3'>
                    <FileText className='w-4 h-4 text-blue-400' />
                    Code Solution
                  </label>
                  <div className='relative'>
                    <textarea
                      value={newQA.code}
                      onChange={(e) => setNewQA({ ...newQA, code: e.target.value })}
                      placeholder={`// Write your ${newQA.language || 'code'} solution here...\n\nfunction example() {\n    // Your implementation\n}`}
                      className='w-full h-48 p-4 bg-gray-900/50 border border-gray-600/50 rounded-lg text-gray-100 font-mono text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600'
                    />
                    <div className='absolute bottom-3 right-3 text-xs text-gray-500'>
                      {newQA.code.length} characters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 bg-gray-800/50 border-t border-gray-700/50 flex-shrink-0'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setShowQAModal(false)}
                  className='flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200'
                >
                  Cancel
                </button>
                <button
                  onClick={createQA}
                  disabled={!newQA.question || !newQA.language || !newQA.code}
                  className='flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg'
                >
                  Create Q&A
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notebooks;
