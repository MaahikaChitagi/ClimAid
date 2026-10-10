// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import ReportTab from './ReportTab.jsx'; // Reusable tab for heatmap + cards
import { IoIosArrowForward, IoMdArrowRoundForward } from 'react-icons/io';
import './styles.css';
import { useUser } from './UserContext';
import { motion } from 'framer-motion';


const tabs = ['Flooding', 'Wildfire', 'Storm', 'Drought', 'Infrastructure'];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Flooding');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // ✅ Needed to control layout
  const { userProfile } = useUser();

  const fullName =
    userProfile?.firstName?.trim() || userProfile?.lastName?.trim()
      ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
      : userProfile?.googleName || 'User';
      
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ececec]">
      {/* ✅ Pass state + setter to Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className="flex-1 overflow-y-auto bg-[#ececec] p-8">
        {user ? (
          <>
            {/* Scenic Header Section */}
            <div className="relative w-full h-120 rounded-4xl overflow-hidden shadow-md mb-10 ">
              <img
                src="/header.png"
                alt="Scenic header"
                className="w-full h-full object-cover opacity-90 !object-[center_84%] "
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#bcc474]/20 to-{#bcc474}/20 z-10 px-12 py-10 flex flex-col justify-between text-stone-800">
                <div className="flex justify-between items-start w-full ">
                  {/* Welcome Text */}
                  <div>
                    <h1 className="mt-20 text-5xl font-bold text-white py-3 mr-10 drop-shadow-md">Welcome,</h1>
                    <div className="mt-3" />
                    <h1 className="text-5xl font-bold text-white mr-10 drop-shadow-md">{fullName}</h1>
                    <div className="mt-9" />
                  </div>

                  {/* Earth Logo */}
                  {/* <img
                    src="/earth.png"
                    alt="Earth logo"
                    className="mr-30 w-65 h-65 object-contain"
                  /> */}
                </div>

                {/* Tab Selector */}
<div className="w-full h-20 rounded-4xl overflow-hidden shadow-md mb-13 bg-white/10 backdrop-blur-md border border-white/30 flex justify-between items-center px-2 gap-2 glass-card">
  {tabs.map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3.5 rounded-full text-m font-semibold transition-all text-center ${
        activeTab === tab
          ? 'bg-[#C3D2D4]/35 text-[#385157]/90 shadow-inner'
          : 'bg-white/20 text-[#C3D2D4]/89 hover:bg-white/30'
      }`}
    >
      {tab}
    </button>
  ))}
</div>

              </div>
            </div>

            {/* ✅ Pass sidebarCollapsed to ReportTab so layout adjusts */}
            <ReportTab category={activeTab} isSidebarCollapsed={sidebarCollapsed} />
          </>
        ) : (
          <p className="text-red-500 text-lg">No user info found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
