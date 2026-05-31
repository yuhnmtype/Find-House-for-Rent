const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
// GET /api/users  — staff sees all users with role filter
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, fullName: true, email: true,
        phone: true, role: true, isActive: true, createdAt: true,
      },
    });

    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, fullName: true, email: true, phone: true,
        role: true, isActive: true, createdAt: true,
        houses: {
          select: { id: true, title: true, status: true, district: true, price: true },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/users/:id/status  — staff activates/deactivates a user
const toggleUserStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: !user.isActive },
      select: { id: true, fullName: true, email: true, isActive: true },
    });

    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'}`,
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users  — staff creates a new staff account
const createStaff = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'fullName, email, and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, phone, role: 'STAFF' },
      select: { id: true, fullName: true, email: true, role: true },
    });

    res.status(201).json({ success: true, message: 'Staff account created', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/dashboard/stats  — staff dashboard overview
const getDashboardStats = async (req, res) => {
  try {
    const [students, landlords, totalHouses, availableHouses, rentedHouses, activeContracts] =
      await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'LANDLORD' } }),
        prisma.house.count(),
        prisma.house.count({ where: { status: 'AVAILABLE' } }),
        prisma.house.count({ where: { status: 'RENTED' } }),
        prisma.contract.count({ where: { status: 'ACTIVE' } }),
      ]);

    res.json({
      success: true,
      stats: { students, landlords, totalHouses, availableHouses, rentedHouses, activeContracts },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, toggleUserStatus, createStaff, getDashboardStats };
