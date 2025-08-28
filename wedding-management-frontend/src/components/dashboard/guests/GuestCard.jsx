import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleInvitation, deleteGuest } from '../../../store/slices/guestSlice';
import { toggleGuestMembers, openGuestModal, setEditingGuest } from '../../../store/slices/uiSlice';

const GuestCard = ({ guest, isSelected, onSelect }) => {
  const dispatch = useDispatch();
  const [showMembers, setShowMembers] = useState(false);

  const handleToggleInvitation = () => {
    dispatch(toggleInvitation(guest._id));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      dispatch(deleteGuest(guest._id));
    }
  };

  const handleEdit = () => {
    dispatch(setEditingGuest(guest));
    dispatch(openGuestModal());
  };

  const handleToggleMembers = () => {
    setShowMembers(!showMembers);
    dispatch(toggleGuestMembers(guest._id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Main Guest Info */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-1"
          />

          {/* Guest Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {guest.name}
              </h3>
              <div className="flex items-center space-x-2 shrink-0">
                {/* Status Badge */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                  {getStatusText(guest.status)}
                </span>

                {/* Invitation Status */}
                <button
                  onClick={handleToggleInvitation}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                    guest.invitationSent
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {guest.invitationSent ? 'Invited' : 'Not Invited'}
                </button>

                {/* Actions: Edit/Delete */}
                <button
                  onClick={handleEdit}
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  title="Edit"
                  aria-label="Edit guest"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 transition-colors duration-200"
                  title="Delete"
                  aria-label="Delete guest"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 mb-3">
              <p className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {guest.contact}
              </p>
              {guest.email && (
                <p className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {guest.email}
                </p>
              )}
              {guest.address && (
                <p className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {guest.address}
                </p>
              )}
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
              {/* Members Toggle */}
              <button
                onClick={handleToggleMembers}
                className="flex items-center space-x-2 text-sm text-pink-600 hover:text-pink-700 transition-colors duration-200"
              >
                <svg className={`w-4 h-4 transition-transform duration-200 ${showMembers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>
                  {guest.members?.length || 0} member{guest.members?.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Right side empty to keep spacing */}
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* Members Section - Slide Down */}
      {showMembers && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Family Members</h4>
            {guest.members && guest.members.length > 0 ? (
              <div className="space-y-2">
                {guest.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200">
                    <span className="text-sm text-gray-700">{member}</span>
                    <button className="text-red-500 hover:text-red-700 transition-colors duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No family members added</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestCard;
