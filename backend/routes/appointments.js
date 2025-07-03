const express = require('express');
const Appointment = require('../models/Appointment');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateAppointment, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get all appointments (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sort = 'appointmentDate'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const sortOptions = {};
    switch (sort) {
      case 'date-asc':
        sortOptions.appointmentDate = 1;
        break;
      case 'date-desc':
        sortOptions.appointmentDate = -1;
        break;
      case 'created':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.appointmentDate = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(filter)
      .populate('userId', 'email firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/appointments/user/:userId
// @desc    Get appointments for specific user
// @access  Private
router.get('/user/:userId', authenticateToken, validateObjectId, async (req, res) => {
  try {
    // Users can only see their own appointments, admins can see any
    if (req.user._id.toString() !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find({ userId: req.params.userId })
      .sort({ appointmentDate: -1 });

    res.json({ appointments });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'email firstName lastName');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Users can only see their own appointments, admins can see any
    if (appointment.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', authenticateToken, validateAppointment, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      userId: req.user._id
    };

    // Check for conflicting appointments (same date/time)
    const existingAppointment = await Appointment.findOne({
      appointmentDate: appointmentData.appointmentDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        error: 'This time slot is already booked. Please choose a different time.' 
      });
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate user data for response
    await appointment.populate('userId', 'email firstName lastName');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Users can only update their own appointments, admins can update any
    if (appointment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent updating past appointments
    if (appointment.appointmentDate < new Date() && !req.user.isAdmin) {
      return res.status(400).json({ error: 'Cannot update past appointments' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'email firstName lastName');

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private/Admin
router.put('/:id/status', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { status, adminNotes, cancellationReason } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed', 'no-show'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'cancelled' && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'email firstName lastName');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Users can only delete their own appointments, admins can delete any
    if (appointment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent deleting past appointments
    if (appointment.appointmentDate < new Date() && !req.user.isAdmin) {
      return res.status(400).json({ error: 'Cannot delete past appointments' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/appointments/stats/overview
// @desc    Get appointment statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    const totalRevenue = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;