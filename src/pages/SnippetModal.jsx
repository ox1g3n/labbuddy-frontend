import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

function SnippetModal({ isOpen, onClose, onSave, existingCode }) {
  const [snippetName, setSnippetName] = useState("");
  const [code, setCode] = useState(existingCode || "");

  useEffect(() => {
    setCode(existingCode || "");
  }, [existingCode]);

  const handleSave = () => {
    if (!snippetName.trim()) {
      alert("Please enter a snippet name.");
      return;
    }
    onSave({ name: snippetName, code });
    setSnippetName("");
    setCode("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-1/3 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-200">Save Snippet</h2>
        <input
          type="text"
          value={snippetName}
          onChange={(e) => setSnippetName(e.target.value)}
          placeholder="Snippet Name"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 h-32 mb-6"
          placeholder="Code"
        ></textarea>
        <div className="flex justify-end space-x-3">
          <button
            className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

SnippetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  existingCode: PropTypes.string,
};

export default SnippetModal;
