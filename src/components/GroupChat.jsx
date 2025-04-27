import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios'; 


const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL ;
const API_BASE_URL = import.meta.env.VITE_API_URL ;

function GroupChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [room, setRoom] = useState(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null); 

    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

 
    const fetchHistory = useCallback(async (token) => {
        setError(null); 
        try {
            const response = await axios.get(`${API_BASE_URL}/chat/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data.messages || []);
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
            setError("Failed to load chat history.");
            setMessages([]);
        }
    }, []);

   
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication token not found. Please login.");
            setIsConnected(false);
            return;
        }

       
        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: { token },
            reconnectionAttempts: 5 
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
                setError(`Auth error: ${err.message}. Try refreshing or logging in again.`);
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
                if (!prevMessages.some(m => m._id === message._id)) {
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
            setError("Not connected. Cannot send message.");
            setTimeout(() => setError(null), 3000);
        }
    };

   
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return '' }
    };

    return (
      
        <div className="flex flex-col h-full bg-gray-900 text-gray-200 rounded-lg shadow-md overflow-hidden border border-gray-700">
            <div className="p-3 bg-gray-800 text-white shadow-sm flex-shrink-0 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Group Chat {room ? `(${room.replace('sem_branch_', 'Sem ' ).replace('_', ' Branch ')})` : 'Loading...'}</h2>
                <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}> {/* Adjusted colors for dark theme */}
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

          
            {error && (
                 <div className="p-2 bg-red-500/20 text-red-400 text-center text-sm flex-shrink-0">{error}</div>
            )}

          
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                {messages.length === 0 && !error && !isConnected && <p className="text-center text-gray-500">Connecting...</p>}
                {messages.length === 0 && !error && isConnected && <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>}
                {messages.map((msg) => {
                    const isCurrentUser = msg.sender && localStorage.getItem('userId') === msg.sender._id;
                    return (
                        <div key={msg._id || Math.random()} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                           
                            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                             
                                {isCurrentUser && (
                                    <p className="text-xs font-semibold mb-1 text-blue-200">You</p>
                                )}
                               
                                {!isCurrentUser && msg.sender && (
                                    <p className="text-xs font-semibold mb-1 text-cyan-400">{msg.sender.name || 'Unknown'}</p>
                                )}
                                <p className="text-sm break-words">{msg.content}</p>
                               
                                <p className="text-xs text-right opacity-60 mt-1">
                                    {formatTimestamp(msg.createdAt)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} /> 
            </div>

           
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!isConnected}
                    />
                  
                    <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={!isConnected || !newMessage.trim()}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GroupChat; 