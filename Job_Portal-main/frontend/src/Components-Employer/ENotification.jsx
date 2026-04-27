
// import React, { useState, useEffect, useRef } from "react";
// import '../Components-Jobseeker/JNotification.css'
// import bell from '../assets/header_bell.png'
// import bell_dot from '../assets/header_bell_dot.png'
// import { useJobs } from "../JobContext";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";

// export const ENotification = () => {
    
//     const { 
//         employerNotifications = [],
//         setEmployerNotifications,
//         employershowNotification,  // ✅ Fixed: changed from employerShowNotification
//         setEmployerShowNotification,
//         currentEmployer
//     } = useJobs();

//     // Local state for menu (since it's not in context)
//     const [employerActiveMenuId, setEmployerActiveMenuId] = useState(null);

//     console.log("=== ENotification Debug ===");
//     console.log("Current Employer:", currentEmployer);
//     console.log("Current Employer ID:", currentEmployer?.id);
//     console.log("employerNotifications:", employerNotifications);
//     console.log("employerNotifications length:", employerNotifications.length);
    
//     const navigate = useNavigate();
//     const containerRef = useRef(null);

//     // Notifications are already filtered in context for the current employer
//     const currentEmployerNotifications = employerNotifications;
    
//     // ✅ Fixed: Use 'is_read' instead of 'isRead'
//     const newNotificationsCount = currentEmployerNotifications.filter(n => !n.is_read).length;

//     // Toggle 3-dot menu
//     const toggleMenu = (id, event) => {
//         event.stopPropagation();
//         setEmployerActiveMenuId(employerActiveMenuId === id ? null : id);
//     };

//     // ✅ MARK AS READ - API call
//     const handleMarkAsRead = async (id) => {
//         try {
//             await api.patch(`/notifications/${id}/read/`);
//             // Update local state
//             setEmployerNotifications(prev => 
//                 prev.map(n => n.id === id ? { ...n, is_read: true } : n)
//             );
//         } catch (err) {
//             console.error("Error marking as read:", err);
//         }
//         setEmployerActiveMenuId(null);
//     };

//     // ✅ MARK AS UNREAD - API call
//     const handleMarkAsUnread = async (id) => {
//         try {
//             await api.patch(`/notifications/${id}/unread/`);
//             // Update local state
//             setEmployerNotifications(prev => 
//                 prev.map(n => n.id === id ? { ...n, is_read: false } : n)
//             );
//         } catch (err) {
//             console.error("Error marking as unread:", err);
//         }
//         setEmployerActiveMenuId(null);
//     };

//     // ✅ DELETE ONE - API call
//     const handleDelete = async (id) => {
//         try {
//             await api.delete(`/notifications/${id}/delete/`);
//             // Update local state
//             setEmployerNotifications(prev => prev.filter(n => n.id !== id));
//         } catch (err) {
//             console.error("Error deleting notification:", err);
//         }
//         setEmployerActiveMenuId(null);
//     };

//     // ✅ CLEAR ALL - API call
//     const handleClearAll = async () => {
//         try {
//             await api.delete('/notifications/clear-all/');
//             setEmployerNotifications([]);
//         } catch (err) {
//             console.error("Error clearing all notifications:", err);
//         }
//         setEmployerActiveMenuId(null);
//     };

//     // CLOSE ON OUTSIDE CLICK
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 containerRef.current &&
//                 !containerRef.current.contains(event.target)
//             ) {
//                 if (setEmployerShowNotification) {
//                     setEmployerShowNotification(false);
//                 }
//                 setEmployerActiveMenuId(null);
//             }
//         };

//         if (employershowNotification) {
//             document.addEventListener("mousedown", handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [employershowNotification, setEmployerShowNotification]);

//     // HANDLE ESC KEY
//     useEffect(() => {
//         const handleEscKey = (event) => {
//             if (event.key === 'Escape' && employershowNotification) {
//                 if (setEmployerShowNotification) {
//                     setEmployerShowNotification(false);
//                 }
//                 setEmployerActiveMenuId(null);
//             }
//         };

//         document.addEventListener('keydown', handleEscKey);
//         return () => {
//             document.removeEventListener('keydown', handleEscKey);
//         };
//     }, [employershowNotification, setEmployerShowNotification]);

//     // Format notification time
//     const formatNotificationTime = (time) => {
//         if (!time) return '';
        
//         try {
//             const notificationDate = new Date(time);
//             const now = new Date();
//             const diffInMinutes = Math.floor((now - notificationDate) / 60000);
            
//             if (diffInMinutes < 1) return 'Just now';
//             if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
//             if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
//             if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
            
//             return notificationDate.toLocaleDateString();
//         } catch (error) {
//             return time;
//         }
//     };

//     return (
//         <div
//             ref={containerRef}
//             className={`notifications-container ${employershowNotification ? "show-notification" : "hide-notification"}`}
//             role="dialog"
//             aria-label="Notifications panel"
//             aria-hidden={!employershowNotification}
//         >
//             {/* HEADER */}
//             <div className="notifications-header">
//                 <div className="notifications-heading-container">
//                     <img
//                         className="notification-header-icons"
//                         src={newNotificationsCount > 0 ? bell_dot : bell}
//                         alt={newNotificationsCount > 0 ? `${newNotificationsCount} unread notifications` : "No new notifications"}
//                         aria-label={newNotificationsCount > 0 ? `${newNotificationsCount} unread notifications` : "No new notifications"}
//                     />
//                     <h2>Notifications</h2>
//                 </div>
//                 <button 
//                     onClick={() => {
//                         if (setEmployerShowNotification) {
//                             setEmployerShowNotification(false);
//                         }
//                     }} 
//                     className="notifications-close-btn"
//                     aria-label="Close notifications panel"
//                 >
//                     &times;
//                 </button>
//             </div>

//             {/* SUBHEADER */}
//             <div className="notifications-subheader">
//                 <div>
//                     <span>Stay Up to Date</span>
//                     {newNotificationsCount > 0 && (
//                         <span className="new-notifications-count" aria-label={`${newNotificationsCount} new notifications`}>
//                             {newNotificationsCount} New Notifications
//                         </span>
//                     )}
//                 </div>

//                 {currentEmployerNotifications.length > 0 && (
//                     <button 
//                         className="clear-all-btn" 
//                         onClick={handleClearAll}
//                         aria-label="Clear all notifications"
//                     >
//                         Clear all
//                     </button>
//                 )}
//             </div>

//             {/* NOTIFICATION LIST */}
//             <div className="notifications-list">
//                 {currentEmployerNotifications.length === 0 ? (
//                     <div className="empty-notifications" style={{ padding: "40px 20px", textAlign: "center" }}>
//                         <p style={{ color: "#777", marginBottom: "10px" }}>
//                             No notifications for you
//                         </p>
//                         <p style={{ color: "#999", fontSize: "14px" }}>
//                             When you receive notifications, they'll appear here
//                         </p>
//                     </div>
//                 ) : (
//                     currentEmployerNotifications.map((notification) => (
//                         <div
//                             key={notification.id}
//                             className={notification.is_read ? "notification-old-item" : "notification-new-item"}
//                             role="article"
//                             aria-label={`Notification: ${notification.message || notification.text}`}
//                         >
//                             <div className="notification-content">
//                                 <p className="notification-text">{notification.message || notification.text}</p>
//                                 <p className="notification-time">
//                                     {formatNotificationTime(notification.created_at || notification.time)}
//                                 </p>
//                             </div>

//                             <div className="more-options-wrapper">
//                                 <button
//                                     className="more-options-btn"
//                                     onClick={(e) => toggleMenu(notification.id, e)}
//                                     aria-label="More options"
//                                     aria-expanded={employerActiveMenuId === notification.id}
//                                     aria-haspopup="true"
//                                 >
//                                     ⋮
//                                 </button>

//                                 {employerActiveMenuId === notification.id && (
//                                     <div 
//                                         className="overflow-menu"
//                                         role="menu"
//                                         aria-label="Notification options"
//                                     >
//                                         {notification.is_read ? (
//                                             <button
//                                                 className="menu-item"
//                                                 onClick={() => handleMarkAsUnread(notification.id)}
//                                                 role="menuitem"
//                                             >
//                                                 Mark as unread
//                                             </button>
//                                         ) : (
//                                             <button
//                                                 className="menu-item"
//                                                 onClick={() => handleMarkAsRead(notification.id)}
//                                                 role="menuitem"
//                                             >
//                                                 Mark as read
//                                             </button>
//                                         )}

//                                         <button
//                                             onClick={() => handleDelete(notification.id)}
//                                             className="menu-item delete-item"
//                                             role="menuitem"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>

//             {/* MARK ALL AS READ BUTTON */}
//             {currentEmployerNotifications.length > 0 && newNotificationsCount > 0 && (
//                 <div className="notifications-footer" style={{ padding: "12px", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
//                     <button 
//                         className="mark-all-read-btn"
//                         onClick={async () => {
//                             const unreadIds = currentEmployerNotifications
//                                 .filter(n => !n.is_read)
//                                 .map(n => n.id);
                            
//                             for (const id of unreadIds) {
//                                 await handleMarkAsRead(id);
//                             }
//                         }}
//                         style={{ 
//                             background: "none", 
//                             border: "none", 
//                             color: "#3b82f6", 
//                             cursor: "pointer",
//                             fontSize: "14px",
//                             fontWeight: "500"
//                         }}
//                         aria-label="Mark all notifications as read"
//                     >
//                         Mark all as read
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };  

import React, { useState, useEffect, useRef } from "react";
import '../Components-Jobseeker/JNotification.css'
import bell from '../assets/header_bell.png'
import bell_dot from '../assets/header_bell_dot.png'
import { useJobs } from "../JobContext";
import api from "../api/axios";  // ← ఈ line add
import { useNavigate } from "react-router-dom";

export const ENotification = ({  }) => {
    
    const {
        employerNotifications,
        setEmployerNotifications,
        employeractiveMenuId,
        setEmployerActiveMenuId,
        employershowNotification,
        setEmployerShowNotification,
        fetchNotifications  // ← Add this
    } = useJobs();
    
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const newNotificationsCount = employerNotifications.filter(n => !n.isRead).length;

    const toggleMenu = (id, event) => {
        event.stopPropagation();
        setEmployerActiveMenuId(employeractiveMenuId === id ? null : id);
    };

    // ================= API FUNCTIONS =================
    
    // MARK AS READ
    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error marking as read:", err);
            setEmployerNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        }
        setEmployerActiveMenuId(null);
    };

    // MARK AS UNREAD
    const handleMarkAsUnread = async (id) => {
        try {
            await api.patch(`/notifications/${id}/unread/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error marking as unread:", err);
            setEmployerNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: false } : n)
            );
        }
        setEmployerActiveMenuId(null);
    };

    // DELETE ONE
    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}/delete/`);
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
            setEmployerNotifications(prev => prev.filter(n => n.id !== id));
        }
        setEmployerActiveMenuId(null);
    };

    // CLEAR ALL
    const handleClearAll = async () => {
        try {
            await api.delete("/notifications/clear-all/");
            if (fetchNotifications) await fetchNotifications();
        } catch (err) {
            console.error("Error clearing notifications:", err);
            setEmployerNotifications([]);
        }
        setEmployerActiveMenuId(null);
    };

    // CLOSE ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setEmployerShowNotification(false);
            }
        };

        if (employershowNotification) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [employershowNotification, setEmployerShowNotification]);

    return (
        <div
            ref={containerRef}
            className={`notifications-container ${employershowNotification ? "show-notification" : "hide-notification"}`}
        >
            {/* HEADER */}
            <div className="notifications-header">
                <div className="notifications-heading-container">
                    <img
                        className="notification-header-icons"
                        src={newNotificationsCount > 0 ? bell_dot : bell}
                        alt="Notifications"
                    />
                    <h2>Notifications</h2>
                </div>
                <button onClick={() => setEmployerShowNotification(false)} className="notifications-close-btn">
                    &times;
                </button>
            </div>

            {/* SUBHEADER */}
            <div className="notifications-subheader">
                <div>
                    <span>Stay Up to Date</span>
                    {newNotificationsCount > 0 && (
                        <span className="new-notifications-count">
                            {newNotificationsCount} New Notifications
                        </span>
                    )}
                </div>
                <button className="clear-all-btn" onClick={handleClearAll}>
                    Clear all
                </button>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="notifications-list">
                {employerNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={notification.isRead ? "notification-old-item" : "notification-new-item"}
                    >
                        <div className="notification-content">
                            <p className="notification-text">{notification.text}</p>
                            <p className="notification-time">{notification.time}</p>
                        </div>

                        <div className="more-options-wrapper">
                            <button
                                className="more-options-btn"
                                onClick={(e) => toggleMenu(notification.id, e)}
                            >
                                ⋮
                            </button>

                            {employeractiveMenuId === notification.id && (
                                <div className="overflow-menu">
                                    {notification.isRead ? (
                                        <button
                                            className="menu-item"
                                            onClick={() => handleMarkAsUnread(notification.id)}
                                        >
                                            Mark as unread
                                        </button>
                                    ) : (
                                        <button
                                            className="menu-item"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="menu-item delete-item"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {employerNotifications.length === 0 && (
                    <p style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                        No notifications for you
                    </p>
                )}
            </div>
        </div>
    );
};