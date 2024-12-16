import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notebooks = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [expandedNotebookId, setExpandedNotebookId] = useState(null);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newQA, setNewQA] = useState({ question: '', language: '', code: '' });
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);

  const authToken = localStorage.getItem('token');

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/notebooks/', {
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
        'http://localhost:5001/api/notebooks/create',
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
    try {
      await axios.post(
        'http://localhost:5001/api/notebooks/delete',
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
        'http://localhost:5001/api/qa/createQA',
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
    try {
      await axios.post(
        'http://localhost:5001/api/qa/delete',
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

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Notebooks</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Dashboard
        </button>
      </div>

      <div className="space-y-4">
        {notebooks.map((notebook) => (
          <div
            key={notebook._id}
            className="bg-white shadow-md rounded-md p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => toggleNotebook(notebook._id)}
                >
                  {expandedNotebookId === notebook._id ? '▼' : '►'}
                </button>
                <h2 className="text-lg font-medium">{notebook.name}</h2>
              </div>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => deleteNotebook(notebook._id)}
              >
                Delete
              </button>
            </div>

            {/* QA List */}
            {expandedNotebookId === notebook._id && (
              <div className="space-y-2 pl-6">
                {notebook.qa.length > 0 ? (
                  notebook.qa.map((qa) => (
                    <div
                      key={qa._id}
                      className="flex justify-between items-center bg-gray-100 rounded-md px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          <span className="font-bold">Q:</span> {qa.question}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Code:</span> {qa.code}
                        </p>
                      </div>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700"
                        onClick={() => deleteQA(qa._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 italic">No QAs available.</p>
                )}
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  onClick={() => {
                    setSelectedNotebookId(notebook._id);
                    setShowQAModal(true);
                  }}
                >
                  Add QA
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Plus Button */}
      <button
        className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700"
        onClick={() => setShowNotebookModal(true)}
      >
        +
      </button>

      {/* Modal for Adding Notebook */}
      {showNotebookModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-80 space-y-4">
            <h2 className="text-lg font-bold">Add New Notebook</h2>
            <input
              type="text"
              placeholder="Enter notebook name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setShowNotebookModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                onClick={createNotebook}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding QA */}
      {showQAModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-80 space-y-4">
            <h2 className="text-lg font-bold">Add New QA</h2>
            <input
              type="text"
              placeholder="Enter question"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newQA.question}
              onChange={(e) =>
                setNewQA({ ...newQA, question: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Enter programming language"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newQA.language}
              onChange={(e) =>
                setNewQA({ ...newQA, language: e.target.value })
              }
            />
            <textarea
              placeholder="Enter code snippet"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newQA.code}
              onChange={(e) =>
                setNewQA({ ...newQA, code: e.target.value })
              }
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setShowQAModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                onClick={createQA}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebooks;
