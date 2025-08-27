import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleInvitation, deleteGuest } from '../../store/slices/guestSlice';
import { setEditingGuest, openGuestModal } from '../../store/slices/uiSlice';

export default function GuestCard({ guest, isSelected = false, onSelect }) {
  const dispatch = useDispatch();

  const handleToggleInvitation = async () => {
    try {
      await dispatch(toggleInvitation(guest._id)).unwrap();
    } catch (err) {
      console.error('Failed to toggle invitation status:', err);
    }
  };

  const handleEdit = () => {
    dispatch(setEditingGuest(guest));
    dispatch(openGuestModal());
  };

  const handleDeleteGuest = async () => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await dispatch(deleteGuest(guest._id)).unwrap();
      } catch (err) {
        console.error('Failed to delete guest:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      default: return '?';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 focus:ring-2 mt-1"
        />

        {/* Guest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{guest.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                    guest.invitationSent
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {guest.invitationSent ? 'Sent' : 'Pending'}
                </span>
                {!!guest.extraMembersCount && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200">
                    Extra: {guest.extraMembersCount}
                  </span>
                )}
              </div>
              {guest.contact && (
                <p className="text-sm text-gray-600 mt-1">{guest.contact}</p>
              )}
            </div>

          </div>

          {/* Members UI removed */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEdit}
            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit Guest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!guest.invitationSent && (
            <button
              onClick={handleDeleteGuest}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete Guest"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
