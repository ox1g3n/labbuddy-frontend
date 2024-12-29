import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import {toast} from "react-hot-toast";
function Dashboard() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [snippetName, setSnippetName] = useState("");
  const [question, setQuestion] = useState(""); // Question for the QA
  const [notebooks, setNotebooks] = useState([]); // List of notebooks
  const [selectedNotebook, setSelectedNotebook] = useState(""); // Selected notebook
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false); // For AI modal
  const [aiAction, setAiAction] = useState("suggestion"); // Dropdown option
  const [aiResponse, setAiResponse] = useState(""); // Response from API
  // Fetch notebooks on component mount or when the modal opens
  useEffect(() => {
    if (showNotebookModal) {
      fetchNotebooks();
    }
  }, [showNotebookModal]);

  const fetchNotebooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/notebooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotebooks(response.data.notebooks || []);
    } catch (error) {
      console.error("Error fetching notebooks:", error.response?.data?.message || error.message);
    }
  };
   
  const handleAiAction = async () => {
    if (!code.trim()) {
      alert("Code editor is empty. Please write some code.");
      return;
    }
    const toastId=toast.loading("Ai help on the way...");
    try {
      const token = localStorage.getItem("token");
      console.log("Token being sent to Gemini API:", token);
  
      const apiEndpoint =
        aiAction === "suggestion"
          ? "http://localhost:5001/api/gemini/suggestions"
          : aiAction === "complexity"
          ? "http://localhost:5001/api/gemini/complexity"
          : "http://localhost:5001/api/gemini/testcases";
  
      const response = await axios.post(
        apiEndpoint,
        { code },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      let formattedResponse;
      if (Array.isArray(response.data.response)) {
        // Remove unnecessary newline characters and join cases
        formattedResponse = response.data.response
          .map((testCase, index) => `Test Case ${index + 1}:\n${testCase.replace(/\n/g, ' ')}`)
          .join("\n\n");
      } else {
        formattedResponse = response.data.response || "No response received.";
      }
  
      setAiResponse(formattedResponse);
      toast.dismiss(toastId);
      toast.success("Ai help arrived");
    } catch (err) {
      console.error("Error during API call:", err.response?.data || err.message);
      setAiResponse(err.response?.data?.message || "Error while fetching response.");
      toast.dismiss(toastId);
      toast.error(err.response?.data);
    }
    
  };
  

 // Function to save the suggestion
const handleSaveSuggestion = async () => {
  if (!aiResponse.trim()||!code.trim()) {
    alert("No suggestion or code to save.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    // Replace the URL with the endpoint for saving suggestions
    await axios.post(
      "http://localhost:5001/api/suggestions/create",
      { code: code,
        suggestion: aiResponse },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Suggestion saved successfully!");
  } catch (error) {
    console.error("Error saving suggestion:", error.response?.data?.message || error.message);
    alert("Failed to save suggestion. Please try again.");
  }
};
 

  const handleRun = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/code/run",
        { language, code, input: userInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOutput(response.data.output);
    } catch (error) {
      console.error(error.response?.data?.message || "Error running code");
      setOutput(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5001/api/auth/logout");
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error(
        "Error logging out:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleSnippetSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/snippets/create",
        { name: snippetName, code, language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowSnippetModal(false);
      setSnippetName("");
      alert("Snippet saved successfully!");
    } catch (error) {
      console.error("Error saving snippet:", error.response?.data?.message || error.message);
      alert("Failed to save snippet. Please try again.");
    }
  };

  const handleSaveQA = async () => {
    if (!selectedNotebook || !question.trim()) {
      alert("Please fill in all fields and select a notebook.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/qa/createQA",
        { question, code, language, nbid: selectedNotebook },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowNotebookModal(false);
      setQuestion("");
      setSelectedNotebook("");
      alert("QA saved successfully!");
    } catch (error) {
      console.error("Error saving QA:", error.response?.data?.message || error.message);
      alert("Failed to save QA. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-1/5 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col justify-between border-r border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-bold py-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            LabBuddy
          </h2>
          <ul className="mt-8 space-y-2">
            <li
              className="px-6 py-3 mx-4 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all duration-300 flex items-center space-x-2"
              onClick={() => navigate("/snippets")}
            >
              <span className="text-blue-400">📚</span>
              <span>Snippets</span>
            </li>
            <li
              className="px-6 py-3 mx-4 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all duration-300 flex items-center space-x-2"
              onClick={() => navigate("/notebooks")}
            >
              <span className="text-purple-400">📓</span>
              <span>Notebooks</span>
            </li>
            <li 
              className="px-6 py-3 mx-4 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all duration-300 flex items-center space-x-2"
              onClick={() => navigate("/suggestions")}
            >
              <span className="text-green-400">💡</span>
              <span>Suggestions</span>
            </li>
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="m-4 px-6 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Area */}
      <div className="w-4/5 flex flex-col bg-gray-900">
        <div className="h-[60%] border-b border-gray-700">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 10 }
            }}
          />
        </div>

        <div className="p-6 bg-gray-800/50">
          <label className="block mb-2 text-gray-300 font-medium">Input (Optional):</label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter input for the program..."
          ></textarea>
        </div>

        <div className="p-6 flex justify-between items-center bg-gray-800/30">
          <div className="flex items-center space-x-4">
            <label className="text-gray-300">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 text-gray-300 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRun}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-2"
            >
              <span>▶️</span>
              <span>Run</span>
            </button>
            <button 
              onClick={() => setShowAiModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>AI Help</span>
            </button>
            <button
              onClick={() => setShowSnippetModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-2"
            >
              <span>💾</span>
              <span>Save Snippet</span>
            </button>
            <button
              onClick={() => setShowNotebookModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-2"
            >
              <span>📓</span>
              <span>Save in Notebook</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-800/10">
          <h3 className="text-gray-300 font-medium mb-2">Output:</h3>
          <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words border border-gray-700" style={{ maxHeight: "200px" }}>
            {output || error}
          </pre>
        </div>
      </div>

      {/* Modals with enhanced UI */}
      {showSnippetModal && (
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
              readOnly
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 h-32 mb-6"
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
                onClick={() => setShowSnippetModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                onClick={handleSnippetSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotebookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-1/3 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Save QA to Notebook</h2>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={selectedNotebook}
              onChange={(e) => setSelectedNotebook(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Notebook</option>
              {notebooks.map((notebook) => (
                <option key={notebook._id} value={notebook._id} className="bg-gray-800">
                  {notebook.name}
                </option>
              ))}
            </select>
            <textarea
              value={code}
              readOnly
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 h-32 mb-6"
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
                onClick={() => setShowNotebookModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                onClick={handleSaveQA}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-3/5 h-4/5 border border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Get AI Help</h2>
            <select
              value={aiAction}
              onChange={(e) => setAiAction(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="suggestion">Get Code Suggestion</option>
              <option value="complexity">Get Code Complexity</option>
              <option value="testcases">Generate Test Cases</option>
            </select>
            <div className="flex-1 mb-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg h-full p-4 overflow-auto">
                <ReactMarkdown className="text-gray-200 prose prose-invert max-w-none">
                  {aiResponse || "AI response will appear here..."}
                </ReactMarkdown>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
                onClick={() => setShowAiModal(false)}
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                onClick={handleAiAction}
              >
                Fetch AI Response
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                onClick={handleSaveSuggestion}
              >
                Save Suggestion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
