import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaChevronLeft, FaTimes, FaCode, FaSearch, FaDownload } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const Notebooks = () => {
  const BASE_URL=import.meta.env.VITE_BASE_URL;
  const [notebooks, setNotebooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNotebookId, setExpandedNotebookId] = useState(null);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newQA, setNewQA] = useState({ question: '', language: '', code: '' });
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const navigate = useNavigate();

  const authToken = localStorage.getItem('token');

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/notebooks/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setNotebooks(response.data.notebooks);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    }
  };

  const createNotebook = async () => {
    if (!newNotebookName.trim()) return alert('Notebook name is required');
    try {
      await axios.post(
        `${BASE_URL}api/notebooks/create`,
        { name: newNotebookName },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
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
    if (!window.confirm('Are you sure you want to delete this notebook?')) return;
    
    try {
      await axios.post(
        `${BASE_URL}api/notebooks/delete`,
        { notebookId },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      fetchNotebooks();
    } catch (error) {
      console.error('Error deleting notebook:', error);
    }
  };

  const toggleNotebook = (notebookId) => {
    setExpandedNotebookId(notebookId === expandedNotebookId ? null : notebookId);
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
            Authorization: `Bearer ${authToken}`,
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
            Authorization: `Bearer ${authToken}`,
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
    // Create a temporary div for the content
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">${notebook.name}</h1>
        ${notebook.qa.map((qa, index) => `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">Question ${index + 1}: ${qa.question}</h3>
            <div style="margin-bottom: 10px;">
              <strong>Language:</strong> ${qa.language}
            </div>
            <div style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${qa.code}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `${notebook.name.replace(/\s+/g, '_')}_notebook.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(content).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 border border-gray-700"
            >
              <FaChevronLeft className="text-blue-400" />
              <span>Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Notebooks
            </h1>
          </div>
          <button
            onClick={() => setShowNotebookModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            <FaPlus />
            <span>New Notebook</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notebooks by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
            />
          </div>
        </div>

        {/* Content Section */}
        {notebooks.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
            <FaBook className="mx-auto text-4xl text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No notebooks found</p>
            <p className="text-gray-500 mt-2">Create your first notebook to start organizing your code</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {notebooks
              .filter((notebook) =>
                notebook.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((notebook) => (
                <div
                  key={notebook._id}
                  className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300"
                >
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700/30"
                    onClick={() => toggleNotebook(notebook._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <FaBook className="text-blue-400" />
                      <h3 className="text-lg font-semibold">{notebook.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({notebook.qa.length} {notebook.qa.length === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotebookId(notebook._id);
                          setShowQAModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors duration-300"
                      >
                        Add QA
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotebook(notebook._id);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToPdf(notebook);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                        title="Export to PDF"
                      >
                        <FaDownload />
                      </button>
                      {expandedNotebookId === notebook._id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>

                  {expandedNotebookId === notebook._id && (
                    <div className="border-t border-gray-700">
                      {notebook.qa.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          No QAs in this notebook yet
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {notebook.qa.map((qa) => (
                            <div key={qa._id} className="p-6 hover:bg-gray-700/30">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="text-lg font-medium text-blue-400">{qa.question}</h4>
                                <button
                                  onClick={() => deleteQA(qa._id)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <div className="mb-2 text-sm text-gray-500">Language: {qa.language}</div>
                                <pre className="text-sm font-mono overflow-x-auto">
                                  {qa.code}
                                </pre>
                                <button
                                  onClick={() => copyToClipboard(qa.code)}
                                  className="px-3 py-1 flex gap-2 items-center mt-8 text-sm bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors duration-300"
                                >
                                  <FaCode />
                                  Copy
                                </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-1/3 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-200">Create New Notebook</h2>
              <button
                onClick={() => setShowNotebookModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300"
              >
                <FaTimes className="text-gray-500 hover:text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              placeholder="Notebook Name"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNotebookModal(false)}
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={createNotebook}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create QA Modal */}
      {showQAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-2/3 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-200">Add New QA</h2>
              <button
                onClick={() => setShowQAModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300"
              >
                <FaTimes className="text-gray-500 hover:text-gray-400" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Question</label>
                <input
                  type="text"
                  value={newQA.question}
                  onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                  placeholder="Enter your question"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                <select
                  value={newQA.language}
                  onChange={(e) => setNewQA({ ...newQA, language: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Language</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Code</label>
                <textarea
                  value={newQA.code}
                  onChange={(e) => setNewQA({ ...newQA, code: e.target.value })}
                  placeholder="Enter your code"
                  className="w-full h-48 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowQAModal(false)}
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={createQA}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebooks;
