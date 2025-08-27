import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGuests, deleteGuest, bulkUpdateInvitation } from '../store/slices/guestSlice';
import { openGuestModal, toggleGuestSelection, selectAllGuests, clearGuestSelection, setEditingGuest, setFilterTags } from '../store/slices/uiSlice';
import GuestCard from './guests/GuestCard';
import AddGuestModal from './guests/AddGuestModal';
import GuestStats from './guests/GuestStats';

export default function GuestsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);

  const dispatch = useDispatch();
  const { guests, isLoading, error } = useSelector((state) => state.guest);
  const { selectedGuests, isGuestModalOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch(getGuests());
  }, [dispatch]);

  const handleBulkInvite = async () => {
    if (selectedGuests.length === 0) return;

    // Only invite guests who have not been invited yet
    const selectedGuestObjects = guests.filter(g => selectedGuests.includes(g._id));
    const eligibleIds = selectedGuestObjects
      .filter(g => !g.invitationSent)
      .map(g => g._id);

    if (eligibleIds.length === 0) return;

    try {
      // Clear selection first so bulk actions hide immediately
      dispatch(clearGuestSelection());
      await dispatch(bulkUpdateInvitation({
        guestIds: eligibleIds,
        invitationSent: true
      })).unwrap();
      // Refresh list to ensure consistent state
      await dispatch(getGuests());
      
    } catch (err) {
      console.error('Failed to send bulk invitations:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGuests.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedGuests.length} guest(s)?`)) {
      try {
        for (const guestId of selectedGuests) {
          await dispatch(deleteGuest(guestId)).unwrap();
        }
        dispatch(clearGuestSelection());
      } catch (err) {
        console.error('Failed to delete guests:', err);
      }
    }
  };

  const handleSelectAll = () => {
    // Select only guests that have not been invited yet (pending invitations)
    const notInvitedGuests = filteredGuests.filter(g => !g.invitationSent);
    const notInvitedIds = notInvitedGuests.map(g => g._id);
    const allPendingSelected = notInvitedIds.length > 0 && notInvitedIds.every(id => selectedGuests.includes(id));

    if (allPendingSelected) {
      dispatch(clearGuestSelection());
    } else {
      dispatch(selectAllGuests(notInvitedIds));
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.contact?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInvitation =
      selectedStatus === 'all' ||
      (selectedStatus === 'sent' && !!guest.invitationSent) ||
      (selectedStatus === 'pending' && !guest.invitationSent);
    const guestTags = (guest.tags || []).map(t => t?.toLowerCase?.() || t);
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => guestTags.includes(tag));
    return matchesSearch && matchesInvitation && matchesTags;
  });

  const statuses = ['all', 'sent', 'pending'];

  const defaultTags = useMemo(() => [
    'Friend',
    'Relative',
    'Society member',
    'Neighbour',
    'office colleague',
    'College Friend',
    'School Friend',
    'Business Associate',
    'Vip guest',
  ], []);

  const availableTags = useMemo(() => {
    const guestTags = guests.flatMap(g => (g.tags || []).map(t => (t?.toString?.().toLowerCase() || '').trim()).filter(Boolean));
    const base = defaultTags.map(t => t.toLowerCase());
    return Array.from(new Set([...base, ...guestTags]));
  }, [guests, defaultTags]);

  const formatTagLabel = (tag) => {
    // Preserve known defaults' casing; otherwise simple title case
    const match = defaultTags.find(d => d.toLowerCase() === tag);
    if (match) return match;
    return tag.replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-2 sm:space-y-6">
      {/* Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Guest Management</h2>
          <p className="text-gray-600">Manage your wedding guest list and invitations</p>
        </div>
        <button
          onClick={() => { dispatch(setEditingGuest(null)); dispatch(openGuestModal()); }}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Add Guest
        </button>
      </div>

      {/* Guest Stats */}
      <GuestStats />

      <button
          onClick={() => { dispatch(setEditingGuest(null)); dispatch(openGuestModal()); }}
          className="sm:hidden px-6 w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Add Guest
        </button>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="w-full md:basis-1/3 md:shrink-0">
          <input
            type="text"
            placeholder="Search guests by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar py-1"
             style={{ WebkitOverflowScrolling: 'touch' }}>
          {availableTags.map((normalized) => {
            const active = selectedTags.includes(normalized);
            return (
              <button
                key={normalized}
                type="button"
                onClick={() => setSelectedTags(prev => prev.includes(normalized) ? prev.filter(t => t !== normalized) : [...prev, normalized])}
                className={`px-3 py-1 rounded-full border text-sm shrink-0 ${active ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {formatTagLabel(normalized)}
              </button>
            );
          })}
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All' : (status === 'sent' ? 'Sent' : 'Pending')}
            </option>
          ))}
        </select>
      </div>


      {/* Guest List */}
      <div className="space-y-4">
        {/* Select All Checkbox */}
        {filteredGuests.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={(() => {
                const pendingCount = filteredGuests.filter(g => !g.invitationSent).length;
                const selectedPendingCount = filteredGuests.filter(g => !g.invitationSent && selectedGuests.includes(g._id)).length;
                return pendingCount > 0 && selectedPendingCount === pendingCount;
              })()}
              onChange={handleSelectAll}
              className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All Pending ({filteredGuests.filter(g => !g.invitationSent).length})
            </span>
          </div>
        )}

      {/* Bulk Actions */}
      {selectedGuests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedGuests.length} guest(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkInvite}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
                disabled={(() => {
                  const selectedGuestObjects = guests.filter(g => selectedGuests.includes(g._id));
                  const eligibleCount = selectedGuestObjects.filter(g => g.status === 'pending' && !g.invitationSent).length;
                  return eligibleCount === 0;
                })()}
              >
                Send Invitations
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
        {filteredGuests.map((guest) => (
          <GuestCard
            key={guest._id}
            guest={guest}
            isSelected={selectedGuests.includes(guest._id)}
            onSelect={() => dispatch(toggleGuestSelection(guest._id))}
          />
        ))}

        {filteredGuests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
            <p className="text-gray-500">Get started by adding your first wedding guest.</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Guest Modal */}
      <AddGuestModal />
    </div>
  );
}
