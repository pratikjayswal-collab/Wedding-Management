import React from 'react';
import { useSelector } from 'react-redux';

export default function GuestStats() {
  const { guests, stats } = useSelector((state) => state.guest);

  // Calculate stats from guests if stats not available
  const calculatedStats = stats || {
    total: guests.length,
    invitationPending: guests.filter(g => !g.invitationSent).length,
    invitationSent: guests.filter(g => g.invitationSent).length,
  };

  const totalFamilies = guests.length; // each guest represents a family
  const totalPeople = guests.reduce((sum, g) => sum + 1 + (typeof g.extraMembersCount === 'number' ? g.extraMembersCount : 0), 0);

  const statItems = [
    {
      label: 'Total Guests',
      value: totalPeople,
      color: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      label: 'Total Families',
      value: totalFamilies,
      color: 'from-green-500 to-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m9-9a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      label: 'Invitation Pending',
      value: calculatedStats.invitationPending,
      color: 'from-yellow-500 to-yellow-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Invitation Sent',
      value: calculatedStats.invitationSent,
      color: 'from-purple-500 to-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v1a2 2 0 002 2h1m-6 6l-4 0m0 0l0-4m0 4l6-6" />
        </svg>
      ) 
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Guest Overview</h3>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
        {statItems.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-3 shadow-lg`}>
              {stat.icon}
              </div>
              <div className="text-sm text-gray-600 min-h-10 font-medium">
                {stat.label}
              </div>
            <div className="text-lg font-bold text-gray-800 mb-1">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

  
    </div>
  );
}
