import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { 
  MessageSquare, Users, Send, Wifi, WifiOff, 
  Clock, Terminal, Zap
} from 'lucide-react';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

function GroupChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = useCallback(async (token) => {
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      setError('Failed to load chat history.');
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please login.');
      setIsConnected(false);
      return;
    }

    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);

      fetchHistory(token);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      if (reason !== 'io client disconnect') {
        setError('Disconnected. Attempting to reconnect...');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);

      if (err.message.includes('Authentication error')) {
        setError(
          `Auth error: ${err.message}. Try refreshing or logging in again.`
        );
      } else {
        setError('Cannot connect to chat server.');
      }
    });

    socket.on('joinedRoom', (joinedRoom) => {
      console.log(`Joined room: ${joinedRoom}`);
      setRoom(joinedRoom);
    });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => {
        if (!prevMessages.some((m) => m._id === message._id)) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    });

    socket.on('messageError', (errorMessage) => {
      console.error('Message error:', errorMessage);
      setError(`Send failed: ${errorMessage}`);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
      setIsConnected(false);
      setRoom(null);
      setMessages([]);
    };
  }, [fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', { content: newMessage });
      setNewMessage('');
    } else if (!isConnected) {
      setError('Not connected. Cannot send message.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
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
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Floating code elements */}
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

      <div className='flex flex-col h-screen bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative z-10 m-6 rounded-3xl'>
        {/* Modern Clean Header */}
        <div className='px-8 py-6 border-b border-white/10 flex-shrink-0 relative'>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Clean Icon with Subtle Animation */}
              <div className="relative group">
                <div className="bg-slate-800/20 p-3 rounded-xl border border-white/10 group-hover:border-purple-400/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/10">
                  <MessageSquare className="w-6 h-6 text-purple-400 group-hover:scale-110 group-hover:text-purple-300 transition-all duration-300" />
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Title Section */}
                <div className="flex items-center gap-3">
                  <h2 className='text-2xl font-bold text-white tracking-tight group-hover:text-purple-100 transition-colors duration-300'>
                    Group Chat
                  </h2>
                  {room && (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 text-sm font-medium rounded-full border border-purple-500/20 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
                      {room.replace('sem_branch_', 'Sem ').replace('_', ' Branch ')}
                    </div>
                  )}
                </div>
                
                {/* Status Section with Clean Design */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <div className="relative flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <Wifi className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">Connected</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <WifiOff className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 font-medium">Disconnected</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                  
                  <div className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                    <Users className="w-4 h-4" />
                    <span>Live Chat</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clean Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/20 rounded-xl border border-white/10 hover:bg-slate-800/30 transition-all duration-300">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-slate-300 font-medium tracking-wider">
                  {isConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className='p-4 bg-red-500/20 backdrop-blur-sm border-b border-red-500/30 flex-shrink-0'>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4'>
          {messages.length === 0 && !error && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Terminal className="w-16 h-16 text-slate-500 mb-4 animate-pulse" />
              <p className='text-slate-400 text-lg font-medium'>Connecting to chat...</p>
              <p className='text-slate-500 text-sm'>Please wait while we establish connection</p>
            </div>
          )}
          
          {messages.length === 0 && !error && isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-16 h-16 text-purple-400 mb-4" />
              <p className='text-slate-300 text-lg font-medium'>No messages yet</p>
              <p className='text-slate-500 text-sm'>Start the conversation and break the ice! 🚀</p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isCurrentUser =
              msg.sender && localStorage.getItem('userId') === msg.sender._id;
            return (
              <div
                key={msg._id || Math.random()}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]`}
                style={{ animationDelay: `${messages.indexOf(msg) * 0.1}s` }}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    isCurrentUser 
                      ? 'bg-purple-600/90 text-white border-purple-400/30 hover:bg-purple-600' 
                      : 'bg-slate-800/80 text-slate-200 border-slate-600/30 hover:bg-slate-800/90'
                  }`}
                >
                  {/* Elegant shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  
                  <div className="relative z-10">
                    {/* Clean sender indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full shadow-sm ${
                        isCurrentUser ? 'bg-purple-200 shadow-purple-200/50' : 'bg-cyan-400 shadow-cyan-400/50'
                      }`}></div>
                      <p className={`text-xs font-semibold tracking-wide ${
                        isCurrentUser ? 'text-purple-100' : 'text-cyan-400'
                      }`}>
                        {isCurrentUser ? 'You' : msg.sender?.name || 'Unknown'}
                      </p>
                    </div>

                    {/* Message content with better typography */}
                    <p className='text-sm break-words leading-relaxed font-medium'>{msg.content}</p>

                    {/* Refined timestamp */}
                    <div className="flex items-center justify-end gap-1.5 mt-3">
                      <Clock className="w-3 h-3 opacity-40" />
                      <p className='text-xs opacity-60 font-medium'>
                        {formatTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced message input */}
        <form
          onSubmit={handleSendMessage}
          className='p-6 border-t border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0'
        >
          <div className='flex items-center space-x-4'>
            <div className="flex-1 relative group">
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Type your message...'
                className='w-full px-4 py-3.5 bg-slate-800/40 border border-slate-600/40 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 pr-12 hover:bg-slate-800/50 focus:bg-slate-800/60'
                disabled={!isConnected}
              />
              <MessageSquare className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors duration-200" />
            </div>

            <button
              type='submit'
              className={`px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2 group border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`}
              disabled={!isConnected || !newMessage.trim()}
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupChat;
