import { useState, useEffect } from 'react';
import { Code, Zap, Users, BookOpen, Play, Terminal, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const features = [
    { icon: Code, text: "Interactive Notebooks", color: "text-blue-400" },
    { icon: Zap, text: "AI-Powered Assistant", color: "text-yellow-400" },
    { icon: Users, text: "Real-time Collaboration", color: "text-green-400" },
    { icon: BookOpen, text: "Learn & Experiment", color: "text-purple-400" }
];

const elements = [
      { id: 1, symbol: '{', x: 10, y: 20, delay: 0 },
      { id: 2, symbol: '}', x: 85, y: 15, delay: 1 },
      { id: 3, symbol: '<>', x: 15, y: 70, delay: 2 },
      { id: 4, symbol: '()', x: 80, y: 75, delay: 3 },
      { id: 5, symbol: '[]', x: 50, y: 10, delay: 4 },
      { id: 6, symbol: ';', x: 90, y: 45, delay: 5 },
    ];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [floatingElements, setFloatingElements] = useState([]);
  const navigate=useNavigate();
  // Initialize floating code elements
  useEffect(() => {
    
    setFloatingElements(elements);

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

    // Check if user is already logged in
    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await api.get('api/auth/verify');
            navigate('/dashboard');
          } catch (err) {
            // Invalid token, we'll stay on login page
            console.error('Token verification failed:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('tokenTimestamp');
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      };
  
      checkAuth();
    }, [navigate]);

  const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await api.post('api/auth/login', {
          email,
          password,
        });
        if (response?.data?.token && response?.data?.user?._id) {
          // Store in localStorage for easy access on the client side
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.user._id);
          localStorage.setItem('userName', response.data.user.name);
          // Add timestamp to check token freshness
          localStorage.setItem('tokenTimestamp', Date.now().toString());
          navigate('/dashboard');
        } else {
          setError(response?.data?.message || 'Login failed: Invalid response.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && email && password) {
      handleLogin(e);
    }
  };

   

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative">
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
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute text-purple-300/30 text-2xl font-mono pointer-events-none select-none animate-pulse"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            transform: `translateY(${Math.sin(animationPhase + element.delay) * 10}px)`
          }}
        >
          {element.symbol}
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo with Animation */}
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="relative">
                  <Terminal className="w-12 h-12 text-purple-400" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-5xl lg:text-6xl font-black text-white">
                  <span className="text-purple-400">Lab</span>Buddy
                </h1>
              </div>
              <p className="text-xl text-slate-300 font-light max-w-md mx-auto lg:mx-0">
                Where coding becomes a collaborative adventure
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <feature.icon className={`w-6 h-6 ${feature.color} mx-auto mb-2`} />
                  <p className="text-sm text-slate-300 font-medium">{feature.text}</p>
                </div>
              ))}
            </div>

            {/* Animated Code Preview */}
            <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-slate-400 text-xs ml-2 font-mono">notebook.py</span>
              </div>
              <div className="font-mono text-sm space-y-1">
                <div className="text-purple-400">
                  <span className="text-slate-500"># </span>Welcome to LabBuddy!
                </div>
                <div>
                  <span className="text-blue-400">def</span>
                  <span className="text-white"> learn_together</span>
                  <span className="text-yellow-400">():</span>
                </div>
                <div className="pl-4">
                  <span className="text-green-400">"Code, collaborate, create!"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Subtle accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                  <p className="text-slate-400">Ready to continue your coding journey?</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="you@example.com"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl backdrop-blur-sm animate-pulse">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Coding
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-400">
                      New to LabBuddy?{' '}
                      <a
                        href="/signup"
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 cursor-pointer"
                      >
                        Join the adventure
                      </a>
                    </p>
                  </div>
                </div>

                {/* Demo Credentials Helper */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <p className="text-xs text-slate-400 text-center mb-2">🚀 Demo Credentials:</p>
                    <div className="text-xs font-mono text-center space-y-1">
                      <div className="text-purple-300 cursor-pointer hover:text-purple-200" onClick={() => setEmail('demo@labbuddy.com')}>
                        📧 demo@labbuddy.com
                      </div>
                      <div className="text-purple-300 cursor-pointer hover:text-purple-200" onClick={() => setPassword('demo123')}>
                        🔑 demo123
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-2">Click to fill fields</p>
                  </div>
                </div>

                {/* Social Features Preview */}
                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-all duration-200">
                    <Users className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">1.2k+ Coders</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-all duration-200">
                    <Code className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">50k+ Projects</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-all duration-200">
                    <Sparkles className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">AI Powered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;