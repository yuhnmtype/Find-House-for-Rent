const prisma = require('../utils/prisma');

// GET /api/history  — student sees their own view history
const getMyHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await prisma.viewHistory.count({
      where: { studentId: req.user.id },
    });

    const records = await prisma.viewHistory.findMany({
      where:   { studentId: req.user.id },
      orderBy: { viewedAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        house: {
          select: {
            id: true, title: true, address: true,
            district: true, price: true, type: true,
            interior: true, status: true, images: true,
          },
        },
      },
    });

    const history = records.map((r) => ({
      historyId: r.id,
      viewedAt:  r.viewedAt,
      house: {
        ...r.house,
        images: JSON.parse(r.house.images),
      },
    }));

    res.json({
      success: true,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      history,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/history  — clear all view history
const clearHistory = async (req, res) => {
  try {
    await prisma.viewHistory.deleteMany({
      where: { studentId: req.user.id },
    });
    res.json({ success: true, message: 'View history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyHistory, clearHistory };