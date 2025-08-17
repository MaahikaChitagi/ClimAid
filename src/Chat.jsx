import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from './Config';
import { useUser } from './UserContext';
import Sidebar from './Sidebar';

const Chat = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const passedOtherUser = location.state?.otherUser || null;

  const { userProfile } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [otherUser, setOtherUser] = useState(passedOtherUser);
  const bottomRef = useRef(null);

  // Wait until userProfile is loaded
  useEffect(() => {
    if (!userProfile?.userId || !chatId) return;

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      // Determine the other user
      if (msgs.length > 0 && !otherUser) {
        const firstMsg = msgs[0];
        const otherId = firstMsg.senderId === userProfile.userId
          ? firstMsg.receiverId
          : firstMsg.senderId;

        if (otherId) {
          getDoc(doc(db, 'users', otherId)).then((snap) => {
            if (snap.exists()) {
              setOtherUser(snap.data());
            }
          });
        }
      }
    });

    return () => unsubscribe();
  }, [chatId, userProfile?.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !userProfile?.userId) return;

    const receiverId =
      messages.length > 0
        ? (messages[0].senderId === userProfile.userId
            ? messages[0].receiverId
            : messages[0].senderId)
        : otherUser?.uid || '';

    if (!receiverId) return;

    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId: userProfile.userId,
      receiverId,
      text: inputText.trim(),
      timestamp: serverTimestamp(),
    });

    setInputText('');
  };

  const isOwnMessage = (msg) => msg.senderId === userProfile?.userId;

  if (!userProfile) {
    return <div className="p-8 text-gray-600">Loading user info...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className="flex flex-col flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Chat with {otherUser?.firstName || otherUser?.displayName || 'User'}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg p-4 border">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs ${
                  isOwnMessage(msg)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
