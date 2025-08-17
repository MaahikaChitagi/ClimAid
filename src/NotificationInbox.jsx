import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { db } from './Config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

const NotificationInbox = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.uid) return;
      setUser(storedUser);

      try {
        const q = query(
          collection(db, 'notifications'),
          where('toUserId', '==', storedUser.uid),
          orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);

        const notifList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // Fetch report
            let report = null;
            try {
              const reportSnap = await getDoc(doc(db, 'reports', data.reportId));
              report = reportSnap.exists() ? reportSnap.data() : null;
            } catch (err) {
              console.error('Error fetching report:', err);
            }

            // Fetch fromUser
            let fromUser = null;
            try {
              const fromUserId = data.fromUser?.uid || data.fromUserId;
              if (fromUserId) {
                const userSnap = await getDoc(doc(db, 'users', fromUserId));
                fromUser = userSnap.exists() ? userSnap.data() : null;
              }
            } catch (err) {
              console.error('Error fetching fromUser:', err);
            }

            return {
              id: docSnap.id,
              ...data,
              report,
              fromUser,
            };
          })
        );

        setNotifications(notifList);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className="flex-1 overflow-y-auto bg-white p-8 transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="text-gray-500">You have no notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-stone-100 p-4 rounded-xl shadow hover:bg-stone-200 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={notif.fromUser?.photoURL || notif.fromUser?.profilePicture || '/default-profile.png'}
                    alt="User"
                    className="w-10 h-10 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {notif.fromUser?.name || notif.fromUser?.googleName || 'Someone'} offered to help on your report.
                    </p>
                    {notif.report?.title && (
                      <p className="text-sm text-gray-600 italic">
                        Report: {notif.report.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {notif.timestamp?.toDate
                        ? new Date(notif.timestamp.toDate()).toLocaleString()
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationInbox;
