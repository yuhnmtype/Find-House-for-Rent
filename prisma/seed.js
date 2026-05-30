const bcrypt = require('bcryptjs');
const prisma = require('../src/utils/prisma');
require('dotenv').config();

async function main() {
  console.log('[seed] starting...');

  const hashedPw = await bcrypt.hash('password123', 12);

  // -- USERS ------------------------------------------------------------------

  const staff = await prisma.user.upsert({
    where: { email: 'staff@findhousehcmc.vn' },
    update: {},
    create: {
      fullName: 'Nguyen Van Staff',
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
      fullName: 'Tran Thi Lan',
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
      fullName: 'Le Van Hung',
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
      fullName: 'Phan Thi Mai',
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
      fullName: 'Pham Minh Khoa',
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
      fullName: 'Nguyen Thi Hoa',
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
      fullName: 'Tran Quoc Bao',
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
      fullName: 'Le Thi Thuy',
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
      fullName: 'Vo Minh Tri',
      email:    'student5@student.hcmut.edu.vn',
      password: hashedPw,
      phone:    '0367890123',
      role:     'STUDENT',
    },
  });

  console.log('[seed] users: 9 accounts created');

  // -- CLEAR EXISTING DATA ---------------------------------------------------
  // Safe to re-run: wipe dependent tables first, then houses

  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.house.deleteMany();

  // -- HOUSES ----------------------------------------------------------------

  const housesData = [
    // Thu Duc — near DHBK, IU, UIT
    {
      title:        'Phong tro du noi that gan DHBK - Thu Duc',
      description:  'Phong 20m2 sach se, co dieu hoa, wifi toc do cao, cho de xe mien phi. Cach DHBK 500m.',
      address:      '12 Duong Vo Van Ngan',
      district:     'Thanh pho Thu Duc',
      ward:         'Phuong Linh Chieu',
      area:         20,
      price:        2500000,
      deposit:      5000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'washing_machine']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },
    {
      title:        'Can ho mini 1PN view dep - Thu Duc',
      description:  'Can ho 35m2 tang 5, view thanh pho, day du noi that cao cap. Gan IU va UIT.',
      address:      '88 Duong Han Thuyen',
      district:     'Thanh pho Thu Duc',
      ward:         'Phuong Linh Trung',
      area:         35,
      price:        4500000,
      deposit:      9000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'APARTMENT',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'elevator', 'security', 'parking']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },
    {
      title:        'Nha nguyen can 3PN cho nhom sinh vien - Thu Duc',
      description:  '3 phong ngu, 2 WC, bep rieng, san de xe rong. Phu hop nhom 3-4 nguoi.',
      address:      '45 Duong To Vinh Dien',
      district:     'Thanh pho Thu Duc',
      ward:         'Phuong Linh Chieu',
      area:         75,
      price:        7000000,
      deposit:      14000000,
      maxTenants:   4,
      interior:     'SEMI_FURNISHED',
      type:         'HOUSE',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking', 'yard', 'washing_machine']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },

    // Binh Thanh — near UEH, Van Lang
    {
      title:        'Can ho mini ban cong - Binh Thanh',
      description:  'Can ho 30m2 yen tinh, co ban cong, gan UEH va cho Binh Thanh. Noi that co ban.',
      address:      '5/3 Duong Xo Viet Nghe Tinh',
      district:     'Binh Thanh',
      ward:         'Phuong 17',
      area:         30,
      price:        4200000,
      deposit:      8000000,
      maxTenants:   2,
      interior:     'SEMI_FURNISHED',
      type:         'APARTMENT',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'balcony', 'security']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },
    {
      title:        'Phong tro gia tot gan Van Lang - Binh Thanh',
      description:  'Phong 25m2, WC rieng, an ninh tot, gan truong DH Van Lang va sieu thi.',
      address:      '110 Dinh Bo Linh',
      district:     'Binh Thanh',
      ward:         'Phuong 26',
      area:         25,
      price:        3000000,
      deposit:      6000000,
      maxTenants:   2,
      interior:     'SEMI_FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },

    // Quan 7 — RMIT, Ton Duc Thang
    {
      title:        'Can ho cao cap gan RMIT - Quan 7',
      description:  'Can ho hien dai 45m2, day du noi that, ho boi chung cu, gym. Danh cho sinh vien RMIT.',
      address:      '702 Nguyen Van Linh',
      district:     'Quan 7',
      ward:         'Phuong Tan Phong',
      area:         45,
      price:        9000000,
      deposit:      18000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'APARTMENT',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'gym', 'pool', 'security', 'elevator', 'parking']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },
    {
      title:        'Phong tro sach se gan Ton Duc Thang - Quan 7',
      description:  'Phong 22m2, WC rieng, co cua so thoang, gan DH Ton Duc Thang va Lotte Mart.',
      address:      '19 Duong Huynh Tan Phat',
      district:     'Quan 7',
      ward:         'Phuong Tan Thuan Tay',
      area:         22,
      price:        3500000,
      deposit:      7000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },

    // Quan 1 — trung tam
    {
      title:        'Can ho studio trung tam - Quan 1',
      description:  'Studio 40m2 ngay trung tam Q1, gan BV Cho Ray va DH Y Duoc. Noi that dang cap.',
      address:      '28 Nguyen Thi Minh Khai',
      district:     'Quan 1',
      ward:         'Phuong Da Kao',
      area:         40,
      price:        12000000,
      deposit:      24000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'APARTMENT',
      status:       'RENTED',
      amenities:    JSON.stringify(['wifi', 'ac', 'security', 'elevator', 'parking']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },
    {
      title:        'Phong tro cao cap hem yen tinh - Quan 1',
      description:  'Phong 28m2 trong hem yen tinh, gan Ben Thanh, day du tien nghi.',
      address:      '15/7 Duong Ly Tu Trong',
      district:     'Quan 1',
      ward:         'Phuong Ben Thanh',
      area:         28,
      price:        6500000,
      deposit:      13000000,
      maxTenants:   1,
      interior:     'FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'security']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },

    // Go Vap
    {
      title:        'Nha nguyen can 3PN - Go Vap',
      description:  '3 phong ngu, 2 WC, san de xe, san phoi rieng. Khu dan cu yen tinh.',
      address:      '200 Nguyen Van Nghi',
      district:     'Go Vap',
      ward:         'Phuong 7',
      area:         80,
      price:        8500000,
      deposit:      17000000,
      maxTenants:   4,
      interior:     'SEMI_FURNISHED',
      type:         'HOUSE',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'security', 'yard']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },
    {
      title:        'Phong tro gia re - Go Vap',
      description:  'Phong 18m2, phu hop sinh vien tiet kiem. Gan cho Go Vap va xe buyt.',
      address:      '33 Nguyen Kiem',
      district:     'Go Vap',
      ward:         'Phuong 3',
      area:         18,
      price:        2000000,
      deposit:      4000000,
      maxTenants:   1,
      interior:     'UNFURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },

    // Tan Binh — near airport
    {
      title:        'Can ho tien nghi gan san bay - Tan Binh',
      description:  'Can ho 38m2, an ninh 24/7, gan san bay Tan Son Nhat. Thich hop sinh vien xa nha.',
      address:      '117 Hoang Van Thu',
      district:     'Tan Binh',
      ward:         'Phuong 8',
      area:         38,
      price:        5500000,
      deposit:      11000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'APARTMENT',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'security', 'parking', 'elevator']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },
    {
      title:        'Phong tro WC rieng - Tan Binh',
      description:  'Phong 20m2, WC rieng biet, thoang mat, khu vuc nhieu sinh vien.',
      address:      '50 Duong Cong Hoa',
      district:     'Tan Binh',
      ward:         'Phuong 13',
      area:         20,
      price:        2800000,
      deposit:      5600000,
      maxTenants:   2,
      interior:     'SEMI_FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },

    // Quan 12
    {
      title:        'Phong tro gia re nhat khu vuc - Quan 12',
      description:  'Phong 18m2, an ninh 24/7, gan khu cong nghe cao va xe buyt. Nha ve sinh rieng.',
      address:      '88 Nguyen Anh Thu',
      district:     'Quan 12',
      ward:         'Phuong Hiep Thanh',
      area:         18,
      price:        1800000,
      deposit:      3600000,
      maxTenants:   1,
      interior:     'UNFURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },

    // Binh Duong
    {
      title:        'Ky tuc xa sinh vien - Binh Duong',
      description:  'Ky tuc xa hien dai, 6 nguoi/phong, co bao ve 24/7, canteen, phong hoc chung.',
      address:      '12 Dai lo Binh Duong',
      district:     'Binh Duong',
      ward:         'Phuong Lai Thieu',
      area:         50,
      price:        1500000,
      deposit:      1500000,
      maxTenants:   6,
      interior:     'FURNISHED',
      type:         'DORMITORY',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking', 'canteen', 'security', 'study_room']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },

    // Quan 10 — near DH Y Duoc, Su Pham
    {
      title:        'Phong tro gan DH Y Duoc - Quan 10',
      description:  'Phong 22m2 sach se, yen tinh, cach DH Y Duoc 300m. WC rieng, cua so thoang.',
      address:      '217 Duong 3 Thang 2',
      district:     'Quan 10',
      ward:         'Phuong 12',
      area:         22,
      price:        3200000,
      deposit:      6400000,
      maxTenants:   2,
      interior:     'SEMI_FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },
    {
      title:        'Can ho 2PN cho cap sinh vien - Quan 10',
      description:  'Can ho 50m2, 2 phong ngu rieng biet, bep day du. Phu hop 2 sinh vien o cung.',
      address:      '40 Ba Thang Hai',
      district:     'Quan 10',
      ward:         'Phuong 11',
      area:         50,
      price:        7500000,
      deposit:      15000000,
      maxTenants:   3,
      interior:     'FURNISHED',
      type:         'APARTMENT',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'security', 'elevator']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },

    // Phu Nhuan
    {
      title:        'Phong tro cao cap hem yen tinh - Phu Nhuan',
      description:  'Phong 26m2, decor hien dai, hem xe hoi vao duoc, gan san bay va trung tam.',
      address:      '72 Duong Phan Xich Long',
      district:     'Phu Nhuan',
      ward:         'Phuong 2',
      area:         26,
      price:        4800000,
      deposit:      9600000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'security', 'parking']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },

    // Quan 3
    {
      title:        'Studio cao cap trung tam - Quan 3',
      description:  'Studio 42m2, thiet ke hien dai, tang 8, view thanh pho. Gan DH Luat va Kinh te.',
      address:      '168 Nguyen Dinh Chieu',
      district:     'Quan 3',
      ward:         'Phuong 6',
      area:         42,
      price:        10500000,
      deposit:      21000000,
      maxTenants:   2,
      interior:     'FURNISHED',
      type:         'APARTMENT',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'elevator', 'security', 'gym', 'parking']),
      landlordId:   landlord3.id,
      contactEmail: landlord3.email,
      contactPhone: landlord3.phone,
    },
    {
      title:        'Phong tro gia hop ly - Quan 3',
      description:  'Phong 24m2, an ninh, gan sieu thi Coopmart va xe buyt. Co cho nau an chung.',
      address:      '55 Vo Thi Sau',
      district:     'Quan 3',
      ward:         'Phuong 7',
      area:         24,
      price:        3800000,
      deposit:      7600000,
      maxTenants:   2,
      interior:     'SEMI_FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'ac', 'parking', 'kitchen']),
      landlordId:   landlord2.id,
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
    },

    // Quan 5
    {
      title:        'Phong tro Cho Lon - Quan 5',
      description:  'Phong 20m2 trong khu Cho Lon, gan cho Binh Tay va cac truong DH.',
      address:      '312 Tran Hung Dao',
      district:     'Quan 5',
      ward:         'Phuong 11',
      area:         20,
      price:        2900000,
      deposit:      5800000,
      maxTenants:   2,
      interior:     'SEMI_FURNISHED',
      type:         'ROOM',
      status:       'AVAILABLE',
      amenities:    JSON.stringify(['wifi', 'parking']),
      landlordId:   landlord1.id,
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
    },
  ];

  const houses = [];
  for (const data of housesData) {
    const h = await prisma.house.create({
      data: { ...data, images: JSON.stringify([]) },
    });
    houses.push(h);
  }

  console.log(`[seed] houses: ${houses.length} listings created`);

  // -- BOOKINGS --------------------------------------------------------------

  await prisma.booking.create({
    data: {
      houseId:   houses[0].id,
      studentId: student1.id,
      message:   'Minh la sinh vien DHBK nam 3, muon xem phong cuoi tuan nay.',
      visitDate: new Date('2026-06-07T09:00:00'),
      status:    'APPROVED',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[3].id,
      studentId: student2.id,
      message:   'Minh dang tim phong gan UEH, ban co the cho minh xem phong khong?',
      visitDate: new Date('2026-06-08T14:00:00'),
      status:    'PENDING',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[5].id,
      studentId: student3.id,
      message:   'Minh la sinh vien RMIT muon thue dai han 1 nam.',
      visitDate: new Date('2026-06-09T10:00:00'),
      status:    'PENDING',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[1].id,
      studentId: student4.id,
      message:   'Minh va ban cung lop muon thue chung, phong con trong khong a?',
      visitDate: new Date('2026-06-06T15:00:00'),
      status:    'REJECTED',
    },
  });

  await prisma.booking.create({
    data: {
      houseId:   houses[9].id,
      studentId: student5.id,
      message:   'Nhom 4 nguoi muon thue nha nguyen can, tien chia tien.',
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
      terms:       'Thue 12 thang, dong tien truoc ngay 5 hang thang. Khong nuoi thu cung.',
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
      terms:       'Thue 6 thang theo hoc ky. Duoc gia han neu bao truoc 1 thang.',
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
      terms:       'Thue 12 thang, 4 nguoi o. Phu trach ve sinh khu vuc chung.',
      status:      'ACTIVE',
    },
  });

  console.log('[seed] contracts: 3 records created');

  // -- PAYMENTS --------------------------------------------------------------

  await prisma.payment.create({
    data: {
      userId: landlord1.id, type: 'LISTING_FEE',
      amount: 100000, month: 4, year: 2026,
      status: 'PAID', paidAt: new Date('2026-04-03'),
    },
  });

  await prisma.payment.create({
    data: {
      userId: landlord1.id, type: 'LISTING_FEE',
      amount: 100000, month: 5, year: 2026,
      status: 'PAID', paidAt: new Date('2026-05-04'),
    },
  });

  await prisma.payment.create({
    data: {
      userId: landlord2.id, type: 'LISTING_FEE',
      amount: 100000, month: 5, year: 2026,
      status: 'PENDING',
    },
  });

  await prisma.payment.create({
    data: {
      userId: landlord3.id, type: 'LISTING_FEE',
      amount: 100000, month: 4, year: 2026,
      status: 'OVERDUE',
    },
  });

  await prisma.payment.create({
    data: {
      userId: landlord3.id, type: 'LISTING_FEE',
      amount: 100000, month: 5, year: 2026,
      status: 'PENDING',
    },
  });

  console.log('[seed] payments: 5 records created');

  // -- SUMMARY ---------------------------------------------------------------

  console.log('[seed] done');
  console.log('  users:     9  (1 staff / 3 landlords / 5 students)');
  console.log(`  houses:    ${houses.length}  (10 HCMC districts)`);
  console.log('  bookings:  5  (approved / pending / rejected)');
  console.log('  contracts: 3  (active / terminated)');
  console.log('  payments:  5  (paid / pending / overdue)');
  console.log('');
  console.log('  demo accounts — password: password123');
  console.log('  staff:    staff@findhousehcmc.vn');
  console.log('  landlord: landlord1@gmail.com / landlord2@gmail.com / landlord3@gmail.com');
  console.log('  student:  student1..5@student.hcmut.edu.vn');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });