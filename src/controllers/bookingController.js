const nodemailer = require('nodemailer');
const prisma = require('../utils/prisma');
const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

// POST /api/bookings  — student sends a booking / pre-order
const createBooking = async (req, res) => {
  try {
    const { houseId, message, visitDate } = req.body;

    if (!houseId) return res.status(400).json({ success: false, message: 'houseId is required' });

    const house = await prisma.house.findUnique({
      where: { id: parseInt(houseId) },
      include: { landlord: true },
    });

    if (!house) return res.status(404).json({ success: false, message: 'House not found' });
    if (house.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'House is not available' });
    }

    // Prevent duplicate pending booking
    const existing = await prisma.booking.findFirst({
      where: { houseId: parseInt(houseId), studentId: req.user.id, status: 'PENDING' },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have a pending booking for this house' });
    }

    const booking = await prisma.booking.create({
      data: {
        houseId: parseInt(houseId),
        studentId: req.user.id,
        message,
        visitDate: visitDate ? new Date(visitDate) : null,
        status: 'PENDING',
      },
      include: {
        house: { select: { title: true, address: true, district: true } },
        student: { select: { fullName: true, email: true, phone: true } },
      },
    });

    // Mark house as PENDING
    await prisma.house.update({ where: { id: parseInt(houseId) }, data: { status: 'PENDING' } });

    // Email landlord
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Find House HCMC" <${process.env.EMAIL_USER}>`,
        to: house.landlord.email,
        subject: `New Booking Request – ${house.title}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Student:</strong> ${req.user.fullName} (${req.user.email})</p>
          <p><strong>Phone:</strong> ${req.user.phone || 'N/A'}</p>
          <p><strong>House:</strong> ${house.title} – ${house.address}, ${house.district}</p>
          <p><strong>Message:</strong> ${message || 'No message'}</p>
          ${visitDate ? `<p><strong>Requested Visit Date:</strong> ${new Date(visitDate).toLocaleDateString('vi-VN')}</p>` : ''}
          <p>Please log in to approve or reject this booking.</p>
        `,
      });
    } catch (emailErr) {
      console.warn('Email sending failed:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Booking submitted', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/my  — student's own bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        house: {
          select: { id: true, title: true, address: true, district: true, price: true, images: true },
        },
      },
    });

    res.json({
      success: true,
      bookings: bookings.map((b) => ({
        ...b,
        house: { ...b.house, images: JSON.parse(b.house.images) },
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/house/:houseId  — landlord sees bookings for their house
const getBookingsForHouse = async (req, res) => {
  try {
    const house = await prisma.house.findUnique({ where: { id: parseInt(req.params.houseId) } });
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });

    if (req.user.role === 'LANDLORD' && house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your house' });
    }

    const bookings = await prisma.booking.findMany({
      where: { houseId: parseInt(req.params.houseId) },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/status  — landlord approves/rejects
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['APPROVED', 'REJECTED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status` });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { house: true, student: true },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Landlord can only manage bookings of their own house
    if (req.user.role === 'LANDLORD' && booking.house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your house' });
    }
    // Student can only cancel their own booking
    if (req.user.role === 'STUDENT' && (booking.studentId !== req.user.id || status !== 'CANCELLED')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });

    // If rejected/cancelled restore house to AVAILABLE
    if (status === 'REJECTED' || status === 'CANCELLED') {
      await prisma.house.update({ where: { id: booking.houseId }, data: { status: 'AVAILABLE' } });
    }

    // Notify student by email
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Find House HCMC" <${process.env.EMAIL_USER}>`,
        to: booking.student.email,
        subject: `Booking ${status} – ${booking.house.title}`,
        html: `
          <h2>Your booking has been <strong>${status}</strong></h2>
          <p><strong>House:</strong> ${booking.house.title}</p>
          <p><strong>Address:</strong> ${booking.house.address}, ${booking.house.district}</p>
          ${status === 'APPROVED' ? '<p>Please contact the landlord to proceed with the contract.</p>' : ''}
        `,
      });
    } catch (e) {
      console.warn('Email failed:', e.message);
    }

    res.json({ success: true, message: `Booking ${status}`, booking: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings  — staff sees all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        house: { select: { id: true, title: true, district: true } },
        student: { select: { id: true, fullName: true, email: true } },
      },
    });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingsForHouse, updateBookingStatus, getAllBookings };
