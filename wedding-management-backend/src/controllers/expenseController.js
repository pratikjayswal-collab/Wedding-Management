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

    const expense = await Expense.create({
      category,
      budget: budget || 0,
      status: status || 'due',
      notes: notes || '',
      items: [],
      userId: req.user._id,
    });

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

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { category, budget, status, notes },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

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
    const stats = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$total' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    res.json(stats[0] || {
      totalCategories: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalItems: 0
    });
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
