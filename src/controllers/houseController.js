const prisma = require('../utils/prisma');

// ── Whitelisted fields a landlord/staff may edit via PUT /houses/:id ──────────
// Keeping this explicit prevents someone from POSTing landlordId, status,
// createdAt, etc. in the request body and having them written straight to the DB.
const EDITABLE_FIELDS = [
  'title', 'description', 'address', 'district', 'ward',
  'area', 'price', 'deposit', 'maxTenants',
  'interior', 'type',
  'contactEmail', 'contactPhone',
];

// GET /api/houses  — public search with filters
const getHouses = async (req, res) => {
  try {
    const {
      district, type, interior,
      minPrice, maxPrice, minArea, maxArea,
      status = 'AVAILABLE',
      keyword,
      page = 1, limit = 10,
      sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const where = {};
    if (status)   where.status   = status;
    if (district) where.district = { contains: district };
    if (type)     where.type     = type;
    if (interior) where.interior = interior;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }
    if (keyword) {
      where.OR = [
        { title:       { contains: keyword } },
        { description: { contains: keyword } },
        { address:     { contains: keyword } },
        { district:    { contains: keyword } },
      ];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await prisma.house.count({ where });

    const houses = await prisma.house.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: order },
      include: {
        landlord: {
          select: { id: true, fullName: true, email: true, phone: true, avatar: true },
        },
      },
    });

    const formatted = houses.map((h) => ({
      ...h,
      images:    JSON.parse(h.images),
      amenities: JSON.parse(h.amenities),
    }));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      houses: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/houses/:id
const getHouseById = async (req, res) => {
  try {
    const house = await prisma.house.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        landlord: {
          select: { id: true, fullName: true, email: true, phone: true, avatar: true },
        },
      },
    });

    if (!house) return res.status(404).json({ success: false, message: 'House not found' });

    res.json({
      success: true,
      house: {
        ...house,
        images:    JSON.parse(house.images),
        amenities: JSON.parse(house.amenities),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/houses  — landlord only
const createHouse = async (req, res) => {
  try {
    const {
      title, description, address, district, ward,
      area, price, deposit, maxTenants, interior, type,
      contactEmail, contactPhone, amenities,
    } = req.body;

    // description is intentionally optional — a landlord can fill it in later
    if (!title || !address || !district || !area || !price || !interior || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields: title, address, district, area, price, interior, type' });
    }

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const house = await prisma.house.create({
      data: {
        title,
        description:  description || null,
        address,
        district,
        ward:         ward || null,
        area:         parseFloat(area),
        price:        parseFloat(price),
        deposit:      deposit ? parseFloat(deposit) : null,
        maxTenants:   maxTenants ? parseInt(maxTenants, 10) : 1,
        interior,
        type,
        contactEmail: contactEmail || req.user.email,
        contactPhone: contactPhone || req.user.phone,
        images:       JSON.stringify(images),
        amenities:    amenities ? JSON.stringify(JSON.parse(amenities)) : JSON.stringify([]),
        landlordId:   req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'House listed successfully',
      house: {
        ...house,
        images,
        amenities: JSON.parse(house.amenities),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/houses/:id  — landlord (own house) or staff
const updateHouse = async (req, res) => {
  try {
    const house = await prisma.house.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });

    if (req.user.role === 'LANDLORD' && house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your listing' });
    }

    // ── Build a safe update object from whitelisted fields only ──────────────
    // This prevents req.body from overwriting landlordId, status, createdAt, etc.
    const updateData = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // ── Type coercions ────────────────────────────────────────────────────────
    if (updateData.price)      updateData.price      = parseFloat(updateData.price);
    if (updateData.area)       updateData.area       = parseFloat(updateData.area);
    if (updateData.deposit)    updateData.deposit    = parseFloat(updateData.deposit);
    // FIX: maxTenants must be an Int — previously this was left as a string
    if (updateData.maxTenants !== undefined) {
      updateData.maxTenants = parseInt(updateData.maxTenants, 10);
    }

    // ── Handle image upload ───────────────────────────────────────────────────
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      const existing  = JSON.parse(house.images);
      updateData.images = JSON.stringify([...existing, ...newImages]);
    }

    // ── Handle amenities ──────────────────────────────────────────────────────
    if (req.body.amenities) {
      updateData.amenities = JSON.stringify(JSON.parse(req.body.amenities));
    }

    const updated = await prisma.house.update({
      where: { id: parseInt(req.params.id) },
      data:  updateData,
    });

    res.json({
      success: true,
      message: 'House updated',
      house: {
        ...updated,
        images:    JSON.parse(updated.images),
        amenities: JSON.parse(updated.amenities),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/houses/:id  — landlord (own) or staff
const deleteHouse = async (req, res) => {
  try {
    const house = await prisma.house.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });

    if (req.user.role === 'LANDLORD' && house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your listing' });
    }

    await prisma.house.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'House deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/houses/landlord/my — landlord's own listings
// NOTE: this route is registered BEFORE /:id in houses.js to avoid Express
// matching "landlord" as an :id param (which would parseInt to NaN and crash).
const getMyHouses = async (req, res) => {
  try {
    const houses = await prisma.house.findMany({
      where:   { landlordId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      houses: houses.map((h) => ({
        ...h,
        images:    JSON.parse(h.images),
        amenities: JSON.parse(h.amenities),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/houses/:id/status  — landlord updates AVAILABLE / RENTED / INACTIVE
const updateHouseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['AVAILABLE', 'RENTED', 'INACTIVE'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const house = await prisma.house.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });

    if (req.user.role === 'LANDLORD' && house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your listing' });
    }

    const updated = await prisma.house.update({
      where: { id: parseInt(req.params.id) },
      data:  { status },
    });

    res.json({ success: true, message: `House status updated to ${status}`, house: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getHouses, getHouseById, createHouse,
  updateHouse, deleteHouse, getMyHouses, updateHouseStatus,
};
