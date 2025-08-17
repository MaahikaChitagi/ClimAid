import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { useParams } from 'react-router-dom';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { db } from './Config.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from './UserContext';
import { Map } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const INITIAL_VIEW_STATE = {
  longitude: -96.797,
  latitude: 32.7767,
  zoom: 9,
  pitch: 0,
  bearing: 0,
};

const OfferHelp = () => {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);
  const { user, userProfile } = useUser();

  const [form, setForm] = useState({
    offer: '',
    maxPeople: '',
    availability: '',
    verified: false,
    lat: null,
    lng: null,
    address: '',
  });

  const handleSubmit = async () => {
    if (!id) {
  console.warn("Missing report ID. Cannot submit helper card.");
  alert("Missing report ID. Please refresh the page and try again.");
  return;
}

    if (!form.offer || !form.maxPeople || !form.availability || !form.lat || !form.lng) {
      alert('Please complete all fields and set a location.');
      return;
    }

    try {
      const helperName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.googleName || 'Anonymous';

      await addDoc(collection(db, 'helpers'), {
        name: helperName,
        photoURL: userProfile?.profilePicture || '',
        offerType: form.offer,
        maxPeople: parseInt(form.maxPeople),
        availability: form.availability,
        verified: form.verified,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        address: form.address,
        reportId: id,
        helperId: userProfile?.userId || user?.uid || '',
        timestamp: serverTimestamp(),
      });

      const reportDoc = await getDoc(doc(db, 'reports', id));
      const reportData = reportDoc.exists() ? reportDoc.data() : null;
      const toUserId = reportData?.userId;
      const fromUserUid = userProfile?.userId || user?.uid;

      if (toUserId && fromUserUid) {
        await addDoc(collection(db, 'notifications'), {
          toUserId,
          helperId: fromUserUid,
          fromUser: {
            uid: fromUserUid,
            name: helperName,
            photoURL: userProfile?.profilePicture || '',
          },
          reportId: id,
          type: 'offerHelp',
          read: false,
          timestamp: serverTimestamp(),
        });
      } else {
        console.warn("Notification skipped: report is missing userId.");
      }

      alert('Helper card submitted!');
      setForm({
        offer: '',
        maxPeople: '',
        availability: '',
        verified: false,
        lat: null,
        lng: null,
        address: '',
      });

    } catch (error) {
      console.error("Submission failed:", error);
      alert('There was an error. Check the console.');
    }
  };

  const mapDotLayer = new ScatterplotLayer({
    id: 'helper-dot',
    data: form.lat && form.lng ? [{ position: [form.lng, form.lat] }] : [],
    getPosition: (d) => d.position,
    getFillColor: () => [0, 150, 255],
    getRadius: 500,
    radiusUnits: 'meters',
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ececec]">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 overflow-y-auto bg-stone-50 p-8 transition-all duration-300">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold inline-block mb-6">
          You're Offering Help for Report ID: <strong>{id}</strong>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`bg-white rounded-3xl shadow-lg p-6 mx-auto flex flex-col justify-between transition-all duration-500 w-[350px] ${
              previewCollapsed ? 'h-[350px]' : 'h-[500px]'
            }`}>
            <div className="relative w-full h-44 rounded-2xl mb-4 overflow-hidden">
              <DeckGL
                initialViewState={{
                  ...INITIAL_VIEW_STATE,
                  longitude: form.lng || INITIAL_VIEW_STATE.longitude,
                  latitude: form.lat || INITIAL_VIEW_STATE.latitude,
                }}
                controller
                layers={[mapDotLayer]}
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

              {userProfile?.profilePicture && (
                <img
                  src={userProfile.profilePicture}
                  alt="User"
                  className="absolute bottom-2 left-2 w-12 h-12 rounded-full border-4 border-white shadow"
                />
              )}
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.googleName || user?.displayName || 'Your Name'}
            </h2>

            <p className="text-gray-600 text-sm mb-2">
              Offering: {form.offer || '—'}
            </p>

            {!previewCollapsed && (
              <>
                <p className="text-gray-600 text-sm mb-1">
                  Max People: {form.maxPeople || '—'}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  Availability: {form.availability || '—'}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  Meetup Location: {form.address || '—'}
                </p>
                {form.verified && (
                  <span className="inline-block bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                    ✅ Verified
                  </span>
                )}
              </>
            )}

            <div className="w-full flex justify-center mt-2">
              <button
                onClick={() => setPreviewCollapsed(!previewCollapsed)}
                className="text-[#123524]/60 hover:text-[#123524] transition"
              >
                {previewCollapsed ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-10 max-w-xl mx-auto">
            <label className="block text-base font-semibold text-[#123524] mb-2">
              What can you offer?
            </label>
            <input
              type="text"
              value={form.offer}
              onChange={(e) => setForm({ ...form, offer: e.target.value })}
              placeholder="e.g., food, shelter, medical kits"
              className="w-full p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />

            <label className="block text-base font-semibold text-[#123524] mb-2">
              Max number of people you can help
            </label>
            <input
              type="number"
              value={form.maxPeople}
              onChange={(e) => setForm({ ...form, maxPeople: e.target.value })}
              placeholder="e.g., 3"
              className="w-full p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />

            <label className="block text-base font-semibold text-[#123524] mb-2">
              Availability
            </label>
            <input
              type="text"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              placeholder="e.g., evenings or weekends"
              className="w-full p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />

            <label className="block text-base font-semibold text-[#123524] mb-2">
              Meetup Location
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g., 123 Main St, LA, CA"
              className="w-full p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />

            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-base font-semibold text-[#123524] mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={form.lat || ''}
                  onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-[#123524] mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={form.lng || ''}
                  onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>
            </div>

            <label className="block text-base font-semibold text-[#123524] mb-4">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                className="mr-2 accent-green-600 scale-110"
              />
              Verified Helper
            </label>

            <button
              className="mt-2 w-full py-3 px-6 bg-[#D3F78B]/60 rounded-full text-gray-500 text-base font-semibold shadow-md transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              Submit Helper Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferHelp;
