const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../utils/prisma');

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// POST /api/ai/chat  — student asks questions about housing
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const model = getModel();

    const systemContext = `
      You are a helpful housing assistant for students in Ho Chi Minh City, Vietnam.
      You help students find suitable houses and rooms for rent.
      You know about districts like Thu Duc, Binh Thanh, Quan 7, Quan 1, Go Vap, Tan Binh, etc.
      Answer only questions related to housing, renting, and living in Ho Chi Minh City.
      Keep answers concise and practical. Reply in the same language the user writes in.
      If asked about something unrelated to housing, politely redirect to housing topics.
    `;

    const prompt = `${systemContext}\n\nStudent question: ${message}`;
    const result = await model.generateContent(prompt);
    const reply  = result.response.text();

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/ai/recommend  — suggest houses based on student view/favorite history
const recommend = async (req, res) => {
  try {
    // gather student's recent activity
    const [recentViews, favorites] = await Promise.all([
      prisma.viewHistory.findMany({
        where:   { studentId: req.user.id },
        orderBy: { viewedAt: 'desc' },
        take:    10,
        include: {
          house: {
            select: {
              district: true, type: true, interior: true,
              price: true, area: true, amenities: true,
            },
          },
        },
      }),
      prisma.favorite.findMany({
        where:   { studentId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take:    5,
        include: {
          house: {
            select: {
              district: true, type: true, interior: true,
              price: true, area: true, amenities: true,
            },
          },
        },
      }),
    ]);

    // build preference summary from history
    const viewedDistricts  = recentViews.map((v) => v.house.district);
    const viewedTypes      = recentViews.map((v) => v.house.type);
    const viewedPrices     = recentViews.map((v) => v.house.price);
    const favDistricts     = favorites.map((f) => f.house.district);
    const favTypes         = favorites.map((f) => f.house.type);

    const avgPrice = viewedPrices.length
      ? Math.round(viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length)
      : null;

    // find candidate houses not yet viewed or favorited
    const excludeHouseIds = [
      ...recentViews.map((v) => v.houseId),
      ...favorites.map((f) => f.houseId),
    ];

    const candidates = await prisma.house.findMany({
      where: {
        status: 'AVAILABLE',
        id:     { notIn: excludeHouseIds.length ? excludeHouseIds : [0] },
      },
      take: 20,
      include: {
        landlord: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    if (candidates.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        reason: 'No new houses available at the moment.',
      });
    }

    // ask Gemini to pick the best matches and explain why
    const model = getModel();

    const prompt = `
      You are a housing recommendation engine for students in Ho Chi Minh City.

      Student activity summary:
      - Recently viewed districts: ${[...new Set(viewedDistricts)].join(', ') || 'none'}
      - Recently viewed types: ${[...new Set(viewedTypes)].join(', ') || 'none'}
      - Favorited districts: ${[...new Set(favDistricts)].join(', ') || 'none'}
      - Favorited types: ${[...new Set(favTypes)].join(', ') || 'none'}
      - Average price viewed: ${avgPrice ? avgPrice.toLocaleString() + ' VND' : 'unknown'}

      Available houses (JSON):
      ${JSON.stringify(candidates.map((h) => ({
        id:       h.id,
        title:    h.title,
        district: h.district,
        type:     h.type,
        interior: h.interior,
        price:    h.price,
        area:     h.area,
        amenities: JSON.parse(h.amenities),
      })))}

      Select the top 3 house IDs that best match the student's preferences.
      Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
      {
        "recommendations": [
          { "id": 1, "reason": "short reason in the same language as student activity" },
          { "id": 2, "reason": "..." },
          { "id": 3, "reason": "..." }
        ]
      }
    `;

    const result   = await model.generateContent(prompt);
    const rawText  = result.response.text().trim();

    let parsed;
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({ success: false, message: 'AI response could not be parsed' });
    }

    // map recommended IDs back to full house objects
    const houseMap = Object.fromEntries(candidates.map((h) => [h.id, h]));

    const recommendations = parsed.recommendations
      .filter((r) => houseMap[r.id])
      .map((r) => ({
        reason: r.reason,
        house: {
          ...houseMap[r.id],
          images:    JSON.parse(houseMap[r.id].images),
          amenities: JSON.parse(houseMap[r.id].amenities),
        },
      }));

    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { chat, recommend };