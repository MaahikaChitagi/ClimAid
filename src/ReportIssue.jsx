import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar.jsx';
import { db } from './Config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from './Config.js';
import { onAuthStateChanged } from './Config.js';
import AiClassificationBadge from './AiClassificationBadge.jsx';
import { CATEGORY_FROM_DISASTER, classifyImageFile, classifyImageUrl, compressImageFile } from './classifyImage.js';




const ReportIssue = () => {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState([]);
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [classification, setClassification] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User ID:", user.uid);
      setUser(user);
      window.auth = auth; // ✅ this line is optional for console testing
    }
  });

  return () => unsubscribe();
}, []);

  const handleCheckboxChange = (need) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const getLatLngFromAddress = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
    );
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      return null;
    }
  };

  const applyClassification = (result) => {
    setClassification(result);
    setClassifyError('');
    const suggested = CATEGORY_FROM_DISASTER[result.disasterType];
    if (suggested && !category) setCategory(suggested);
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setClassifying(true);
    setClassifyError('');
    try {
      applyClassification(await classifyImageFile(file));
    } catch (err) {
      setClassification(null);
      setClassifyError(err.message);
    }
    setClassifying(false);
  };

  const classifyPastedUrl = async (raw) => {
    const url = (raw ?? '').trim();
    if (!url.startsWith('http') || imageFile) return;
    setImageUrl(url);
    setClassifying(true);
    setClassifyError('');
    try {
      applyClassification(await classifyImageUrl(url));
    } catch (err) {
      setClassification(null);
      setClassifyError(err.message);
    }
    setClassifying(false);
  };

  const handleSubmit = async () => {
    if (!description || !category || !title || !address) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const coords = await getLatLngFromAddress(address);
      if (!coords) {
        alert('Unable to determine location. Please check the address.');
        setSubmitting(false);
        return;
      }

      let storedImageUrl = imageUrl.trim();
      if (imageFile) {
        storedImageUrl = await compressImageFile(imageFile);
      }

      let aiClassification = classification;
      if (!aiClassification && imageFile) {
        try {
          aiClassification = await classifyImageFile(imageFile);
        } catch (err) {
          console.warn('Classification skipped:', err);
        }
      } else if (!aiClassification && storedImageUrl.startsWith('http')) {
        try {
          aiClassification = await classifyImageUrl(storedImageUrl);
        } catch (err) {
          console.warn('Classification skipped:', err);
        }
      }

      await addDoc(collection(db, 'reports'), {
        title,
        description,
        needs,
        peopleAffected,
        address,
        urgency,
        category,
        lat: coords.lat,
        lng: coords.lng,
        createdAt: serverTimestamp(),
        imageUrl: storedImageUrl,
        userId: user?.uid,
        ...(aiClassification ? { aiClassification } : {}),
      });

      alert('Issue reported successfully!');
      setTitle('');
      setDescription('');
      setNeeds([]);
      setPeopleAffected(1);
      setAddress('');
      setUrgency('Medium');
      setCategory('');
      setImageUrl('');
      setImageFile(null);
      setPreviewUrl('');
      setClassification(null);
      setClassifyError('');
    } catch (err) {
      console.error('Error reporting issue:', err);
      alert('Something went wrong.');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ececec]">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className="flex-1 overflow-y-auto bg-[#ececec] p-8">
        {/* Header */}
            <div className="relative w-full h-120 rounded-4xl overflow-hidden shadow-md mb-10 ">
              <img
                src="/issueheader.png"
                alt="Scenic header"
                className="w-full h-full object-cover opacity-90 !object-[center_84%] "
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#bcc474]/20 to-{#bcc474}/20 z-10 px-12 py-12 flex flex-col justify-between text-stone-800">
    <div className="max-w-3xl text-white">
                    <h1 className=" text-5xl font-bold text-white pt-20 py-3 mr-10 drop-shadow-md">Report</h1>
                    <div className="mt-3" />
                    <h1 className="text-5xl mb-15 font-bold text-white mr-10 drop-shadow-md">Local Issues</h1>
                    <div className="mt-9" />
                    <div className="mt-4 inline-flex items-center gap-4 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm shadow-md text-[#2A4B5F] text-sm font-medium max-w-fit">
  <div className="flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#C3D2D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-4 4m0-4l4 4" />
    </svg>
    <span>192 issues resolved</span>
  </div>
  <span className="text-[#C3D2D4]/89">|</span>
  <div className="flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#C3D2D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4H7a2 2 0 01-2-2V10a2 2 0 012-2h2" />
    </svg>
    <span>87 helpers active nearby</span>
  </div>
</div>

                    




    </div>
  </div>
</div>




        {/* Main Grid */}
        <div className={`grid ${sidebarCollapsed ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} `}>
          {/* Preview Card */}
          <div
            className={`bg-white rounded-3xl shadow-lg p-6 mx-auto flex flex-col justify-between transition-all duration-500 w-[350px] ${
              previewCollapsed ? 'h-[350px]' : 'h-[550px]'
            }`}
          >
            {/* Image */}
            <div className="relative w-full h-56 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
              {(previewUrl || imageUrl) ? (
                <img src={previewUrl || imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
              )}
              {classification && (
                <div className="absolute bottom-2 left-2">
                  <AiClassificationBadge classification={classification} compact />
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-2">{title || 'Your Title Here'}</h2>

            {!previewCollapsed && (
              <>
                <p className="text-gray-600 text-sm mb-4">{description || 'Your description will appear here.'}</p>

                {needs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {needs.map((need, i) => (
                      <span key={i} className="bg-[#E0FCCE] px-3 py-1 text-xs rounded-full text-gray-600">{need}</span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500 mb-6">
                  <div className="text-center">
                    <p>Urgency</p>
                    <p className="font-bold">{urgency}</p>
                  </div>
                  <div className="text-center">
                    <p>People</p>
                    <p className="font-bold">{peopleAffected}</p>
                  </div>
                  <div className="text-center">
                    <p>Location</p>
                    <p className="font-bold truncate max-w-[80px]">
                      {address?.split(',').slice(-2).join(', ') || '---'}
                    </p>
                  </div>
                </div>

                <div className="w-full flex justify-center mb-4">
                  <button className="w-full bg-gray-300 text-black py-3 rounded-full font-medium text-sm hover:bg-gray-400 transition">
                    Offer Help
                  </button>
                </div>
              </>
            )}

            {/* Collapse Toggle */}
            <div className="w-full flex justify-center">
              <button
                onClick={() => setPreviewCollapsed(!previewCollapsed)}
                className="text-gray-400 hover:text-black transition"
              >
                {previewCollapsed ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
              </button>
            </div>
          </div>

          {/* Form Section */}
<div className="bg-gradient-to-br from-white to-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-10 max-w-xl mx-auto">
  <label className="block text-base font-semibold text-[#123524] mb-2">Title</label>
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Basement flooded in Irving"
    className="w-full p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
  />

  <label className="block text-base font-semibold text-[#123524] mb-2">Description</label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Describe the issue..."
    className="w-full h-28 p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
  />

  <label className="block text-base font-semibold text-[#123524] mb-2">What do you need?</label>
  <div className="flex flex-wrap gap-x-4 gap-y-3 mb-6">
    {["Food", "Shelter", "Clothing", "Medical", "Power", "Water"].map((item) => (
      <label key={item} className="text-sm text-[#123524] flex items-center gap-1">
        <input
          type="checkbox"
          className="accent-green-600 scale-110"
          checked={needs.includes(item)}
          onChange={() => handleCheckboxChange(item)}
        />
        {item}
      </label>
    ))}
  </div>

  <div className="grid grid-cols-2 gap-5 mb-6">
    <div>
      <label className="block text-base font-semibold text-[#123524] mb-1"># People Affected</label>
      <input
        type="number"
        min="1"
        value={peopleAffected}
        onChange={(e) => setPeopleAffected(e.target.value)}
        className="w-full p-3 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      />
    </div>
<div className="relative">
  <label className="block text-base font-semibold text-[#123524] mb-1">Urgency</label>
  <select
    value={urgency}
    onChange={(e) => setUrgency(e.target.value)}
    className="appearance-none w-full p-3 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
  >
    <option>Low</option>
    <option>Medium</option>
    <option>High</option>
    <option>Emergency</option>
  </select>

  {/* Custom dropdown arrow */}
  <div className="pointer-events-none absolute right-4 top-[67%] transform -translate-y-1/2 text-[#123524] text-sm">
    ▼
  </div>
</div>

  </div>

  <label className="block text-base font-semibold text-[#123524] mb-2">Address</label>
  <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="1234 Maple Dr, Irving, TX"
    className="w-full p-3 mb-5 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
  />
<div className="relative mb-5">
  <label className="block text-base font-semibold text-[#123524] mb-2">Category</label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="appearance-none w-full p-3 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
  >
    <option value="">Select Category</option>
    <option>Flooding</option>
    <option>Wildfire</option>
    <option>Drought</option>
    <option>Storm</option>
    <option>Infrastructure</option>
  </select>

  {/* Custom dropdown arrow */}
  <div className="pointer-events-none absolute right-4 top-[67%] transform -translate-y-1/2 text-[#123524] text-sm">
    ▼
  </div>
</div>


  <label className="block text-base font-semibold text-[#123524] mb-2">Disaster photo</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleImageFile(e.target.files?.[0])}
    className="w-full p-3 mb-3 rounded-xl border border-white/30 bg-white/20 text-sm text-[#123524] file:mr-3 file:rounded-full file:border-0 file:bg-[#D3F78B]/70 file:px-3 file:py-1 file:text-sm file:font-semibold"
  />
  <input
    ref={imageInputRef}
    type="text"
    value={imageUrl}
    onChange={(e) => {
      setImageUrl(e.target.value);
      if (!imageFile) setPreviewUrl('');
    }}
    onBlur={(event) => classifyPastedUrl(event.target.value)}
    placeholder="or paste an image URL"
    className="w-full p-3 mb-3 rounded-xl border border-white/30 bg-white/20 shadow-inner shadow-white/10 backdrop-blur-md placeholder:text-gray-500 text-base text-[#123524] focus:outline-none focus:ring-2 focus:ring-green-400 transition"
  />
  <button
    type="button"
    onClick={() => classifyPastedUrl(imageInputRef.current?.value || imageUrl)}
    disabled={classifying}
    className="w-full mb-4 py-2 rounded-full text-sm font-semibold text-[#123524] bg-white/70 border border-[#123524]/10 disabled:opacity-50"
  >
    {classifying ? 'Reading photo...' : 'Classify photo'}
  </button>

  {classifying && (
    <p className="text-sm text-[#5b7a8a] mb-4">Reading visual features…</p>
  )}
  {classifyError && (
    <p className="text-sm text-red-600 mb-4">{classifyError}</p>
  )}
  {classification && (
    <div className="mb-5 rounded-2xl bg-white/50 border border-white/40 p-4">
      <p className="text-sm font-semibold text-[#123524] mb-2">
        CNN sees {classification.disasterType} with {classification.severity} damage
      </p>
      <AiClassificationBadge classification={classification} />
      <div className="mt-3 space-y-1.5">
        {Object.entries(classification.probabilities.disaster).map(([name, probability]) => (
          <div key={name}>
            <div className="flex justify-between text-xs text-[#123524]/80">
              <span>{name}</span>
              <span>{Math.round(probability * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white">
              <div
                className="h-1.5 rounded-full bg-[#5b7a8a]"
                style={{ width: `${Math.round(probability * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {CATEGORY_FROM_DISASTER[classification.disasterType] &&
        category !== CATEGORY_FROM_DISASTER[classification.disasterType] && (
          <button
            type="button"
            onClick={() => setCategory(CATEGORY_FROM_DISASTER[classification.disasterType])}
            className="mt-3 text-xs font-semibold text-[#123524] underline"
          >
            Use predicted category ({CATEGORY_FROM_DISASTER[classification.disasterType]})
          </button>
        )}
    </div>
  )}

<button
  onClick={handleSubmit}
  disabled={submitting}
  className={`w-full py-3 px-6 bg-[#D3F78B]/60 rounded-full text-gray-500  text-base font-semibold rounded-xl shadow-md transform transition-all duration-300 ease-in-out  hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
>
  {submitting ? 'Submitting...' : 'Submit Issue'}
</button>

</div>


        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
