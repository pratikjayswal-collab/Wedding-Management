import Expense from '../models/Expense.js';

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new expense category
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { category, budget, status, notes } = req.body;

    const files = Array.isArray(req.files) ? req.files : [];
    const documents = files.map(f => {
      // Path exposed via /uploads should be relative from uploads root
      const pathParts = f.path.split('uploads');
      const relative = pathParts.length > 1 ? `/uploads${pathParts[1].replace(/\\/g, '/')}` : f.path;
      return {
        filename: f.filename,
        originalName: f.originalname,
        path: relative,
        size: f.size,
        mimeType: f.mimetype,
      };
    });

    const expenseData = {
      category,
      budget: budget || 0,
      notes: notes || '',
      items: [],
      documents,
      userId: req.user._id,
    };
    if (status === 'paid' || status === 'due') {
      expenseData.status = status;
    }
    const expense = await Expense.create(expenseData);

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update expense category
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const { category, budget, status, notes } = req.body;

    const files = Array.isArray(req.files) ? req.files : [];
    const newDocuments = files.map(f => {
      const pathParts = f.path.split('uploads');
      const relative = pathParts.length > 1 ? `/uploads${pathParts[1].replace(/\\/g, '/')}` : f.path;
      return {
        filename: f.filename,
        originalName: f.originalname,
        path: relative,
        size: f.size,
        mimeType: f.mimetype,
      };
    });

    const update = { category, budget, notes };
    if (status === 'paid' || status === 'due') {
      update.status = status;
    } else if (status === '' || status === undefined) {
      update.status = undefined; // leave as is; do not force
    }

    // Fetch, mutate (append documents), then save
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (newDocuments.length > 0) {
      expense.documents = [...(expense.documents || []), ...newDocuments];
    }
    if (update.category !== undefined) expense.category = update.category;
    if (update.budget !== undefined) expense.budget = update.budget;
    if (update.notes !== undefined) expense.notes = update.notes;
    if (update.status !== undefined) expense.status = update.status; // when omitted, keep previous
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete expense category
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense category removed' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to expense category
// @route   POST /api/expenses/:id/items
// @access  Private
export const addExpenseItem = async (req, res) => {
  try {
    const { name, cost, description } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.items.push({ name, cost, description });
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Add expense item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update expense item
// @route   PUT /api/expenses/:id/items/:itemId
// @access  Private
export const updateExpenseItem = async (req, res) => {
  try {
    const { name, cost, description } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const item = expense.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.name = name;
    item.cost = cost;
    item.description = description;
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Update expense item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete expense item
// @route   DELETE /api/expenses/:id/items/:itemId
// @access  Private
export const deleteExpenseItem = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.items.pull(req.params.itemId);
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Delete expense item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
export const getExpenseStats = async (req, res) => {
  try {
    // First, let's see what expenses exist for this user
    const allExpenses = await Expense.find({ userId: req.user._id });
    console.log('All expenses for user:', allExpenses.map(e => ({
      category: e.category,
      status: e.status,
      budget: e.budget,
      total: e.total
    })));

    const stats = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$total' },
          totalItems: { $sum: { $size: '$items' } },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$budget', 0] } },
          due: { $sum: { $cond: [{ $eq: ['$status', 'due'] }, '$budget', 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalCategories: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalItems: 0,
      paid: 0,
      due: 0
    };

    console.log('Calculated stats:', result);
    res.json(result);
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get expenses by category for charts
// @route   GET /api/expenses/chart-data
// @access  Private
export const getExpenseChartData = async (req, res) => {
  try {
    const chartData = await Expense.find({ userId: req.user._id })
      .select('category total budget')
      .sort({ total: -1 });

    res.json(chartData);
  } catch (error) {
    console.error('Get expense chart data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
