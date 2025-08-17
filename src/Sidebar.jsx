// Sidebar.jsx
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AiFillHome, AiOutlineFileText, AiOutlineSetting, AiOutlineFire, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { getAuth, signOut } from 'firebase/auth';
import { useUser } from './UserContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useUser(); // ✅ from context

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    if (setCollapsed) setCollapsed(saved);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <AiFillHome />, path: '/dashboard' },
    { label: 'Issues', icon: <AiOutlineFileText />, path: '/reportissues' },
    { label: 'Explore', icon: <AiOutlineFire />, path: '/explore' },
    // { label: 'Settings', icon: <AiOutlineSetting />, path: '/settings' },
    {label: 'Connections', icon:<AiOutlineUsergroupAdd/>, path: '/connections'}
  ];

  const fullName =
    userProfile?.firstName || userProfile?.lastName
      ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
      : userProfile?.googleName || 'User';

  return (
    <div className={`sticky top-0 self-start h-screen bg-[#D7DCDD] transition-all duration-300 shadow-md ${collapsed ? 'w-30' : 'w-67'} flex flex-col justify-between rounded-r-2xl`}>
      <div>
        <div className="flex items-center justify-between px-4 py-6">
          {!collapsed && (
            <h1 className="ml-5.5 mt-10 w-full text-center text-[#5B7A8A]! text-3xl font-bold tracking-wide "style={{ textShadow: '2px 2px 4.5px rgba(72, 122, 138, 0.4)' }}>ClimAid.</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`mt-10 transition-all duration-600 ease-in-out text-[#5B7A8A] ${collapsed ? 'ml-7' : 'ml-4'}`}
          >
            {collapsed ? <FiChevronRight size={30} /> : <FiChevronLeft size={30} />}
          </button>
        </div>

        {userProfile && (
          <div className="flex flex-col items-center py-10">
            <img
              src={userProfile.profilePicture}
              alt="User"
className="w-18 h-18 rounded-full border-4 border-white/70 shadow-[0_0_12px_4px_rgba(216,236,240,0.9)] object-cover"
            />
            {!collapsed && (
              <>
                <span className="mt-3 py-1 font-semibold text-base text-[#5B7A8A]! text-slate-900 tracking-wide">
                  {fullName}
                </span>
                {/* <span className="text-xs text-[#F6F7C1] font-semibold">★ 7.5</span> */}
              </>
            )}
          </div>
        )}

        <nav className="mt-10 flex flex-col gap-3.5 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`text-base text-[#5B7A8A]/70 flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors ${
                  isActive ? 'text-[#5B7A8A]! font-semibold ' : ''
                }`}
              >
                <span
                  className={`transition-all duration-600 ease-in-out ${
                    collapsed ? 'text-4xl ml-5' : 'text-2xl ml-10'
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className={isActive ? 'text-[#5B7A8A]' : 'text-[#5B7A8A]/70'}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>


<div className="p-4  border-[#5B7A8A]/15 flex items-center justify-between">
  {/* Logout on the left */}
  <button
    onClick={handleLogout}
    className="text-sm text-[#5B7A8A]/70 hover:text-red-500 transition-colors"
  >
    Logout
  </button>

  {/* Settings icon on the right */}
  <Link to="/settings">
    <AiOutlineSetting className="text-2xl text-[#5B7A8A]/70 hover:text-gray-600 transition" />
  </Link>
</div>

    </div>
  );
};

export default Sidebar;
