import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const NotificationBell = () => {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!auth.token) return;

    const loadNotifications = async () => {
      const { data } = await api.get("/notifications");
      setNotifications(data.data);
    };

    loadNotifications();

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: auth.token },
    });

    socket.on("notification", (notification) => {
      setNotifications((current) => [notification, ...current]);
    });

    return () => socket.disconnect();
  }, [auth.token]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((current) =>
      current.map((item) => (item._id === id ? { ...item, isRead: true } : item))
    );
  };

  return (
    <div className="notification-wrapper">
      <button className="icon-button" onClick={() => setOpen((current) => !current)}>
        Activity {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <h4>Live activity</h4>
            <span>{unreadCount} unread</span>
          </div>
          {notifications.length === 0 ? (
            <p className="muted-text">No notifications yet.</p>
          ) : (
            notifications.slice(0, 8).map((item) => (
              <button
                key={item._id}
                className={`notification-item ${item.isRead ? "read" : ""}`}
                onClick={() => markRead(item._id)}
              >
                <strong>{item.title}</strong>
                <span>{item.message}</span>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
