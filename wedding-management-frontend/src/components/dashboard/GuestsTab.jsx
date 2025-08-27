import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGuests, deleteGuest, bulkUpdateInvitation } from '../../store/slices/guestSlice';
import { openGuestModal, toggleGuestSelection, selectAllGuests, clearGuestSelection } from '../../store/slices/uiSlice';
import GuestCard from './guests/GuestCard';
import AddGuestModal from './guests/AddGuestModal';
import GuestStats from './guests/GuestStats';

const GuestsTab = () => {
  const dispatch = useDispatch();
  const { guests, isLoading } = useSelector((state) => state.guests);
  const { selectedGuests } = useSelector((state) => state.ui);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getGuests());
  }, [dispatch]);

  const handleAddGuest = () => {
    dispatch(openGuestModal());
  };

  const handleBulkInvite = () => {
    if (selectedGuests.length > 0) {
      dispatch(bulkUpdateInvitation({ guestIds: selectedGuests, invitationSent: true }));
      dispatch(clearGuestSelection());
    }
  };

  const handleBulkDelete = () => {
    if (selectedGuests.length > 0) {
      // Show confirmation modal
      if (window.confirm(`Are you sure you want to delete ${selectedGuests.length} guest(s)?`)) {
        selectedGuests.forEach(guestId => {
          dispatch(deleteGuest(guestId));
        });
        dispatch(clearGuestSelection());
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedGuests.length === guests.length) {
      dispatch(clearGuestSelection());
    } else {
      dispatch(selectAllGuests(guests.map(guest => guest._id)));
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">Guest List</h1>
          <p className="text-gray-600 mt-1">Manage your wedding guests and invitations</p>
        </div>
        <button
          onClick={handleAddGuest}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Guest
        </button>
      </div>

      {/* Stats */}
      <GuestStats />

      {/* Search and Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search guests by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Bulk Actions */}
        {selectedGuests.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedGuests.length === guests.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedGuests.length} guest(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkInvite}
                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Send Invites
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Select All */}
        {guests.length > 0 && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedGuests.length === guests.length && guests.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Select all guests</span>
          </div>
        )}
      </div>

      {/* Guest List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first guest.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddGuest}
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white text-sm font-medium rounded-lg hover:bg-pink-600 transition-colors duration-200"
            >
              Add Your First Guest
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest._id}
              guest={guest}
              isSelected={selectedGuests.includes(guest._id)}
              onSelect={() => dispatch(toggleGuestSelection(guest._id))}
            />
          ))}
        </div>
      )}

      {/* Add Guest Modal */}
      <AddGuestModal />
    </div>
  );
};

export default GuestsTab;
