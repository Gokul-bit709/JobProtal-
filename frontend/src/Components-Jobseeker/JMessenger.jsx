import React, { useCallback, useState, useEffect, useRef } from 'react';
import '../Components-Employer/Chatbox.css';
import { useJobs } from '../JobContext';
import home from "../assets/home_icon.png";
import { Link } from 'react-router-dom';
import api from '../api/axios';

// **JMessenger**
export const JMessenger = () => {

    const {
        chats,
        setChats,
        currentUser,
        fetchMessages,
        fetchChats,
        currentUserId,
        isChatEnded,
        setNotificationsData,
        addEmployerNotification,
        sendMessage
    } = useJobs();

    const [input, setInput] = useState("");
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activeUserName, setActiveUsername] = useState("");
    const [isRead, setIsRead] = useState(false);

    const scrollRef = useRef(null);

    const markAsRead = async (messageId) => {
        try {
            const response = await api.post(`/chat/messages/${messageId}/read/`);

            console.log("Marked:", messageId, response.status);

            return response.status === 200; // ✅ correct for axios
        } catch (error) {
            console.error('Error marking message as read:', error.response?.data || error);
            return false;
        }
    };

    // Active Chat
    const activeChat = chats?.find(chat => chat.id === activeChatId);
    // Employer Profile
    const employerProfile = activeChat?.participants?.find(
        p => p.id !== currentUserId
    );

    const hasMessages = chats && chats.length > 0;

    // Fetch Messages
    const fetchMsg = async () => {
        try {
            if (!activeChat?.id) {
                console.warn("No valid active chat");
                return;
            }

            const isValid = chats.find(c => c.id === activeChatId);

            if (!isValid) {
                console.error("Invalid chat ID:", activeChatId);
                return;
            }

            console.log("Loading messages for:", activeChat.id);
            const msgs = await fetchMessages(activeChat.id);

            setMessages(msgs || []);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    // useEffect(() => {
    //     if (chats.length > 0) {
    //         const firstValidChat = chats.find(chat =>
    //             chat.participants?.some(p => p.id == currentUserId)
    //         );

    //         if (firstValidChat) {
    //             setActiveChatId(firstValidChat.id);
    //         }
    //     }
    // }, [chats, currentUserId]);

    useEffect(() => {
        if (!activeChat?.id) return;
        fetchMsg();
    }, [activeChatId]);


    // Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Send Message
    const handleSend = async (e) => {
        e.preventDefault();

        if (
            !input.trim() ||
            isChatEnded ||
            !activeChat ||
            !employerProfile
        ) return;

        const newMessage = input.trim();

        try {
            if (!activeChat?.id) {
                console.error("No active chat selected");
                return;
            }
            const res = await sendMessage(activeChat?.id, newMessage);

            if (res.success) {
                const newMsg = res.data;

                // Update UI instantly
                setMessages(prev => [...prev, newMsg]);
            }
        } catch (error) {
            console.log(error);
        }

        // addEmployerNotification(
        //     `New message from ${
        //         currentUser?.profile?.fullName ||
        //         currentUser?.username
        //     }`,
        //     employerProfile.id
        // );

        setInput("");
    };

    // Load Chats
    useEffect(() => {
        const loadChats = async () => {
            try {
                await fetchChats();
            } catch (err) {
                console.error("Failed to load chats:", err);
            }
        };

        loadChats();
    }, []);

    //

    const getDateSeparator = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (messageDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        }
    };
    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return [];

        const groups = [];
        let currentDate = null;

        const sortedMessages = [...messages].sort((a, b) => {
            const timeA = new Date(a.timestamp || a.created_at);
            const timeB = new Date(b.timestamp || b.created_at);
            return timeA - timeB;
        });

        sortedMessages.forEach((msg) => {
            const timestamp = msg.timestamp || msg.created_at;
            if (!timestamp) {
                groups.push({ type: 'message', data: msg });
                return;
            }
            const date = new Date(timestamp);
            const dateKey = date.toDateString();
            if (currentDate !== dateKey) {
                currentDate = dateKey;
                groups.push({ type: 'date', data: timestamp });
            }

            groups.push({ type: 'message', data: msg });
        });

        return groups;
    };

    const getConversationForUser = useCallback((userId) => {
        if (!userId) return null;

        const conversation = chats.find(chat =>
            chat.participants?.some(p => p.id === parseInt(userId))
        );

        return conversation;
    }, [chats]);

    const activeConversation = getConversationForUser(activeChatId);

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="messages-container">

            {/* Sidebar */}
            <div className="E-chat-name">
                <div className="web-sidebar" style={{ height: "100vh" }}>

                    <Link to="/Job-portal/jobseeker/">
                        <img src={home} alt="home" style={{ height: "20px" }} />
                    </Link>

                    <div className="sidebar-header">
                        <h2 style={{ color: "#007bff", textAlign: "center" }}>
                            Messages
                        </h2>
                    </div>

                    {hasMessages && chats.map(chat => {
                        const unreadCount = chat.unread_count || 0;
                        const isActive = activeChat?.id === chat.id;

                        return (
                            <div
                                key={chat.id}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={async() => {
                                        setActiveChatId(chat.id);
                                        setActiveUsername(chat.initiated_by?.username);
                                        const unreadMessages = messages.filter(msg => 
                                    msg.receiver?.id !== currentUserId && !msg.is_read
                                );
    
                                await Promise.all(
                                unreadMessages.map(msg => markAsRead(msg.id))
                            );
                                        setChats(prev =>
                                            prev.map(c =>
                                                c.id === chat.id
                                                    ? { ...c, unread_count: 0 }
                                                    : c
                                            )
                                        ); 
                                    }}
                            >
                                <strong>
                                    {chat.initiated_by?.username || 'Unknown User'}
                                </strong>

                                {unreadCount > 0 && (
                                    <span style={{
                                        background: "#007bff",
                                        color: "white",
                                        borderRadius: "50%",
                                        padding: "2px 6px",
                                        fontSize: "10px"
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className="web-main-chat">
                {hasMessages && activeChat ? (
                    <>
                        <header className="web-chat-header">
                            <strong>
                                {activeUserName ? activeUserName : ""}
                            </strong>
                        </header>

                        <div className="web-chat-window" ref={scrollRef}>
                            {groupedMessages.length > 0 ? (
                                groupedMessages.map((item, index) => {
                                    if (item.type === 'date') {
                                        return (
                                            <div key={`date-${index}`} style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#e9ecef',
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        width: 'max-content',
                                                        fontSize: '12px',
                                                        color: '#666'
                                                    }}
                                                    className="date-separator"
                                                >
                                                    {getDateSeparator(item.data)}
                                                </div>
                                            </div>
                                        );
                                    }

                                    const m = item.data;

                                    return (
                                        <div key={m.id || index} className="web-msg-row">
                                            <div
                                                className={`web-bubble ${m.sender?.id === activeChat.initiated_by?.id
                                                    ? 'web-friend'
                                                    : 'web-me'
                                                    }`}
                                            >
                                                {m.content || m.text}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            )}

                            {isChatEnded && (
                                <div className="chat-end-label">
                                    --- Conversation Ended ---
                                </div>
                            )}
                        </div>
                        <form className="web-input-bar" onSubmit={handleSend}>
                            <input
                                className="web-text-input"
                                value={input}
                                disabled={isChatEnded}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Reply to employer..."
                            />

                            <button
                                type="submit"
                                disabled={isChatEnded}
                                className="web-send-button"
                            >
                                SEND
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-messages-view"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh"
                        }}>
                        <div className="no-msg-content"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                            <h3>No Messages</h3>
                            <p>Waiting for the employer to start the conversation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
