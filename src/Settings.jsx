import React, { useEffect, useState } from 'react';
import { auth, db } from './Config.js';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import Sidebar from './Sidebar.jsx';
import { useUser } from './UserContext.jsx';
import { setDoc } from 'firebase/firestore';
import AiClassificationBadge from './AiClassificationBadge.jsx';

const Settings = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: ''
  });
  const [helperCards, setHelperCards] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const { setUserProfile } = useUser();

useEffect(() => {
  const fetchData = async () => {
    const authUser = auth.currentUser;
    if (!authUser) return;
    setUser(authUser);

    // --- profile ---
    const userRef = doc(db, 'users', authUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || authUser.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || authUser.photoURL || '',
      });
    } else {
      setProfile(p => ({ ...p, email: authUser.email || '' }));
    }

    // --- helpers: try userId, then helperId, then merge unique ---
    const byUserIdSnap = await getDocs(query(collection(db, 'helpers'), where('userId', '==', authUser.uid)));
    const byHelperIdSnap = await getDocs(query(collection(db, 'helpers'), where('helperId', '==', authUser.uid)));

    const helpersA = byUserIdSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const helpersB = byHelperIdSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const mergedHelpers = [...helpersA, ...helpersB].reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    setHelperCards(Object.values(mergedHelpers));

    // --- reports (some old docs may miss userId) ---
    const reportSnap = await getDocs(query(collection(db, 'reports'), where('userId', '==', authUser.uid)));
    setReportCards(reportSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  fetchData();
}, []);


  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const updatedProfile = {
        ...profile,
        email: user.email
      };

      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });

      setUserProfile({ ...updatedProfile, userId: user.uid });

      const updatedUser = {
        ...user,
        displayName: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
        photoURL: updatedProfile.profilePicture
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile updated!');
    } catch (err) {
      console.error("Firestore update error:", err);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 bg-gray-50 p-8 min-h-screen">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-10">
          <div className="flex items-center gap-6 mb-8">
            {(profile.profilePicture || user?.photoURL) ? (
              <img
                src={profile.profilePicture || user?.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-[#D8ECF0] shadow-[0_0_12px_4px_rgba(216,236,240,0.9)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border shadow bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#123524]">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-medium block mb-1 text-[#123524]">First Name</label>
              <input
                className="w-full border border-white/30 bg-white/20 px-4 py-3 rounded-xl shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="font-medium block mb-1 text-[#123524]">Last Name</label>
              <input
                className="w-full border border-white/30 bg-white/20 px-4 py-3 rounded-xl shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
            <div>
              <label className="font-medium block mb-1 text-[#123524]">Email</label>
              <input
                className="w-full border border-white/30 bg-white/10 px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed"
                value={profile.email}
                readOnly
              />
            </div>
            <div>
              <label className="font-medium block mb-1 text-[#123524]">Phone Number</label>
              <input
                className="w-full border border-white/30 bg-white/20 px-4 py-3 rounded-xl shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-medium block mb-1 text-[#123524]">Bio</label>
              <textarea
                className="w-full border border-white/30 bg-white/20 px-4 py-3 rounded-xl shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] h-24 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-medium block mb-1 text-[#123524]">Profile Picture URL</label>
              <input
                className="w-full border border-white/30 bg-white/20 px-4 py-3 rounded-xl shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400"
                value={profile.profilePicture}
                onChange={(e) => handleChange('profilePicture', e.target.value)}
              />
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleSave}
              className="bg-[#D3F78B]/60 text-[#123524] px-6 py-3 rounded-full font-semibold shadow-md transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-xl font-bold mb-4 text-[#123524]">Your Helper Cards</h2>
          {helperCards.length === 0 ? (
            <p className="text-gray-500">You haven’t submitted any helper cards.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {helperCards.map((card) => (
                <div key={card.id} className="p-4 bg-white rounded shadow ">
                  <h3 className="font-semibold">{card.offerType || 'Help Offered'}</h3>
                  <p className="text-sm text-gray-600">
                    Willing to help up to {card.maxPeople || 0} people
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-xl font-bold mb-4 text-[#123524]">Your Reported Issues</h2>
          {reportCards.length === 0 ? (
            <p className="text-gray-500">You haven’t submitted any reports yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reportCards.map((card) => (
                <div key={card.id} className="p-4 bg-white rounded shadow ">
                  <h3 className="font-semibold">{card.title || 'Untitled Report'}</h3>
                  <p className="text-sm text-gray-600 mb-2">{card.description || 'No description'}</p>
                  <AiClassificationBadge classification={card.aiClassification} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;