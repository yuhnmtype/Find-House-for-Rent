const prisma = require('../utils/prisma');

const LISTING_FEE = parseFloat(process.env.LISTING_FEE) || 100000; // 100,000 VND default

// POST /api/payments/generate  — staff generates monthly fees for all landlords
const generateMonthlyFees = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ success: false, message: 'month and year required' });

    const landlords = await prisma.user.findMany({
      where: { role: 'LANDLORD', isActive: true },
    });

    const created = [];
    for (const landlord of landlords) {
      const existing = await prisma.payment.findFirst({
        where: { userId: landlord.id, month: parseInt(month), year: parseInt(year), type: 'LISTING_FEE' },
      });
      if (!existing) {
        const p = await prisma.payment.create({
          data: {
            userId: landlord.id,
            type: 'LISTING_FEE',
            amount: LISTING_FEE,
            month: parseInt(month),
            year: parseInt(year),
            status: 'PENDING',
          },
        });
        created.push(p);
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${created.length} fee records for ${month}/${year}`,
      payments: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/my  — landlord sees their payment history
const getMyPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/payments/:id/pay  — landlord marks a fee as paid
const markAsPaid = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (req.user.role === 'LANDLORD' && payment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your payment' });
    }

    const updated = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'PAID', paidAt: new Date() },
    });

    res.json({ success: true, message: 'Payment marked as paid', payment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments  — staff sees all payments
const getAllPayments = async (req, res) => {
  try {
    const { status, month, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const payments = await prisma.payment.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/stats  — staff dashboard stats
const getPaymentStats = async (req, res) => {
  try {
    const [total, paid, pending, overdue] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PAID' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'OVERDUE' } }),
    ]);
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });
    res.json({
      success: true,
      stats: {
        total, paid, pending, overdue,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateMonthlyFees, getMyPayments, markAsPaid, getAllPayments, getPaymentStats };
