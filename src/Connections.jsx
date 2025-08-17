import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar.jsx';
import { geodesicDistance } from './utils.js';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './Config.js';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import 'maplibre-gl/dist/maplibre-gl.css';

const Connections = () => {
  const [showCardModal, setShowCardModal] = useState(false);
const [selectedCard, setSelectedCard] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [filter, setFilter] = useState('all');
  const modalMapRef = useRef(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser?.uid) return;
    setUser(storedUser);

    const fetchNotifications = async () => {
      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', storedUser.uid),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const notifList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let report = null;
          let fromUser = null;
          let helper = null;

          if (data.reportId) {
            const reportSnap = await getDoc(doc(db, 'reports', data.reportId));
            if (reportSnap.exists()) report = { ...reportSnap.data(), id: reportSnap.id };
          }

          const fromUserId = data.fromUser?.uid;
          if (fromUserId) {
            const userSnap = await getDoc(doc(db, 'users', fromUserId));
            if (userSnap.exists()) fromUser = userSnap.data();
          }

          const helperId = data.helperId;
          if (helperId) {
            const helperQuery = query(
              collection(db, 'helpers'),
              where('helperId', '==', helperId)
            );
            const helperSnapshot = await getDocs(helperQuery);
            if (!helperSnapshot.empty) {
              helper = helperSnapshot.docs[0].data();
            }
          }

          let distanceMiles = null;
          if (
            report?.lat &&
            report?.lng &&
            helper?.lat &&
            helper?.lng
          ) {
            const rLoc = { lat: report.lat, lng: report.lng };
            const hLoc = { lat: helper.lat, lng: helper.lng };
            const miles = geodesicDistance(rLoc, hLoc);
            distanceMiles = parseFloat(miles.toFixed(1));
          }

          return {
            id: docSnap.id,
            ...data,
            report,
            fromUser,
            helper,
            distanceMiles,
            type: data.type || 'helper_offer',
          };
        })
      );
      setNotifications(notifList);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchChats = async () => {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid),
        orderBy('lastUpdated', 'desc')
      );
      const snapshot = await getDocs(q);
      const chatList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const chatData = docSnap.data();
          const otherUserId = Array.isArray(chatData.participants)
            ? chatData.participants.find(id => id !== user.uid)
            : null;
          if (!otherUserId) return null;

          const otherUserSnap = await getDoc(doc(db, 'users', otherUserId));
const otherUser = otherUserSnap.exists()
  ? { ...otherUserSnap.data(), uid: otherUserSnap.id }
  : { name: 'Unknown' };
          return {
            chatId: docSnap.id,
            ...chatData,
            otherUser,
          };
        })
      );

      setChats(chatList.filter(Boolean));
    };

    fetchChats();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedHelper(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedHelper && modalMapRef.current) {
      const map = new maplibregl.Map({
        container: modalMapRef.current,
        style: MAP_STYLE,
        center: [selectedHelper.lng || 0, selectedHelper.lat || 0],
        zoom: 10,
      });
      new maplibregl.Marker().setLngLat([selectedHelper.lng, selectedHelper.lat]).addTo(map);
    }
  }, [selectedHelper]);

  const getFromUserName = (fromUser) =>
    fromUser?.firstName || fromUser?.googleName || fromUser?.displayName || fromUser?.name || 'Someone';

  const getInitials = (name = 'N') => name?.charAt(0).toUpperCase() || 'N';

  const handleContactMe = async () => {
    if (!user || !selectedHelper?.report?.id) {
      console.error('Missing user or report ID');
      return;
    }

    const fromUserUid = user.uid;
    const helperName = user.displayName || user.name || user.googleName || 'Anonymous';
    const chatId = [user.uid, selectedHelper.helperId].sort().join('_');

    try {
      const reportSnap = await getDoc(doc(db, 'reports', selectedHelper.report.id));
      if (!reportSnap.exists()) {
        console.error('Report not found');
        return;
      }

      const fullReport = reportSnap.data();
      const toUserId = fullReport.userId;
      if (!toUserId) {
        console.error('Missing toUserId in report');
        return;
      }

      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: fromUserUid,
        receiverId: selectedHelper.helperId,
        text: '👋 Hello! I saw you offered help on my report.',
        timestamp: serverTimestamp(),
      });

      await setDoc(doc(db, 'chats', chatId), {
        participants: [fromUserUid, selectedHelper.helperId],
        lastMessage: '👋 Hello! I saw you offered help on my report.',
        lastUpdated: serverTimestamp(),
      });

      let distanceBetween = null;
      if (
        fullReport?.lat &&
        fullReport?.lng &&
        selectedHelper?.lat &&
        selectedHelper?.lng
      ) {
        const rLoc = { lat: fullReport.lat, lng: fullReport.lng };
        const hLoc = { lat: selectedHelper.lat, lng: selectedHelper.lng };
        const miles = geodesicDistance(rLoc, hLoc);
        distanceBetween = parseFloat(miles.toFixed(1));
      }

      await addDoc(collection(db, 'notifications'), {
        toUserId,
        helperId: fromUserUid,
        fromUser: {
          uid: fromUserUid,
          name: helperName,
          photoURL: user?.profilePicture || '',
        },
        reportId: selectedHelper.report.id,
        type: 'chat_request',
        read: false,
        timestamp: serverTimestamp(),
        distanceMiles: distanceBetween || null,
      });

      const helperUserSnap = await getDoc(doc(db, 'users', selectedHelper.helperId));
      const helperUser = helperUserSnap.exists() ? helperUserSnap.data() : null;

      navigate(`/chat/${chatId}`, {
        state: {
          chatId,
          otherUser: helperUser,
        },
      });
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };



  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 relative p-8">
        <div className="absolute top-6 right-6">
          <button onClick={() => setShowDropdown(!showDropdown)}>
            <FiBell className="text-3xl text-gray-700" />
          </button>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute mt-3 right-0 w-[340px] bg-white shadow-2xl rounded-2xl z-50 border border-gray-200 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2 ">
                <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
                <select
                  className="text-sm border rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="helper_offer">Helper Offers</option>
                  <option value="chat_request">Chat Requests</option>
                </select>
              </div>

              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No notifications</p>
              ) : (
                notifications
                  .filter((notif) =>
                    filter === 'all' ||
                    (filter === 'chat_request' && notif.type === 'chat_request') ||
                    (filter === 'helper_offer' && (notif.type === 'helper_offer' || !notif.type || notif.type === 'offer'))
                  )
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 "
                    >
                      <div className="flex gap-3 items-center">
                        {notif.fromUser?.profilePicture ? (
                          <img
                            src={notif.fromUser.profilePicture}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="avatar"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                            {getInitials(getFromUserName(notif.fromUser))}
                          </div>
                        )}
                        <div>
<p className="text-sm font-semibold text-gray-700">
  {getFromUserName(notif.fromUser)} offered to help
  {notif.distanceMiles != null && (
    <span className="ml-1 text-xs font-semibold text-gray-400">
      ({notif.distanceMiles} mi)
    </span>
  )}
</p>

                          <p className="text-xs text-gray-500">
                            {notif.timestamp?.toDate
                              ? new Date(notif.timestamp.toDate()).toLocaleString()
                              : 'Just now'}
                          </p>
                        </div>
                      </div>

                      {notif.type === 'chat_request' ? (
                        <button
                          onClick={() =>
                            navigate(`/chat/${notif.chatId}`, {
                              state: { chatId: notif.chatId, otherUser: notif.fromUser },
                            })
                          }
                          className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                          Open Chat
                        </button>
                      ) : (
                        <button
onClick={async () => {
  const helperId = notif?.helper?.helperId;
  if (!helperId) return;

  const helperQuery = query(
    collection(db, 'helpers'),
    where('helperId', '==', helperId)
  );
  const helperSnapshot = await getDocs(helperQuery);

  if (!helperSnapshot.empty) {
    const fullHelper = helperSnapshot.docs[0].data();
    setSelectedHelper({
  ...fullHelper,
  report: notif.report,   // Attach report
});
setShowCardModal(true);

  } else {
    console.warn('Helper not found in DB');
    setSelectedHelper({
  ...notif.helper,
  report: notif.report,  // Also attach report on fallback
});
 // fallback
  }

  setShowDropdown(false);
}}

                          className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                          View Helper Card
                        </button>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Chat Sessions */}
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 text-center text-gray-400 text-xl">
            <img src="/no-messages.svg" alt="No Messages" className="w-32 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700">No Conversations Yet</h2>
            <p className="text-sm">You haven't started chatting with anyone.</p>
          </div>
        ) : (
<div className="mt-6 space-y-4 max-w-[720px] mx-auto">
  {chats.map(chat => (
    <div
      key={chat.chatId}
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer border border-[#D7DCDD] border-[1.5px]"
    >
      <div
        className="flex items-center gap-4 flex-grow"
        onClick={() =>
          navigate(`/chat/${chat.chatId}`, {
            state: { chatId: chat.chatId, otherUser: chat.otherUser },
          })
        }
      >
        {chat.otherUser.profilePicture ? (
          <img src={chat.otherUser.profilePicture} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
            {chat.otherUser?.name?.charAt(0) || 'N'}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800">
            {chat.otherUser?.name || chat.otherUser?.googleName || chat.otherUser?.displayName || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 truncate w-64">
            {chat.lastMessage || 'No messages yet'}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-xs text-gray-400">
          {chat.lastUpdated?.toDate?.() ? new Date(chat.lastUpdated.toDate()).toLocaleTimeString() : ''}
        </p>
<button
  className="text-sm text-blue-600 font-semibold hover:underline"
  onClick={async (e) => {
    e.stopPropagation();

    const userId = chat?.otherUser?.uid || chat?.otherUser?.id;
    if (!userId) return console.warn('No userId available');

    try {
      const [helperSnap, reportSnap] = await Promise.all([
        getDocs(query(collection(db, 'helpers'), where('helperId', '==', userId))),
        getDocs(query(collection(db, 'reports'), where('userId', '==', userId))),
      ]);

      let latestDoc = null;
if (!helperSnap.empty && !reportSnap.empty) {
  const helperDoc = helperSnap.docs[0];
  const reportDoc = reportSnap.docs[0];

  const helperData = { ...helperDoc.data(), id: helperDoc.id };
  const reportData = { ...reportDoc.data(), id: reportDoc.id };

  const helperTime = helperData.timestamp?.toMillis?.() || 0;
  const reportTime = reportData.timestamp?.toMillis?.() || 0;

  latestDoc = helperTime > reportTime
    ? { ...helperData, type: 'helper' }
    : { ...reportData, type: 'report' };
} else if (!helperSnap.empty) {
  const helperDoc = helperSnap.docs[0];
  latestDoc = { ...helperDoc.data(), id: helperDoc.id, type: 'helper' };
} else if (!reportSnap.empty) {
  const reportDoc = reportSnap.docs[0];
  latestDoc = { ...reportDoc.data(), id: reportDoc.id, type: 'report' };
}

      if (latestDoc) {
        setSelectedCard(latestDoc);
        setShowCardModal(true);
      } else {
        console.warn('No card found for this user');
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  }}
>
  View Card
</button>


      </div>
    </div>
  ))}
</div>

        )}
      </div>

      {/* Helper Modal */}
{selectedHelper && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl p-6 w-[380px] relative">
      {/* Close button */}
      <button
        onClick={() => setSelectedHelper(null)}
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Profile + map */}
      <div className="relative w-full h-44 rounded-2xl mb-4 overflow-hidden">
        <DeckGL
          initialViewState={{
            longitude: selectedHelper.lng,
            latitude: selectedHelper.lat,
            zoom: 10,
            pitch: 0,
            bearing: 0,
          }}
          controller
          layers={[
            new ScatterplotLayer({
              id: 'helper-popup-dot',
              data: [{ position: [selectedHelper.lng, selectedHelper.lat] }],
              getPosition: (d) => d.position,
              getFillColor: () => [0, 150, 255],
              getRadius: 500,
              radiusUnits: 'meters',
            }),
          ]}
          style={{ width: '100%', height: '100%' }}
        >
          <Map
            mapLib={maplibregl}
            mapStyle={MAP_STYLE}
            reuseMaps
            preventStyleDiffing
            style={{ width: '100%', height: '100%' }}
          />
        </DeckGL>
        {selectedHelper.photoURL && (
          <img
            src={selectedHelper.photoURL}
            alt="Profile"
            className="absolute bottom-2 left-2 w-12 h-12 rounded-full border-4 border-white shadow"
          />
        )}
      </div>

      {/* Name + data */}
      <h2 className="text-xl font-semibold mb-2">
        {selectedHelper.name || 'Anonymous'}
      </h2>

<p className="text-gray-600 text-sm mb-1">
  Offering: {selectedHelper?.offerType ?? '—'}
</p>
<p className="text-gray-600 text-sm mb-1">
  Max People: {selectedHelper?.maxPeople ?? '—'}
</p>
<p className="text-gray-600 text-sm mb-1">
  Availability: {selectedHelper?.availability ?? '—'}
</p>
<p className="text-gray-600 text-sm mb-1">
  Meetup Location: {selectedHelper?.address ?? '—'}
</p>




      {selectedHelper.verified && (
        <span className="inline-block bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full mt-2">
          ✅ Verified
        </span>
      )}

      <button
        className="mt-4 w-full py-2 px-4 bg-[#D3F78B]/60 rounded-full text-gray-600 font-semibold hover:bg-[#C7ED7A]"
        onClick={() => handleContactMe(selectedHelper)}
      >
        Contact Me
      </button>
    </div>
    
  </div>
)}

{showCardModal && selectedCard && (
  <div
    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
    onClick={() => setShowCardModal(false)}
  >
    <div
      className="bg-white p-6 w-full max-w-md rounded-xl shadow-xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-black"
        onClick={() => setShowCardModal(false)}
      >
        ✕
      </button>

      <h2 className="text-xl font-bold text-[#5B7A8A] mb-2">
        {selectedCard.type === 'helper' ? 'Helper Card' : 'Issue Report'}
      </h2>

      <div className="text-gray-700 text-sm space-y-2">
        {selectedCard.type === 'helper' ? (
          <>
            <p>Offer Type: {selectedCard.offerType}</p>
            <p>Max People: {selectedCard.maxPeople}</p>
            <p>Availability: {selectedCard.availability}</p>
            <p>Location: {selectedCard.address}</p>
            {selectedCard.verified && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                ✅ Verified
              </span>
            )}
          </>
        ) : (
          <>
            <p>Title: {selectedCard.title}</p>
            <p>Description: {selectedCard.description}</p>
            <p>Needs: {selectedCard.needs}</p>
            <p>Category: {selectedCard.category}</p>
          </>
        )}
      </div>

{selectedCard.type === 'helper' && selectedCard.lat && selectedCard.lng && (
  <div
    className="mt-4 w-full h-[200px] rounded-xl overflow-hidden relative"
    style={{ minHeight: '200px', maxHeight: '200px' }} // ✅ enforce size
  >
    <DeckGL
      initialViewState={{
        longitude: selectedCard.lng,
        latitude: selectedCard.lat,
        zoom: 10,
        pitch: 0,
        bearing: 0,
      }}
      controller
      style={{ width: '100%', height: '100%' }}
      layers={[
        new ScatterplotLayer({
          id: 'helper-dot',
          data: [{ position: [selectedCard.lng, selectedCard.lat] }],
          getPosition: (d) => d.position,
          getFillColor: () => [0, 122, 255],
          getRadius: 500,
          radiusUnits: 'meters',
        }),
      ]}
    >
      <Map
        mapLib={maplibregl}
        reuseMaps
        preventStyleDiffing
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      />
    </DeckGL>
  </div>
)}


    </div>
  </div>
)}

    </div>
  );
};

export default Connections;
