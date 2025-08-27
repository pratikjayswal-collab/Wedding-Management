import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  linkedExpense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
requirementSchema.index({ userId: 1, status: 1 });
requirementSchema.index({ userId: 1, priority: 1 });
requirementSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model('Requirement', requirementSchema);
