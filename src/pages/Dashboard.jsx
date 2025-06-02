import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { 
  Terminal, Sparkles, Play, BookOpen,
  ArrowRight, Save, Bot, MessageSquare, LogOut, Settings,
  Monitor, FileCode, Lightbulb, Rocket, Database, Cpu
} from 'lucide-react';
import api from '../utils/api';
import { logoutAllTabs } from '../utils/storageSync';

function Dashboard() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const [question, setQuestion] = useState('');
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState('');
  const [templates, setTemplates] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAction, setAiAction] = useState('suggestion');
  const [aiResponse, setAiResponse] = useState('');

  // Fetch code templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get('api/snippets/templates');
      setTemplates(response.data.templates);
      // Set initial code template if code is empty
      if (!code && response.data.templates[language]) {
        setCode(response.data.templates[language].code);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [language, code]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Effect to handle initial template loading and language changes
  useEffect(() => {
    if (templates[language] && !code.trim()) {
      setCode(templates[language].code);
    }
  }, [templates, language, code]);

  const isNestedRouteActive =
    location.pathname.startsWith('/dashboard/') &&
    location.pathname !== '/dashboard' &&
    location.pathname !== '/dashboard/';

  const fetchNotebooks = useCallback(async () => {
    try {
      const response = await api.get('api/notebooks');
      setNotebooks(response.data.notebooks || []);
    } catch (error) {
      console.error(
        'Error fetching notebooks:',
        error.response?.data?.message || error.message
      );
    }
  }, []);

  useEffect(() => {
    if (showNotebookModal) {
      fetchNotebooks();
    }
  }, [showNotebookModal, fetchNotebooks]);

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    // Only load template if code is empty or user confirms the change
    if (
      !code.trim() ||
      window.confirm(
        'Do you want to load the template for the new language? This will replace your current code.'
      )
    ) {
      if (templates[newLanguage]) {
        setCode(templates[newLanguage].code);
      }
    }
  };

  const handleAiAction = async () => {
    if (!code.trim()) {
      alert('Code editor is empty. Please write some code.');
      return;
    }
    const toastId = toast.loading('Ai help on the way...');
    try {
      const apiEndpoint =
        aiAction === 'suggestion'
          ? 'api/gemini/suggestions'
          : aiAction === 'complexity'
            ? 'api/gemini/complexity'
            : 'api/gemini/testcases';

      const response = await api.post(apiEndpoint, { code });

      let formattedResponse;
      if (Array.isArray(response.data.response)) {
        formattedResponse = response.data.response
          .map(
            (testCase, index) =>
              `Test Case ${index + 1}:\n${testCase.replace(/\n/g, ' ')}`
          )
          .join('\n\n');
      } else {
        formattedResponse = response.data.response || 'No response received.';
      }

      setAiResponse(formattedResponse);
      toast.dismiss(toastId);
      toast.success('Ai help arrived');
    } catch (err) {
      console.error(
        'Error during API call:',
        err.response?.data || err.message
      );
      setAiResponse(
        err.response?.data?.message || 'Error while fetching response.'
      );
      toast.dismiss(toastId);
      toast.error(err.response?.data);
    }
  };

  const handleSaveSuggestion = async () => {
    if (!aiResponse.trim() || !code.trim()) {
      alert('No suggestion or code to save.');
      return;
    }

    try {
      await api.post('api/suggestions/create', {
        code: code,
        suggestion: aiResponse,
      });
      alert('Suggestion saved successfully!');
    } catch (error) {
      console.error(
        'Error saving suggestion:',
        error.response?.data?.message || error.message
      );
      alert('Failed to save suggestion. Please try again.');
    }
  };

  const handleRun = async () => {
    setOutput('');
    setError('');
    try {
      const response = await api.post('api/code/run', {
        language,
        code,
        input: userInput,
      });
      setOutput(response.data.output);
    } catch (err) {
      console.error('Code execution error:', err.response?.data || err);
      // Use the specific error message from the server if available
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Something went wrong'
      );
      setOutput('');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('api/auth/logout');
      logoutAllTabs();
      navigate('/');
    } catch (error) {
      console.error(
        'Error logging out:',
        error.response?.data?.message || error.message
      );
    }
  };

  const handleSnippetSave = async () => {
    try {
      await api.post('api/snippets/create', {
        name: snippetName,
        code,
        language,
      });
      setShowSnippetModal(false);
      setSnippetName('');
      alert('Snippet saved successfully!');
    } catch (error) {
      console.error(
        'Error saving snippet:',
        error.response?.data?.message || error.message
      );
      alert('Failed to save snippet. Please try again.');
    }
  };

  const handleSaveQA = async () => {
    if (!selectedNotebook || !question.trim()) {
      alert('Please fill in all fields and select a notebook.');
      return;
    }

    try {
      await api.post('api/qa/createQA', {
        question,
        code,
        language,
        nbid: selectedNotebook,
      });
      setShowNotebookModal(false);
      setQuestion('');
      setSelectedNotebook('');
      alert('QA saved successfully!');
    } catch (error) {
      console.error(
        'Error saving QA:',
        error.response?.data?.message || error.message
      );
      alert('Failed to save QA. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-slate-900 overflow-hidden relative'>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
            `
          }}></div>
        </div>
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Floating Code Elements */}
      {[
        { symbol: '{', x: 5, y: 10, delay: 0 },
        { symbol: '}', x: 90, y: 15, delay: 1 },
        { symbol: '<>', x: 10, y: 80, delay: 2 },
        { symbol: '()', x: 85, y: 75, delay: 3 },
        { symbol: '[]', x: 45, y: 5, delay: 4 },
        { symbol: ';', x: 95, y: 45, delay: 5 },
      ].map((element, index) => (
        <div
          key={index}
          className="absolute text-purple-300/20 text-xl font-mono pointer-events-none select-none animate-pulse"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            transform: `translateY(${Math.sin(Date.now() * 0.001 + element.delay) * 10}px)`
          }}
        >
          {element.symbol}
        </div>
      ))}

      <div className='flex h-screen relative z-10'>
        {/* Sidebar */}
        <div className='w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 text-white flex flex-col justify-between shadow-2xl'>
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <Terminal className="w-10 h-10 text-purple-400" />
                <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 
                className="text-3xl font-black text-white cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate('/dashboard')}
              >
                <span className="text-purple-400">Lab</span>Buddy
              </h1>
            </div>

            {/* Navigation */}
            <nav className='space-y-3'>
              {[
                { icon: Monitor, label: 'Dashboard', path: '/dashboard', color: 'text-blue-400', bgHover: 'hover:bg-blue-500/10' },
                { icon: FileCode, label: 'Snippets', path: '/snippets', color: 'text-emerald-400', bgHover: 'hover:bg-emerald-500/10' },
                { icon: BookOpen, label: 'Notebooks', path: '/notebooks', color: 'text-purple-400', bgHover: 'hover:bg-purple-500/10' },
                { icon: Lightbulb, label: 'Suggestions', path: '/suggestions', color: 'text-yellow-400', bgHover: 'hover:bg-yellow-500/10' },
                { icon: MessageSquare, label: 'Group Chat', path: '/dashboard/chat', color: 'text-cyan-400', bgHover: 'hover:bg-cyan-500/10' },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 rounded-xl ${item.bgHover} cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group border border-transparent hover:border-white/10`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors duration-300">{item.label}</span>
                  </div>
                </div>
              ))}
            </nav>

            {/* Status Card */}
            <div className="mt-8 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-300">System Status</span>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>AI Assistant</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Code Runner</span>
                  <span className="text-green-400">Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Collaboration</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className='w-full px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group border border-red-500/20 hover:border-red-500/40'
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm h-screen overflow-hidden'>
          {isNestedRouteActive ? (
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Rocket className="w-7 h-7 text-purple-400" />
                      Code Playground
                    </h2>
                    <p className="text-slate-400 mt-1">Write, run, and collaborate on code in real-time</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                      <span className="text-sm text-slate-300">Language:</span>
                      <select
                        value={language}
                        onChange={handleLanguageChange}
                        className='ml-2 bg-transparent text-purple-400 font-medium focus:outline-none cursor-pointer'
                      >
                        <option value='python' className="bg-slate-800">Python</option>
                        <option value='javascript' className="bg-slate-800">JavaScript</option>
                        <option value='java' className="bg-slate-800">Java</option>
                        <option value='cpp' className="bg-slate-800">C++</option>
                        <option value='c' className="bg-slate-800">C</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Editor Section */}
              <div className='flex-1 flex flex-col min-h-0 p-6 gap-4 overflow-y-auto'>
                {/* Editor */}
                <div className='flex-1 min-h-[400px] max-h-[60vh] bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden'>
                  <div className="flex items-center gap-2 p-4 border-b border-white/10">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-slate-400 text-sm ml-3 font-mono">main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : 'c'}</span>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Cpu className="w-4 h-4" />
                      <span>Ready to execute</span>
                    </div>
                  </div>
                  <div className="h-[calc(100%-4rem)] overflow-scroll">
                    <Editor
                      height='100%'
                      language={language}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme='vs-dark'
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 20, bottom: 20 },
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        lineHeight: 1.6,
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        automaticLayout: true,
                        scrollbar: {
                          vertical: 'visible',
                          horizontal: 'visible',
                          verticalScrollbarSize: 8,
                          horizontalScrollbarSize: 8,
                        },
                        wordWrap: 'on',
                        overviewRulerLanes: 0,
                      }}
                    />
                  </div>
                </div>

                {/* Input Section */}
                <div className='flex-shrink-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl'>
                  <label className='mb-3 text-slate-300 font-medium flex items-center gap-2'>
                    <Settings className="w-4 h-4 text-blue-400" />
                    Program Input (Optional)
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className='w-full h-20 p-4 bg-slate-800/50 border border-slate-600/50 text-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-300 placeholder-slate-500'
                    placeholder='Enter input data for your program...'
                  />
                </div>

                {/* Action Buttons */}
                <div className='flex-shrink-0 flex flex-wrap gap-4 justify-center'>
                  <button
                    onClick={handleRun}
                    className='px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 flex items-center space-x-3 group'
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Execute Code</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  
                  <button
                    onClick={() => setShowAiModal(true)}
                    className='px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 flex items-center space-x-3 group'
                  >
                    <Bot className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>AI Assistant</span>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                  
                  <button
                    onClick={() => setShowSnippetModal(true)}
                    className='px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 flex items-center space-x-3 group'
                  >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Save Snippet</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      fetchNotebooks();
                      setShowNotebookModal(true);
                    }}
                    className='px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/25 flex items-center space-x-3 group'
                  >
                    <Database className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Save to Notebook</span>
                  </button>
                </div>

                {/* Output Section */}
                <div className='flex-shrink-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl'>
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <h3 className='text-slate-300 font-medium'>Program Output</h3>
                    <div className="flex-1"></div>
                    <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : output ? 'bg-green-400' : 'bg-slate-500'} animate-pulse`}></div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                    <pre
                      className={`p-4 overflow-auto whitespace-pre-wrap break-words font-mono text-sm ${error ? 'text-red-400' : 'text-slate-300'} h-32 max-h-32`}
                    >
                      {error || output || (
                        <span className="text-slate-500 italic">
                          {'>'} Program output will appear here...
                          {'\n'}{'>'} Click &quot;Execute Code&quot; to run your program
                        </span>
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snippet Save Modal */}
      {showSnippetModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
          <div className='bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 relative overflow-hidden'>
            {/* Accent gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Save className="w-6 h-6 text-emerald-400" />
                <h2 className='text-2xl font-bold text-white'>Save Code Snippet</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Snippet Name</label>
                  <input
                    type='text'
                    value={snippetName}
                    onChange={(e) => setSnippetName(e.target.value)}
                    placeholder='Enter a descriptive name...'
                    className='w-full p-4 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-slate-400'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Code Preview</label>
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 p-3 border-b border-slate-600/50 bg-slate-900/50">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-slate-400 text-sm ml-2 font-mono">{language}</span>
                    </div>
                    <textarea
                      value={code}
                      readOnly
                      className='w-full p-4 bg-transparent text-slate-300 h-32 resize-none font-mono text-sm'
                    />
                  </div>
                </div>
              </div>
              
              <div className='flex justify-end space-x-4 mt-8'>
                <button
                  className='px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-all duration-300 border border-slate-600/50'
                  onClick={() => setShowSnippetModal(false)}
                >
                  Cancel
                </button>
                <button
                  className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2'
                  onClick={handleSnippetSave}
                >
                  <Save className="w-4 h-4" />
                  Save Snippet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notebook QA Modal */}
      {showNotebookModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
          <div className='bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 relative overflow-hidden'>
            {/* Accent gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-yellow-400" />
                <h2 className='text-2xl font-bold text-white'>Save to Notebook</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Question/Description</label>
                  <input
                    type='text'
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder='What does this code solve?'
                    className='w-full p-4 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-slate-400'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Notebook</label>
                  <select
                    value={selectedNotebook}
                    onChange={(e) => setSelectedNotebook(e.target.value)}
                    className='w-full p-4 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm'
                  >
                    <option value='' className="bg-slate-800">Choose a notebook...</option>
                    {notebooks.map((notebook) => (
                      <option
                        key={notebook._id}
                        value={notebook._id}
                        className='bg-slate-800'
                      >
                        {notebook.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Code Preview</label>
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 p-3 border-b border-slate-600/50 bg-slate-900/50">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-slate-400 text-sm ml-2 font-mono">{language}</span>
                    </div>
                    <textarea
                      value={code}
                      readOnly
                      className='w-full p-4 bg-transparent text-slate-300 h-32 resize-none font-mono text-sm'
                    />
                  </div>
                </div>
              </div>
              
              <div className='flex justify-end space-x-4 mt-8'>
                <button
                  className='px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-all duration-300 border border-slate-600/50'
                  onClick={() => setShowNotebookModal(false)}
                >
                  Cancel
                </button>
                <button
                  className='px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2'
                  onClick={handleSaveQA}
                >
                  <Database className="w-4 h-4" />
                  Save to Notebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
          <div className='bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] border border-white/20 relative overflow-hidden flex flex-col'>
            {/* Accent gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <Bot className="w-6 h-6 text-purple-400" />
                <h2 className='text-2xl font-bold text-white'>AI Code Assistant</h2>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              
              <div className="flex-shrink-0 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Choose AI Action</label>
                  <select
                    value={aiAction}
                    onChange={(e) => setAiAction(e.target.value)}
                    className='w-full p-4 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm'
                  >
                    <option value='suggestion' className="bg-slate-800">💡 Get Code Suggestions</option>
                    <option value='complexity' className="bg-slate-800">📊 Analyze Code Complexity</option>
                    <option value='testcases' className="bg-slate-800">🧪 Generate Test Cases</option>
                  </select>
                </div>
              </div>
              
              <div className='flex-1 flex flex-col min-h-0'>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex-shrink-0">AI Response</label>
                <div className='bg-slate-800/50 border border-slate-600/50 rounded-xl p-6 flex-1 overflow-y-auto min-h-0'>
                  <div className='prose prose-invert max-w-none'>
                    {aiResponse ? (
                      <ReactMarkdown
                        className='text-slate-200'
                        components={{
                          p: ({ ...props }) => (
                            <p className='mb-4 leading-relaxed' {...props} />
                          ),
                          pre: ({ ...props }) => (
                            <pre
                              className='bg-slate-900/80 p-4 rounded-lg overflow-x-auto mb-4 whitespace-pre-wrap border border-slate-700'
                              {...props}
                            />
                          ),
                          code: ({ inline, ...props }) =>
                            inline ? (
                              <code
                                className='bg-slate-700 px-2 py-1 rounded text-purple-300 font-mono text-sm'
                                {...props}
                              />
                            ) : (
                              <code
                                className='block text-sm font-mono text-slate-200'
                                {...props}
                              />
                            ),
                        }}
                      >
                        {aiResponse}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[16rem] text-center">
                        <Bot className="w-16 h-16 text-slate-500 mb-4" />
                        <p className="text-slate-400 text-lg">Ready to assist you!</p>
                        <p className="text-slate-500 text-sm">Click &apos;Get AI Help&apos; to analyze your code</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className='flex justify-end space-x-4 mt-6 pt-6 border-t border-white/10 flex-shrink-0'>
                <button
                  className='px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-all duration-300 border border-slate-600/50'
                  onClick={() => setShowAiModal(false)}
                >
                  Close
                </button>
                <button
                  className='px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2'
                  onClick={handleAiAction}
                >
                  <Bot className="w-4 h-4" />
                  Get AI Help
                </button>
                <button
                  className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2'
                  onClick={handleSaveSuggestion}
                >
                  <Save className="w-4 h-4" />
                  Save Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
