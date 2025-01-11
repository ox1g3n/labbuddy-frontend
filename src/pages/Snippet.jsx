import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClipboard, FaTrash, FaChevronLeft, FaCode, FaPlus, FaSearch } from 'react-icons/fa';

const Snippet = () => {
    const BASE_URL=import.meta.env.VITE_BASE_URL;
    const [snippets, setSnippets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSnippets = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}api/snippets`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setSnippets(response.data.snippets);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching snippets');
                setLoading(false);
            }
        };

        fetchSnippets();
    }, []);

    const deleteSnippet = async (snippetId) => {
        if (!window.confirm('Are you sure you want to delete this snippet?')) return;
        
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
        navigator.clipboard.writeText(code)
            .then(() => alert('Copied to clipboard!'))
            .catch((err) => console.error('Failed to copy: ', err));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-blue-400 animate-pulse">Loading snippets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-red-400">Error: {error}</div>
            </div>
        );
    }

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
                            Code Snippets
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        <FaPlus />
                        <span>New Snippet</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search snippets by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
                        />
                    </div>
                </div>

                {/* Content Section */}
                {snippets.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <FaCode className="text-6xl mx-auto mb-4" />
                        <p className="text-xl">No snippets found. Create your first snippet!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {snippets
                            .filter(snippet => 
                                snippet.name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((snippet) => (
                                <div
                                    key={snippet._id}
                                    className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-semibold text-blue-400">
                                                {snippet.name}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => copyToClipboard(snippet.code)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                                                    title="Copy to clipboard"
                                                >
                                                    <FaClipboard className="text-gray-400 hover:text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => deleteSnippet(snippet._id)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                                                    title="Delete snippet"
                                                >
                                                    <FaTrash className="text-red-400 hover:text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-700">
                                                {snippet.code}
                                            </pre>
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
