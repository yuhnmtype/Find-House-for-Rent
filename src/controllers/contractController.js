const prisma = require('../utils/prisma');

// POST /api/contracts  — landlord creates a contract after booking approved
const createContract = async (req, res) => {
  try {
    const { houseId, studentId, startDate, endDate, monthlyRent, depositPaid, terms } = req.body;

    if (!houseId || !studentId || !startDate || !endDate || !monthlyRent) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const house = await prisma.house.findUnique({ where: { id: parseInt(houseId) } });
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });

    if (req.user.role === 'LANDLORD' && house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your house' });
    }

    // fix #1a: reject if house already has an active contract
    const activeContract = await prisma.contract.findFirst({
      where: { houseId: parseInt(houseId), status: 'ACTIVE' },
    });
    if (activeContract) {
      return res.status(409).json({ success: false, message: 'House already has an active contract' });
    }

    // fix #1b: require an approved booking from this student for this house
    const approvedBooking = await prisma.booking.findFirst({
      where: {
        houseId:   parseInt(houseId),
        studentId: parseInt(studentId),
        status:    'APPROVED',
      },
    });
    if (!approvedBooking) {
      return res.status(400).json({ success: false, message: 'No approved booking found for this student and house' });
    }

    const contract = await prisma.contract.create({
      data: {
        houseId:     parseInt(houseId),
        studentId:   parseInt(studentId),
        startDate:   new Date(startDate),
        endDate:     new Date(endDate),
        monthlyRent: parseFloat(monthlyRent),
        depositPaid: depositPaid ? parseFloat(depositPaid) : 0,
        terms,
        status: 'ACTIVE',
      },
      include: {
        house:   { select: { title: true, address: true, district: true } },
        student: { select: { fullName: true, email: true } },
      },
    });

    // mark house as RENTED
    await prisma.house.update({
      where: { id: parseInt(houseId) },
      data:  { status: 'RENTED' },
    });

    // auto-reject all other pending bookings for this house
    await prisma.booking.updateMany({
      where: {
        houseId: parseInt(houseId),
        status:  'PENDING',
        id:      { not: approvedBooking.id },
      },
      data: { status: 'REJECTED' },
    });

    res.status(201).json({ success: true, message: 'Contract created', contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/contracts/my  — student views their contracts
const getMyContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = { studentId: req.user.id };
    if (status) where.status = status;

    const total     = await prisma.contract.count({ where });
    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        house: { select: { id: true, title: true, address: true, district: true } },
      },
    });

    res.json({
      success: true,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      contracts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/contracts/house/:houseId  — landlord sees their house contracts
const getContractsByHouse = async (req, res) => {
  try {
    const house = await prisma.house.findUnique({ where: { id: parseInt(req.params.houseId) } });
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });
    if (req.user.role === 'LANDLORD' && house.landlordId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your house' });
    }

    const contracts = await prisma.contract.findMany({
      where:   { houseId: parseInt(req.params.houseId) },
      orderBy: { createdAt: 'desc' },
      include: { student: { select: { fullName: true, email: true, phone: true } } },
    });

    res.json({ success: true, total: contracts.length, contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/contracts  — staff sees all contracts
const getAllContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;

    const total     = await prisma.contract.count({ where });
    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        house:   { select: { id: true, title: true, district: true } },
        student: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.json({
      success: true,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      contracts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/contracts/:id/terminate
const terminateContract = async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: { house: true },
    });
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    // fix #2 minor: only allow terminating an ACTIVE contract
    if (contract.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: `Contract is already ${contract.status.toLowerCase()}` });
    }

    await prisma.contract.update({
      where: { id: parseInt(req.params.id) },
      data:  { status: 'TERMINATED' },
    });

    await prisma.house.update({
      where: { id: contract.houseId },
      data:  { status: 'AVAILABLE' },
    });

    res.json({ success: true, message: 'Contract terminated, house is now available again' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createContract, getMyContracts, getContractsByHouse, getAllContracts, terminateContract };