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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-center text-2xl font-bold py-4">LabBuddy</h2>
          <ul>
            <li
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/snippets")}
            >
              Snippets
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/notebooks")}
            >
              Notebooks
            </li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
            onClick={()=>navigate("/suggestions")}>
              Suggestions
            </li>
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 m-4 rounded self-start"
        >
          Logout
        </button>
      </div>

      {/* Main Area */}
      <div className="w-4/5 flex flex-col">
        <Editor
          height="60%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          className="border-b"
        />

        <div className="p-4">
          <label className="block mb-2 font-semibold">Input (Optional):</label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full h-20 p-2 border rounded"
            placeholder="Enter input for the program..."
          ></textarea>
        </div>

        <div className="p-4 flex justify-between">
          <div>
            <label className="mr-2">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleRun}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Run
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowAiModal(true)}>
              Get AI Help
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              onClick={() => setShowSnippetModal(true)}
            >
              Save Snippet
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              onClick={() => setShowNotebookModal(true)}
            >
              Save in Notebook
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-100 border-t">
          <h3 className="font-bold">Output:</h3>
          <pre
            className="bg-white p-2 mt-2 border rounded overflow-auto whitespace-pre-wrap break-words"
            style={{ maxHeight: "200px" }}
          >
            {output || error}
          </pre>
        </div>
      </div>

      {/*snippet modal*/}
      {showSnippetModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Save Snippet</h2>
            <input
              type="text"
              value={snippetName}
              onChange={(e) => setSnippetName(e.target.value)}
              placeholder="Snippet Name"
              className="w-full p-2 border rounded mb-4"
            />
            <textarea
              value={code}
              readOnly
              className="w-full p-2 border rounded h-32 mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowSnippetModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSnippetSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )} 
      {/* Notebook Modal */}
      {showNotebookModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Save QA to Notebook</h2>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="w-full p-2 border rounded mb-4"
            />
            <select
              value={selectedNotebook}
              onChange={(e) => setSelectedNotebook(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Notebook</option>
              {notebooks.map((notebook) => (
                <option key={notebook._id} value={notebook._id}>
                  {notebook.name}
                </option>
              ))}
            </select>
            <textarea
              value={code}
              readOnly
              className="w-full p-2 border rounded h-32 mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowNotebookModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSaveQA}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showAiModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/5 h-4/5 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Get AI Help</h2>
            <select
              value={aiAction}
              onChange={(e) => setAiAction(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="suggestion">Get Code Suggestion</option>
              <option value="complexity">Get Code Complexity</option>
              <option value="testcases">Generate Test Cases</option>
            </select>
            <textarea
              value={aiResponse}
              readOnly
              className="w-full h-4/5 p-2 border rounded"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowAiModal(false)}
              >
                Close
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAiAction}
              >
                Fetch AI Response
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mx-2"
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
