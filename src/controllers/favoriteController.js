const prisma = require('../utils/prisma');

// POST /api/favorites/:houseId  — toggle favorite on/off
const toggleFavorite = async (req, res) => {
  try {
    const houseId = parseInt(req.params.houseId);

    const house = await prisma.house.findUnique({ where: { id: houseId } });
    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        studentId_houseId: { studentId: req.user.id, houseId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ success: true, favorited: false, message: 'Removed from favorites' });
    }

    await prisma.favorite.create({
      data: { studentId: req.user.id, houseId },
    });

    res.status(201).json({ success: true, favorited: true, message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/favorites  — list all favorited houses for current student
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        house: {
          include: {
            landlord: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    const houses = favorites.map((f) => ({
      favoriteId: f.id,
      favoritedAt: f.createdAt,
      ...f.house,
      images:    JSON.parse(f.house.images),
      amenities: JSON.parse(f.house.amenities),
    }));

    res.json({ success: true, total: houses.length, houses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/favorites/check/:houseId  — check if a house is favorited
const checkFavorite = async (req, res) => {
  try {
    const houseId = parseInt(req.params.houseId);

    const existing = await prisma.favorite.findUnique({
      where: {
        studentId_houseId: { studentId: req.user.id, houseId },
      },
    });

    res.json({ success: true, favorited: !!existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { toggleFavorite, getMyFavorites, checkFavorite };