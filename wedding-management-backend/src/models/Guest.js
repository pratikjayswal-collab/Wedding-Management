import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true
  },
  members: [{
    type: String,
    trim: true
  }],
  extraMembersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  invitationSent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending'
  },
  plusOne: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
guestSchema.index({ userId: 1, status: 1 });
guestSchema.index({ userId: 1, invitationSent: 1 });

export default mongoose.model('Guest', guestSchema);
