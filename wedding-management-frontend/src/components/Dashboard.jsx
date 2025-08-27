import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { setActiveTab } from '../store/slices/uiSlice';
import GuestsTab from './GuestsTab';
import ExpensesTab from './ExpensesTab';
import RequirementsTab from './RequirementsTab';
import ProfileTab from './ProfileTab';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';
import OverviewTab from './OverviewTab';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeTab, isSidebarOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'guests':
        return <GuestsTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'requirements':
        return <RequirementsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Desktop/Tablet Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <DesktopSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={(tab) => dispatch(setActiveTab(tab))}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile top brand bar */}
        <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span className="text-lg font-bold text-gray-900">Wedify</span>
        </div>
        {/* Main Content */}
        <div className="pb-20">
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => dispatch(setActiveTab(tab))}
        />
      </div>
    </div>
  );
}
