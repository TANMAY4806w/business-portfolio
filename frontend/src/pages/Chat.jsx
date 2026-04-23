import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getMessages, getHireRequest } from '../services/api';

const Chat = () => {
    const { hireRequestId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [hireRequest, setHireRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(null);
    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [hireRes, msgRes] = await Promise.all([
                    getHireRequest(hireRequestId),
                    getMessages(hireRequestId),
                ]);
                setHireRequest(hireRes.data);
                setMessages(msgRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();

        // Connect Socket.io
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        socket.current = io(socketUrl);

        socket.current.emit('joinRoom', {
            hireRequestId,
            userId: user._id,
        });

        socket.current.on('newMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.current.on('userTyping', (data) => {
            setTyping(data.name);
        });

        socket.current.on('userStopTyping', () => {
            setTyping(null);
        });

        return () => {
            socket.current?.disconnect();
        };
    }, [hireRequestId, user._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;

        const receiverId =
            hireRequest.clientId._id === user._id
                ? hireRequest.businessId._id
                : hireRequest.clientId._id;

        socket.current.emit('sendMessage', {
            hireRequestId,
            senderId: user._id,
            receiverId,
            text: newMsg.trim(),
        });

        socket.current.emit('stopTyping', { hireRequestId });
        setNewMsg('');
    };

    const handleTyping = (e) => {
        setNewMsg(e.target.value);

        socket.current.emit('typing', {
            hireRequestId,
            userId: user._id,
            name: user.name,
        });

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket.current.emit('stopTyping', { hireRequestId });
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const otherUser =
        hireRequest?.clientId._id === user._id
            ? hireRequest?.businessId
            : hireRequest?.clientId;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            {/* Chat Header */}
            <div className="glass-card p-4 mb-4 flex items-center gap-4 shrink-0 shadow-lg border-b border-dark-700">
                <Link to="/hire-requests" className="p-2 -ml-2 rounded-full hover:bg-dark-700 text-dark-300 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner ring-2 ring-dark-800">
                    {otherUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="font-bold text-white text-lg leading-tight">{otherUser?.name}</h2>
                    <p className="text-xs text-accent-400 font-medium mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                        {hireRequest?.serviceId?.title}
                    </p>
                </div>
                {typing && (
                    <div className="ml-auto flex items-center gap-2 bg-dark-800 px-3 py-1.5 rounded-full border border-dark-700">
                        <span className="text-[10px] text-dark-300 font-medium uppercase tracking-wider">{typing}</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {messages.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-12 h-12 text-dark-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-dark-400">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMine = (msg.senderId?._id || msg.senderId) === user._id;
                        return (
                            <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
                  ${isMine
                                        ? 'gradient-bg text-white rounded-br-md'
                                        : 'bg-dark-700 text-dark-100 rounded-bl-md border border-dark-600'
                                    }`}>
                                    {!isMine && (
                                        <p className="text-xs text-accent-400 font-semibold mb-1">
                                            {msg.senderId?.name || 'User'}
                                        </p>
                                    )}
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-white/50' : 'text-dark-500'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="glass-card p-3 flex gap-3 shrink-0 border-t border-dark-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                <input type="text" value={newMsg} onChange={handleTyping}
                    placeholder="Message..."
                    className="flex-1 bg-dark-900 px-5 py-3.5 rounded-2xl text-white
                        placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50
                        border border-dark-700 transition-all shadow-inner" />
                <button type="submit" disabled={!newMsg.trim()}
                    className={`px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center
                        ${newMsg.trim() ? 'bg-accent-500 text-dark-900 shadow-lg shadow-accent-500/20 hover:scale-105 hover:bg-accent-400' 
                                        : 'bg-dark-800 text-dark-500 cursor-not-allowed'}`}>
                    <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Chat;
