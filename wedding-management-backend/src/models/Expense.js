import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['paid', 'due'],
    index: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  items: [itemSchema],
  documents: [
    new mongoose.Schema({
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }, { _id: false })
  ],
  total: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total before saving
expenseSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + item.cost, 0);
  next();
});

// Index for better query performance
expenseSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);
