import Requirement from '../models/Requirement.js';

// @desc    Get all requirements for a user
// @route   GET /api/requirements
// @access  Private
export const getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(requirements);
  } catch (error) {
    console.error('Get requirements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single requirement
// @route   GET /api/requirements/:id
// @access  Private
export const getRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findOne({ _id: req.params.id, userId: req.user._id });
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    res.json(requirement);
  } catch (error) {
    console.error('Get requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new requirement
// @route   POST /api/requirements
// @access  Private
export const createRequirement = async (req, res) => {
  try {
    const { item, description, priority, dueDate, category, linkedExpense } = req.body;

    const requirement = await Requirement.create({
      item,
      description,
      priority: priority || 'medium',
      dueDate,
      category: category || 'general',
      linkedExpense,
      userId: req.user._id,
    });

    res.status(201).json(requirement);
  } catch (error) {
    console.error('Create requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update requirement
// @route   PUT /api/requirements/:id
// @access  Private
export const updateRequirement = async (req, res) => {
  try {
    const { item, description, priority, dueDate, category, linkedExpense } = req.body;

    const requirement = await Requirement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        item,
        description,
        priority,
        dueDate,
        category,
        linkedExpense,
      },
      { new: true, runValidators: true }
    );

    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    res.json(requirement);
  } catch (error) {
    console.error('Update requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete requirement
// @route   DELETE /api/requirements/:id
// @access  Private
export const deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    res.json({ message: 'Requirement removed' });
  } catch (error) {
    console.error('Delete requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle requirement status
// @route   PATCH /api/requirements/:id/status
// @access  Private
export const toggleRequirementStatus = async (req, res) => {
  try {
    const requirement = await Requirement.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    requirement.status = requirement.status === 'pending' ? 'done' : 'pending';
    await requirement.save();

    res.json(requirement);
  } catch (error) {
    console.error('Toggle requirement status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk update requirement status
// @route   PATCH /api/requirements/bulk-status
// @access  Private
export const bulkUpdateRequirementStatus = async (req, res) => {
  try {
    const { requirementIds, status } = req.body;

    const result = await Requirement.updateMany(
      { _id: { $in: requirementIds }, userId: req.user._id },
      { status }
    );

    res.json({ message: `${result.modifiedCount} requirements updated` });
  } catch (error) {
    console.error('Bulk update requirement status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get requirements by status
// @route   GET /api/requirements/status/:status
// @access  Private
export const getRequirementsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const requirements = await Requirement.find({ 
      userId: req.user._id, 
      status 
    }).sort({ priority: -1, dueDate: 1 });
    
    res.json(requirements);
  } catch (error) {
    console.error('Get requirements by status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get requirement statistics
// @route   GET /api/requirements/stats
// @access  Private
export const getRequirementStats = async (req, res) => {
  try {
    const stats = await Requirement.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      pending: 0,
      done: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    });
  } catch (error) {
    console.error('Get requirement stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
