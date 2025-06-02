import { useState, useEffect } from 'react';
import { Code, Zap, Users, BookOpen, UserPlus, Terminal, Sparkles, ArrowRight, Rocket, Star, Heart } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';


const features = [
  { icon: Code, text: "Interactive Notebooks", color: "text-blue-400" },
  { icon: Zap, text: "AI-Powered Assistant", color: "text-yellow-400" },
  { icon: Users, text: "Real-time Collaboration", color: "text-green-400" },
  { icon: BookOpen, text: "Learn & Experiment", color: "text-purple-400" }
];

const floatingElements = [
  { id: 1, symbol: 'def', x: 5, y: 15, delay: 0 },
  { id: 2, symbol: 'class', x: 85, y: 20, delay: 1 },
  { id: 3, symbol: 'import', x: 10, y: 70, delay: 2 },
  { id: 4, symbol: 'return', x: 80, y: 75, delay: 3 },
  { id: 5, symbol: 'async', x: 45, y: 8, delay: 4 },
  { id: 6, symbol: 'await', x: 90, y: 45, delay: 5 },
];

const branches = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Electrical Engineering (EE)',
  'Information Technology (IT)',
  'Chemical Engineering (CHE)',
  'Aerospace Engineering (AE)',
  'Biotechnology (BT)',
  'Other'
];

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState(1);
  const [branch, setBranch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Animation effects
  useEffect(() => {
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
          console.error('Token verification failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('tokenTimestamp');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!branch) {
      setError('Please select your branch');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('api/auth/signup', {
        name,
        email,
        password,
        confirmPassword,
        semester,
        branch,
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && name && email && password && confirmPassword && branch) {
      handleSignup(e);
    }
  };
  
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Rocket className="w-12 h-12 text-green-400" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome to LabBuddy! 🎉</h2>
          <p className="text-slate-300 text-lg">Account created successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
            `
          }}></div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      {/* Floating Code Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute text-purple-300/20 text-sm font-mono pointer-events-none select-none animate-pulse"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            transform: `translateY(${Math.sin(animationPhase + element.delay) * 15}px)`
          }}
        >
          {element.symbol}
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Welcome */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo with Animation */}
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="relative">
                  <Terminal className="w-12 h-12 text-purple-400" />
                  <Heart className="w-6 h-6 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-5xl lg:text-6xl font-black text-white">
                  <span className="text-purple-400">Lab</span>Buddy
                </h1>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  Join the <span className="text-purple-400">Adventure</span>
                </h2>
                <p className="text-lg text-slate-300 font-light max-w-md mx-auto lg:mx-0">
                  Start your coding journey with thousands of developers, learners, and creators
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center hover:scale-105 transition-all duration-300">
                <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">2.5k+</div>
                <div className="text-xs text-slate-400">Active Coders</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center hover:scale-105 transition-all duration-300">
                <Code className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">75k+</div>
                <div className="text-xs text-slate-400">Projects Built</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center hover:scale-105 transition-all duration-300">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">4.9</div>
                <div className="text-xs text-slate-400">Rating</div>
              </div>
            </div>

            {/* Feature Preview */}
            <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 max-w-md mx-auto lg:mx-0">
              <h3 className="text-lg font-semibold text-white mb-4">What awaits you:</h3>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                    </div>
                    <span className="text-slate-300 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <UserPlus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                  <p className="text-slate-400">Begin your coding adventure today</p>
                </div>

                <div onSubmit={handleSignup} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl backdrop-blur-sm animate-pulse">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="Your awesome name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 block">
                          Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          required
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem} className="bg-slate-800">
                              {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Sem
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 block">
                          Branch
                        </label>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          required
                        >
                          <option value="" className="bg-slate-800">Select Branch</option>
                          {branches.map((br) => (
                            <option key={br} value={br} className="bg-slate-800">
                              {br}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 block">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="Create a strong password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 block">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    onClick={handleSignup}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Join LabBuddy
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-400">
                      Already part of our community?{' '}
                      <a
                        href="/"
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 cursor-pointer"
                      >
                        Sign in here
                      </a>
                    </p>
                  </div>
                </div>

                {/* Terms Notice */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-500 text-center">
                    By creating an account, you agree to our{' '}
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Privacy Policy</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;