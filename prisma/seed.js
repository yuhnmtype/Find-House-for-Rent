const bcrypt = require('bcryptjs');
const prisma = require('../src/utils/prisma');
require('dotenv').config();

// Unsplash direct-link images grouped by house type.
// Free to use, no account required.
const IMAGES = {
  ROOM: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  ],
  APARTMENT: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  ],
  HOUSE: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
  ],
  DORMITORY: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1626178793926-22b28830aa30?w=800',
  ],
};

async function main() {
  console.log('[seed] starting...');

  const hashedPw = await bcrypt.hash('password123', 12);

  // -- USERS ------------------------------------------------------------------

  const staff = await prisma.user.upsert({
    where: { email: 'staff@findhousehcmc.vn' },
    update: {},
    create: {
      fullName: 'Nguyễn Văn Minh',
      email:    'staff@findhousehcmc.vn',
      password: hashedPw,
      phone:    '0901000001',
      role:     'STAFF',
    },
  });

  const landlord1 = await prisma.user.upsert({
    where: { email: 'landlord1@gmail.com' },
    update: {},
    create: {
      fullName: 'Trần Thị Lan',
      email:    'landlord1@gmail.com',
      password: hashedPw,
      phone:    '0909111222',
      role:     'LANDLORD',
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: 'landlord2@gmail.com' },
    update: {},
    create: {
      fullName: 'Lê Văn Hùng',
      email:    'landlord2@gmail.com',
      password: hashedPw,
      phone:    '0908333444',
      role:     'LANDLORD',
    },
  });

  const landlord3 = await prisma.user.upsert({
    where: { email: 'landlord3@gmail.com' },
    update: {},
    create: {
      fullName: 'Phan Thị Mai',
      email:    'landlord3@gmail.com',
      password: hashedPw,
      phone:    '0907555666',
      role:     'LANDLORD',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Phạm Minh Khoa',
      email:    'student1@student.hcmut.edu.vn',
      password: hashedPw,
      phone:    '0123456789',
      role:     'STUDENT',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Nguyễn Thị Hoa',
      email:    'student2@student.hcmut.edu.vn',
      password: hashedPw,
      phone:    '0987654321',
      role:     'STUDENT',
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student3@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Trần Quốc Bảo',
      email:    'student3@student.hcmut.edu.vn',
      password: hashedPw,
      phone:    '0345678901',
      role:     'STUDENT',
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: 'student4@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Lê Thị Thúy',
      email:    'student4@student.hcmut.edu.vn',
      password: hashedPw,
      phone:    '0356789012',
      role:     'STUDENT',
    },
  });

  const student5 = await prisma.user.upsert({
    where: { email: 'student5@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Võ Minh Trí',
      email:    'student5@student.hcmut.edu.vn',
      password: hashedPw,
      phone:    '0367890123',
      role:     'STUDENT',
    },
  });

  console.log('[seed] users: 9 accounts created');

  // -- CLEAR EXISTING DATA ---------------------------------------------------

  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.house.deleteMany();

  // -- HOUSES ----------------------------------------------------------------

  const housesData = [
    // Thủ Đức — gần ĐHBK, IU, UIT
    {
      title:        'Phòng trọ đủ nội thất gần ĐHBK – Thủ Đức',
      description:  'Phòng 20m² sạch sẽ, có điều hòa, wifi tốc độ cao, chỗ để xe miễn phí. Cách ĐHBK 500m, thuận tiện di chuyển.',
      address:      '12 Đường Võ Văn Ngân',
      district:     'Thành phố Thủ Đức',
      ward:         'Phường Linh Chiểu',
      area:         20, price: 2500000, deposit: 5000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'washing_machine']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },
    {
      title:        'Căn hộ mini 1PN view đẹp – Thủ Đức',
      description:  'Căn hộ 35m² tầng 5, view thành phố thoáng mát, đầy đủ nội thất cao cấp. Gần IU và UIT, an ninh 24/7.',
      address:      '88 Đường Hàn Thuyên',
      district:     'Thành phố Thủ Đức',
      ward:         'Phường Linh Trung',
      area:         35, price: 4500000, deposit: 9000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'APARTMENT', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'elevator', 'security', 'parking']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },
    {
      title:        'Nhà nguyên căn 3PN cho nhóm sinh viên – Thủ Đức',
      description:  '3 phòng ngủ, 2 WC, bếp riêng, sân để xe rộng. Phù hợp nhóm 3-4 người chia nhau ở.',
      address:      '45 Đường Tô Vĩnh Diện',
      district:     'Thành phố Thủ Đức',
      ward:         'Phường Linh Chiểu',
      area:         75, price: 7000000, deposit: 14000000, maxTenants: 4,
      interior:     'SEMI_FURNISHED', type: 'HOUSE', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking', 'yard', 'washing_machine']),
      images:       JSON.stringify(IMAGES.HOUSE),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },

    // Bình Thạnh — gần UEH, Văn Lang
    {
      title:        'Căn hộ mini ban công – Bình Thạnh',
      description:  'Căn hộ 30m² yên tĩnh, có ban công, gần UEH và chợ Bình Thạnh. Nội thất cơ bản đầy đủ.',
      address:      '5/3 Đường Xô Viết Nghệ Tĩnh',
      district:     'Bình Thạnh',
      ward:         'Phường 17',
      area:         30, price: 4200000, deposit: 8000000, maxTenants: 2,
      interior:     'SEMI_FURNISHED', type: 'APARTMENT', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'balcony', 'security']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },
    {
      title:        'Phòng trọ giá tốt gần Văn Lang – Bình Thạnh',
      description:  'Phòng 25m², WC riêng, an ninh tốt, gần trường ĐH Văn Lang và siêu thị tiện lợi.',
      address:      '110 Đinh Bộ Lĩnh',
      district:     'Bình Thạnh',
      ward:         'Phường 26',
      area:         25, price: 3000000, deposit: 6000000, maxTenants: 2,
      interior:     'SEMI_FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },

    // Quận 7 — RMIT, Tôn Đức Thắng
    {
      title:        'Căn hộ cao cấp gần RMIT – Quận 7',
      description:  'Căn hộ hiện đại 45m², đầy đủ nội thất, hồ bơi chung cư, gym. Dành cho sinh viên RMIT và Tôn Đức Thắng.',
      address:      '702 Nguyễn Văn Linh',
      district:     'Quận 7',
      ward:         'Phường Tân Phong',
      area:         45, price: 9000000, deposit: 18000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'APARTMENT', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'gym', 'pool', 'security', 'elevator', 'parking']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },
    {
      title:        'Phòng trọ sạch sẽ gần Tôn Đức Thắng – Quận 7',
      description:  'Phòng 22m², WC riêng, có cửa sổ thoáng, gần ĐH Tôn Đức Thắng và Lotte Mart.',
      address:      '19 Đường Huỳnh Tấn Phát',
      district:     'Quận 7',
      ward:         'Phường Tân Thuận Tây',
      area:         22, price: 3500000, deposit: 7000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },

    // Quận 1 — trung tâm
    {
      title:        'Căn hộ studio trung tâm – Quận 1',
      description:  'Studio 40m² ngay trung tâm Q1, gần BV Chợ Rẫy và ĐH Y Dược. Nội thất đẳng cấp, an ninh 24/7.',
      address:      '28 Nguyễn Thị Minh Khai',
      district:     'Quận 1',
      ward:         'Phường Đa Kao',
      area:         40, price: 12000000, deposit: 24000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'APARTMENT', status: 'RENTED',
      amenities:    JSON.stringify(['wifi', 'ac', 'security', 'elevator', 'parking']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },
    {
      title:        'Phòng trọ cao cấp hẻm yên tĩnh – Quận 1',
      description:  'Phòng 28m² trong hẻm yên tĩnh, gần Bến Thành, đầy đủ tiện nghi.',
      address:      '15/7 Đường Lý Tự Trọng',
      district:     'Quận 1',
      ward:         'Phường Bến Thành',
      area:         28, price: 6500000, deposit: 13000000, maxTenants: 1,
      interior:     'FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'security']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },

    // Gò Vấp
    {
      title:        'Nhà nguyên căn 3PN – Gò Vấp',
      description:  '3 phòng ngủ, 2 WC, sân để xe, sân phơi riêng. Khu dân cư yên tĩnh, an ninh tốt.',
      address:      '200 Nguyễn Văn Nghi',
      district:     'Gò Vấp',
      ward:         'Phường 7',
      area:         80, price: 8500000, deposit: 17000000, maxTenants: 4,
      interior:     'SEMI_FURNISHED', type: 'HOUSE', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'security', 'yard']),
      images:       JSON.stringify(IMAGES.HOUSE),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },
    {
      title:        'Phòng trọ giá rẻ – Gò Vấp',
      description:  'Phòng 18m², phù hợp sinh viên tiết kiệm. Gần chợ Gò Vấp và các tuyến xe buýt.',
      address:      '33 Nguyễn Kiệm',
      district:     'Gò Vấp',
      ward:         'Phường 3',
      area:         18, price: 2000000, deposit: 4000000, maxTenants: 1,
      interior:     'UNFURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },

    // Tân Bình — gần sân bay
    {
      title:        'Căn hộ tiện nghi gần sân bay – Tân Bình',
      description:  'Căn hộ 38m², an ninh 24/7, gần sân bay Tân Sơn Nhất. Thích hợp sinh viên từ tỉnh xa.',
      address:      '117 Hoàng Văn Thụ',
      district:     'Tân Bình',
      ward:         'Phường 8',
      area:         38, price: 5500000, deposit: 11000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'APARTMENT', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'security', 'parking', 'elevator']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },
    {
      title:        'Phòng trọ WC riêng – Tân Bình',
      description:  'Phòng 20m², WC riêng biệt, thoáng mát, khu vực nhiều sinh viên và người đi làm.',
      address:      '50 Đường Cộng Hòa',
      district:     'Tân Bình',
      ward:         'Phường 13',
      area:         20, price: 2800000, deposit: 5600000, maxTenants: 2,
      interior:     'SEMI_FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },

    // Quận 12
    {
      title:        'Phòng trọ giá rẻ nhất khu vực – Quận 12',
      description:  'Phòng 18m², an ninh 24/7, gần khu công nghệ cao và các tuyến xe buýt. Nhà vệ sinh riêng.',
      address:      '88 Nguyễn Ảnh Thủ',
      district:     'Quận 12',
      ward:         'Phường Hiệp Thành',
      area:         18, price: 1800000, deposit: 3600000, maxTenants: 1,
      interior:     'UNFURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },

    // Bình Dương
    {
      title:        'Ký túc xá sinh viên – Bình Dương',
      description:  'Ký túc xá hiện đại, 6 người/phòng, có bảo vệ 24/7, căng tin, phòng học chung. Giá rẻ nhất khu vực.',
      address:      '12 Đại lộ Bình Dương',
      district:     'Bình Dương',
      ward:         'Phường Lái Thiêu',
      area:         50, price: 1500000, deposit: 1500000, maxTenants: 6,
      interior:     'FURNISHED', type: 'DORMITORY', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking', 'canteen', 'security', 'study_room']),
      images:       JSON.stringify(IMAGES.DORMITORY),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },

    // Quận 10 — gần ĐH Y Dược, Sư Phạm
    {
      title:        'Phòng trọ gần ĐH Y Dược – Quận 10',
      description:  'Phòng 22m² sạch sẽ, yên tĩnh, cách ĐH Y Dược 300m. WC riêng, cửa sổ thoáng mát.',
      address:      '217 Đường 3 Tháng 2',
      district:     'Quận 10',
      ward:         'Phường 12',
      area:         22, price: 3200000, deposit: 6400000, maxTenants: 2,
      interior:     'SEMI_FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },
    {
      title:        'Căn hộ 2PN cho cặp sinh viên – Quận 10',
      description:  'Căn hộ 50m², 2 phòng ngủ riêng biệt, bếp đầy đủ. Phù hợp 2 sinh viên ở cùng chia tiền.',
      address:      '40 Ba Tháng Hai',
      district:     'Quận 10',
      ward:         'Phường 11',
      area:         50, price: 7500000, deposit: 15000000, maxTenants: 3,
      interior:     'FURNISHED', type: 'APARTMENT', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'security', 'elevator']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },

    // Phú Nhuận
    {
      title:        'Phòng trọ cao cấp hẻm yên tĩnh – Phú Nhuận',
      description:  'Phòng 26m², decor hiện đại, hẻm xe hơi vào được, gần sân bay và trung tâm thành phố.',
      address:      '72 Đường Phan Xích Long',
      district:     'Phú Nhuận',
      ward:         'Phường 2',
      area:         26, price: 4800000, deposit: 9600000, maxTenants: 2,
      interior:     'FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'security', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },

    // Quận 3
    {
      title:        'Studio cao cấp trung tâm – Quận 3',
      description:  'Studio 42m², thiết kế hiện đại, tầng 8, view thành phố đẹp. Gần ĐH Luật và Kinh tế.',
      address:      '168 Nguyễn Đình Chiểu',
      district:     'Quận 3',
      ward:         'Phường 6',
      area:         42, price: 10500000, deposit: 21000000, maxTenants: 2,
      interior:     'FURNISHED', type: 'APARTMENT', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'elevator', 'security', 'gym', 'parking']),
      images:       JSON.stringify(IMAGES.APARTMENT),
      landlordId:   landlord3.id, contactEmail: landlord3.email, contactPhone: '0907555666',
    },
    {
      title:        'Phòng trọ giá hợp lý – Quận 3',
      description:  'Phòng 24m², an ninh tốt, gần siêu thị Coopmart và xe buýt. Có chỗ nấu ăn chung.',
      address:      '55 Võ Thị Sáu',
      district:     'Quận 3',
      ward:         'Phường 7',
      area:         24, price: 3800000, deposit: 7600000, maxTenants: 2,
      interior:     'SEMI_FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'kitchen']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord2.id, contactEmail: landlord2.email, contactPhone: '0908333444',
    },

    // Quận 5
    {
      title:        'Phòng trọ Chợ Lớn – Quận 5',
      description:  'Phòng 20m² trong khu Chợ Lớn sầm uất, gần chợ Bình Tây và các trường đại học.',
      address:      '312 Trần Hưng Đạo',
      district:     'Quận 5',
      ward:         'Phường 11',
      area:         20, price: 2900000, deposit: 5800000, maxTenants: 2,
      interior:     'SEMI_FURNISHED', type: 'ROOM', status: 'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking']),
      images:       JSON.stringify(IMAGES.ROOM),
      landlordId:   landlord1.id, contactEmail: landlord1.email, contactPhone: '0909111222',
    },
  ];

  const houses = [];
  for (const data of housesData) {
    const h = await prisma.house.create({ data });
    houses.push(h);
  }

  console.log(`[seed] houses: ${houses.length} listings created`);

  // -- BOOKINGS --------------------------------------------------------------

  await prisma.booking.create({
    data: {
      houseId:   houses[0].id,
      studentId: student1.id,
      message:   'Mình là sinh viên ĐHBK năm 3, muốn xem phòng cuối tuần này.',
      visitDate: new Date('2026-06-07T09:00:00'),
      status:    'APPROVED',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[3].id,
      studentId: student2.id,
      message:   'Mình đang tìm phòng gần UEH, bạn có thể cho mình xem phòng không?',
      visitDate: new Date('2026-06-08T14:00:00'),
      status:    'PENDING',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[5].id,
      studentId: student3.id,
      message:   'Mình là sinh viên RMIT muốn thuê dài hạn 1 năm.',
      visitDate: new Date('2026-06-09T10:00:00'),
      status:    'PENDING',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[1].id,
      studentId: student4.id,
      message:   'Mình và bạn cùng lớp muốn thuê chung, phòng còn trống không ạ?',
      visitDate: new Date('2026-06-06T15:00:00'),
      status:    'REJECTED',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[9].id,
      studentId: student5.id,
      message:   'Nhóm 4 người muốn thuê nhà nguyên căn, tiện chia tiền.',
      visitDate: new Date('2026-06-10T09:00:00'),
      status:    'APPROVED',
    },
  });

  console.log('[seed] bookings: 5 records created');

  // -- CONTRACTS -------------------------------------------------------------

  await prisma.contract.create({
    data: {
      houseId:     houses[7].id,
      studentId:   student1.id,
      startDate:   new Date('2026-01-01'),
      endDate:     new Date('2026-12-31'),
      monthlyRent: houses[7].price,
      depositPaid: houses[7].deposit,
      terms:       'Thuê 12 tháng, đóng tiền trước ngày 5 hàng tháng. Không nuôi thú cưng.',
      status:      'ACTIVE',
    },
  });

  await prisma.contract.create({
    data: {
      houseId:     houses[0].id,
      studentId:   student2.id,
      startDate:   new Date('2025-09-01'),
      endDate:     new Date('2026-02-28'),
      monthlyRent: houses[0].price,
      depositPaid: houses[0].deposit,
      terms:       'Thuê 6 tháng theo học kỳ. Được gia hạn nếu báo trước 1 tháng.',
      status:      'TERMINATED',
    },
  });

  await prisma.contract.create({
    data: {
      houseId:     houses[9].id,
      studentId:   student5.id,
      startDate:   new Date('2026-06-01'),
      endDate:     new Date('2027-05-31'),
      monthlyRent: houses[9].price,
      depositPaid: houses[9].deposit,
      terms:       'Thuê 12 tháng, 4 người ở. Phụ trách vệ sinh khu vực chung.',
      status:      'ACTIVE',
    },
  });

  console.log('[seed] contracts: 3 records created');

  // -- PAYMENTS --------------------------------------------------------------

  await prisma.payment.create({
    data: { userId: landlord1.id, type: 'LISTING_FEE', amount: 100000, month: 4, year: 2026, status: 'PAID', paidAt: new Date('2026-04-03') },
  });
  await prisma.payment.create({
    data: { userId: landlord1.id, type: 'LISTING_FEE', amount: 100000, month: 5, year: 2026, status: 'PAID', paidAt: new Date('2026-05-04') },
  });
  await prisma.payment.create({
    data: { userId: landlord2.id, type: 'LISTING_FEE', amount: 100000, month: 5, year: 2026, status: 'PENDING' },
  });
  await prisma.payment.create({
    data: { userId: landlord3.id, type: 'LISTING_FEE', amount: 100000, month: 4, year: 2026, status: 'OVERDUE' },
  });
  await prisma.payment.create({
    data: { userId: landlord3.id, type: 'LISTING_FEE', amount: 100000, month: 5, year: 2026, status: 'PENDING' },
  });

  console.log('[seed] payments: 5 records created');

  console.log('[seed] done');
  console.log('  users:     9  (1 staff / 3 landlords / 5 students)');
  console.log(`  houses:    ${houses.length}  (10 quận HCMC, có ảnh đầy đủ)`);
  console.log('  bookings:  5  (approved / pending / rejected)');
  console.log('  contracts: 3  (active / terminated)');
  console.log('  payments:  5  (paid / pending / overdue)');
  console.log('');
  console.log('  demo accounts - password: password123');
  console.log('  staff:    staff@findhousehcmc.vn');
  console.log('  landlord: landlord1@gmail.com / landlord2@gmail.com / landlord3@gmail.com');
  console.log('  student:  student1..5@student.hcmut.edu.vn');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });