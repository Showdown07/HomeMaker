import { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const BookingChat = ({ bookingId }) => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/messages/booking/${bookingId}`);
      setMessages(data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load messages");
    }
  };

  useEffect(() => {
    loadMessages();
  }, [bookingId]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!body.trim()) return;

    try {
      await api.post("/messages", { bookingId, body });
      setBody("");
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send message");
    }
  };

  return (
    <section className="chat-panel">
      <div className="dashboard-head">
        <strong>Booking chat</strong>
        <span className="soft-chip">{messages.length} messages</span>
      </div>
      <div className="chat-thread">
        {messages.length ? (
          messages.map((message) => (
            <article
              className={`chat-bubble ${
                message.sender?._id === auth.user?._id ? "mine" : ""
              }`}
              key={message._id}
            >
              <strong>{message.sender?.name || "User"}</strong>
              <p>{message.body}</p>
            </article>
          ))
        ) : (
          <p className="muted-text">No messages yet. Start with access details or timing questions.</p>
        )}
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <input
          placeholder="Write a message..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button className="primary-button" type="submit">
          Send
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
};

export default BookingChat;
