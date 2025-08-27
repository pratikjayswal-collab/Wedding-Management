import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { setActiveTab } from '../../store/slices/uiSlice';
import GuestsTab from './GuestsTab';
import ExpensesTab from './ExpensesTab';
import RequirementsTab from './RequirementsTab';
import ProfileTab from './ProfileTab';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeTab, sidebarOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guests':
        return <GuestsTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'requirements':
        return <RequirementsTab />;
      case 'profile':
        return <ProfileTab onLogout={handleLogout} />;
      default:
        return <GuestsTab />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 font-playfair">
              {activeTab === 'guests' && 'Guest List'}
              {activeTab === 'expenses' && 'Expenses'}
              {activeTab === 'requirements' && 'Tasks'}
              {activeTab === 'profile' && 'Profile'}
            </h1>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          {renderActiveTab()}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
