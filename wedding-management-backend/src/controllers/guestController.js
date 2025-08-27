import Guest from '../models/Guest.js';

// @desc    Get all guests for a user
// @route   GET /api/guests
// @access  Private
export const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single guest
// @route   GET /api/guests/:id
// @access  Private
export const getGuest = async (req, res) => {
  try {
    const guest = await Guest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.json(guest);
  } catch (error) {
    console.error('Get guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new guest
// @route   POST /api/guests
// @access  Private
export const createGuest = async (req, res) => {
  try {
    const { name, contact, email, address, members, plusOne, notes, extraMembersCount, tags } = req.body;

    const guest = await Guest.create({
      name,
      contact,
      email,
      address,
      members: members || [],
      plusOne: plusOne || false,
      notes,
      extraMembersCount: typeof extraMembersCount === 'number' ? extraMembersCount : 0,
      userId: req.user._id,
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json(guest);
  } catch (error) {
    console.error('Create guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
// @access  Private
export const updateGuest = async (req, res) => {
  try {
    const { name, contact, email, address, members, plusOne, notes, status, extraMembersCount, tags } = req.body;

    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name,
        contact,
        email,
        address,
        members: members || [],
        plusOne: plusOne || false,
        notes,
        status,
        extraMembersCount: typeof extraMembersCount === 'number' ? extraMembersCount : 0,
        tags: Array.isArray(tags) ? tags : [],
      },
      { new: true, runValidators: true }
    );

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json(guest);
  } catch (error) {
    console.error('Update guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Private
export const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json({ message: 'Guest removed' });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle invitation sent status
// @route   PATCH /api/guests/:id/invitation
// @access  Private
export const toggleInvitation = async (req, res) => {
  try {
    const guest = await Guest.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    guest.invitationSent = !guest.invitationSent;
    await guest.save();

    res.json(guest);
  } catch (error) {
    console.error('Toggle invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk update invitation status
// @route   PATCH /api/guests/bulk-invitation
// @access  Private
export const bulkUpdateInvitation = async (req, res) => {
  try {
    const { guestIds, invitationSent } = req.body;

    const result = await Guest.updateMany(
      { _id: { $in: guestIds }, userId: req.user._id },
      { invitationSent }
    );

    res.json({ message: `${result.modifiedCount} guests updated` });
  } catch (error) {
    console.error('Bulk update invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get guest statistics
// @route   GET /api/guests/stats
// @access  Private
export const getGuestStats = async (req, res) => {
  try {
    const stats = await Guest.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          declined: { $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] } },
          invitationSent: { $sum: { $cond: ['$invitationSent', 1, 0] } },
          totalMembers: { $sum: { $ifNull: ['$extraMembersCount', 0] } }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      confirmed: 0,
      pending: 0,
      declined: 0,
      invitationSent: 0,
      totalMembers: 0
    });
  } catch (error) {
    console.error('Get guest stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
