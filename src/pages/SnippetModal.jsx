import React, { useState } from "react";

function SnippetModal({ isOpen, onClose, onSave, existingCode }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(existingCode || "");

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a snippet name.");
      return;
    }
    onSave({ name, code });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Save Snippet</h2>
        <label className="block mb-2">Snippet Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter snippet name"
        />
        <label className="block mb-2">Code:</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-40 p-2 border rounded"
        ></textarea>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SnippetModal;
