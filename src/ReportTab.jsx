import React, { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './Config.js';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import 'maplibre-gl/dist/maplibre-gl.css';

// ✅ Frutiger Aero style base map (green/blue glow, soft contrast)
const MAP_STYLE = 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json?optimize=true&color=78C0E0,CEF6D8';

const INITIAL_VIEW_STATE = {
  longitude: -96.7970,
  latitude: 32.7767,
  zoom: 9,
  pitch: 0,
  bearing: 0,
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'Emergency': return [255, 0, 0];
    case 'High': return [255, 87, 34];
    case 'Medium': return [255, 193, 7];
    case 'Low': return [76, 175, 80];
    default: return [120, 120, 120];
  }
};

const ReportTab = ({ category, isSidebarCollapsed }) => {
  const [reports, setReports] = useState([]);
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [collapsedPopup, setCollapsedPopup] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'reports'));
      const filtered = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category.toLowerCase() === category.toLowerCase()) {
          filtered.push({ id: doc.id, ...data });
        }
      });
      setReports(filtered);
    };
    fetchData();
  }, [category]);

  const filteredReports = filterUrgency === 'All'
    ? reports
    : reports.filter((r) => r.urgency === filterUrgency);

  const scatterLayer = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: filteredReports,
    getPosition: (d) => [d.lng, d.lat],
    getFillColor: (d) =>
  selectedReport?.id === d.id ? [66, 135, 245, 255] : [...getUrgencyColor(d.urgency), 180],

    getRadius: 500,
    radiusUnits: 'meters',
    pickable: true,
    onClick: ({ object }) => {
      setSelectedReport(object);
      setCollapsedPopup(true);
    },
  });

  const handleClickOutside = useCallback((e) => {
    const popup = document.getElementById('popup-card');
    if (popup && !popup.contains(e.target)) {
      setSelectedReport(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="w-full relative">
<div className="w-full h-[600px] relative z-0 rounded-3xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller
          layers={[scatterLayer]}
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

        {selectedReport && (
          <div
            id="popup-card"
className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-[320px] p-5 z-10 animate-fadeIn backdrop-blur-md bg-white/30 border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl ${
  collapsedPopup ? 'h-[250px]' : 'h-auto transition-all duration-500'
}`}

          >
            <div className="h-36 rounded-xl overflow-hidden mb-3 bg-gray-100">
              {selectedReport.imageUrl ? (
                <img src={selectedReport.imageUrl} alt="Issue" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">No image</div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{selectedReport.title}</h3>

            {collapsedPopup ? (
              <div className="flex justify-center">
                <FiChevronDown onClick={() => setCollapsedPopup(false)} className="cursor-pointer text-2xl" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">{selectedReport.description || 'No description provided.'}</p>
                {selectedReport.needs?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedReport.needs.map((need, i) => (
                      <span key={i} className="bg-[#D3F78B]/60 px-3 py-1 text-xs rounded-full text-gray-600">{need}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <div className="text-center">
                    <p>Urgency</p>
                    <p className="font-bold">{selectedReport.urgency}</p>
                  </div>
                  <div className="text-center">
                    <p>People</p>
                    <p className="font-bold">{selectedReport.peopleAffected || '--'}</p>
                  </div>
                  <div className="text-center">
                    <p>Location</p>
                    <p className="font-bold truncate max-w-[80px]">
                      {selectedReport.address?.split(',').slice(-2).join(', ') || '---'}
                    </p>
                  </div>
                </div>
                {selectedReport?.id && (
                  <button
                    onClick={() => navigate(`/dashboard/offer-help/${selectedReport.id}`)}
                    className="w-full bg-[#5B7A8A]/20 text-black py-3 rounded-full font-medium text-sm hover:bg-[#5B7A8A]/50 transition"
                  >
                    Offer Help
                  </button>
                )}
                <div className="flex justify-center mt-3">
                  <FiChevronUp onClick={() => setCollapsedPopup(true)} className="cursor-pointer text-2xl" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 px-4 pb-6">
        <label className="font-semibold text-sm">Filter by urgency:</label>
        <select
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
          className="border rounded px-2 py-1 ml-2"
        >
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Emergency">Emergency</option>
        </select>

        <div
          className={`mt-6 transition-all duration-300 ${
            isSidebarCollapsed
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'ml-10 flex flex-wrap gap-y-6 '
          }`}
        >
          {filteredReports.map((r, i) => (
            <div
              key={r.id}
              style={{
                transform: isSidebarCollapsed ? 'none' : `translateX(0px)`,
                marginLeft: isSidebarCollapsed ? '0px' : `${-35}px`,
                zIndex: isSidebarCollapsed ? 'auto' : `${100 - i}`,
              }}
              className={`transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? '' : 'hover:translate-x-6 hover:z-[999]'
              }`}
            >
              <div className="bg-white rounded-3xl shadow-[6px_0_12px_rgba(0,0,0,0.15)] p-5 w-[320px] h-[480px] flex flex-col justify-between">
                <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt="Issue" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                </div>

                <h2 className="text-lg font-semibold mb-2">{r.title}</h2>
                <p className="text-gray-600 text-sm mb-3 flex-grow">{r.description}</p>

                {r.needs?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {r.needs.map((need, i) => (
                      <span key={i} className="bg-[#D3F78B]/60 px-3 py-1 text-xs rounded-full text-gray-600">
                        {need}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <div className="text-center">
                    <p>Urgency</p>
                    <p className="font-bold">{r.urgency}</p>
                  </div>
                  <div className="text-center">
                    <p>People</p>
                    <p className="font-bold">{r.peopleAffected || '--'}</p>
                  </div>
                  <div className="text-center">
                    <p>Location</p>
                    <p className="font-bold truncate max-w-[80px]">
                      {r.address?.split(',').slice(-2).join(', ') || '---'}
                    </p>
                  </div>
                </div>

                {r?.id && (
                  <button
                    onClick={() => navigate(`/dashboard/offer-help/${r.id}`)}
                    className="w-full bg-[#5B7A8A]/20 text-black py-3 rounded-full font-medium text-sm hover:bg-[#5B7A8A]/50 transition"
                  >
                    Offer Help
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translate(-50%, -30%); }
            100% { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default ReportTab;
