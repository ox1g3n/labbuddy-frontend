import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SnippetModal from "./SnippetModal";

function SnippetList() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [snippets, setSnippets] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchSnippets = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}api/snippets/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnippets(response.data);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleSaveSnippet = async ({ name, code }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}api/snippets/create`,
        { name, code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSnippets([...snippets, response.data.snippets]);
    } catch (error) {
      console.error("Error saving snippet:", error.response?.data || error);
    }
  };

  // Implementation of handleDeleteSnippet function
  // const handleDeleteSnippet = async (id) => {
  // };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Snippets</h1>
      <ul className="mb-4">
        {snippets.map((snippet) => (
          <li key={snippet._id} className="p-2 border-b border-gray-300 mb-2">
            <h3 className="font-semibold">{snippet.name}</h3>
            <pre className="bg-gray-100 p-2 rounded">{snippet.code}</pre>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add New Snippet
      </button>
      <SnippetModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSnippet}
      />
    </div>
  );
}

export default SnippetList;
