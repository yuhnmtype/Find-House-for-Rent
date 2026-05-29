const bcrypt = require('bcryptjs');
const prisma = require('../src/utils/prisma');
require('dotenv').config();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPw = await bcrypt.hash('password123', 12);

  const staff = await prisma.user.upsert({
    where: { email: 'staff@findhousehcmc.vn' },
    update: {},
    create: {
      fullName: 'Nguyen Van Staff',
      email: 'staff@findhousehcmc.vn',
      password: hashedPw,
      phone: '0901000001',
      role: 'STAFF',
    },
  });

  const landlord1 = await prisma.user.upsert({
    where: { email: 'landlord1@gmail.com' },
    update: {},
    create: {
      fullName: 'Tran Thi Lan',
      email: 'landlord1@gmail.com',
      password: hashedPw,
      phone: '0909111222',
      role: 'LANDLORD',
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: 'landlord2@gmail.com' },
    update: {},
    create: {
      fullName: 'Le Van Hung',
      email: 'landlord2@gmail.com',
      password: hashedPw,
      phone: '0908333444',
      role: 'LANDLORD',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Pham Minh Khoa',
      email: 'student1@student.hcmut.edu.vn',
      password: hashedPw,
      phone: '0123456789',
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@student.hcmut.edu.vn' },
    update: {},
    create: {
      fullName: 'Nguyen Thi Hoa',
      email: 'student2@student.hcmut.edu.vn',
      password: hashedPw,
      phone: '0987654321',
      role: 'STUDENT',
    },
  });

  // Create houses
  const house1 = await prisma.house.create({
    data: {
      title: 'Phòng trọ gần ĐHBK, đủ nội thất – Quận Thủ Đức',
      description: 'Phòng sạch sẽ, an ninh, gần trường Đại học Bách Khoa. Có wifi, điều hòa, chỗ để xe miễn phí.',
      address: '12 Đường Võ Văn Ngân',
      district: 'Thành phố Thủ Đức',
      ward: 'Phường Linh Chiểu',
      area: 20,
      price: 2500000,
      deposit: 5000000,
      maxTenants: 2,
      interior: 'FURNISHED',
      type: 'ROOM',
      status: 'AVAILABLE',
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
      amenities: JSON.stringify(['wifi', 'ac', 'parking', 'washing_machine']),
      images: JSON.stringify([]),
      landlordId: landlord1.id,
    },
  });

  const house2 = await prisma.house.create({
    data: {
      title: 'Căn hộ mini 1PN gần UEH – Quận Bình Thạnh',
      description: 'Căn hộ yên tĩnh, có ban công, gần Đại học Kinh tế TP.HCM. Phù hợp sinh viên năm 2 trở lên.',
      address: '5/3 Đường Xô Viết Nghệ Tĩnh',
      district: 'Bình Thạnh',
      ward: 'Phường 17',
      area: 30,
      price: 4200000,
      deposit: 8000000,
      maxTenants: 2,
      interior: 'SEMI_FURNISHED',
      type: 'APARTMENT',
      status: 'AVAILABLE',
      contactEmail: landlord1.email,
      contactPhone: landlord1.phone,
      amenities: JSON.stringify(['wifi', 'ac', 'balcony', 'security']),
      images: JSON.stringify([]),
      landlordId: landlord1.id,
    },
  });

  await prisma.house.create({
    data: {
      title: 'Phòng trọ giá rẻ sinh viên – Quận 12',
      description: 'Phòng 18m², giá rẻ nhất khu vực, an ninh 24/7, gần khu công nghệ cao. Nhà vệ sinh riêng.',
      address: '88 Nguyễn Ảnh Thủ',
      district: 'Quận 12',
      ward: 'Phường Hiệp Thành',
      area: 18,
      price: 1800000,
      deposit: 3600000,
      maxTenants: 1,
      interior: 'UNFURNISHED',
      type: 'ROOM',
      status: 'AVAILABLE',
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
      amenities: JSON.stringify(['wifi', 'parking']),
      images: JSON.stringify([]),
      landlordId: landlord2.id,
    },
  });

  await prisma.house.create({
    data: {
      title: 'Nhà nguyên căn cho thuê – Quận Gò Vấp',
      description: '3 phòng ngủ, 2WC, nhà mới xây, sân để xe rộng, phù hợp nhóm 3-4 sinh viên.',
      address: '200 Nguyễn Văn Nghi',
      district: 'Gò Vấp',
      ward: 'Phường 7',
      area: 80,
      price: 8500000,
      deposit: 17000000,
      maxTenants: 4,
      interior: 'SEMI_FURNISHED',
      type: 'HOUSE',
      status: 'AVAILABLE',
      contactEmail: landlord2.email,
      contactPhone: landlord2.phone,
      amenities: JSON.stringify(['wifi', 'ac', 'parking', 'security', 'yard']),
      images: JSON.stringify([]),
      landlordId: landlord2.id,
    },
  });

  console.log('✅ Seed complete!');
  console.log('\n📝 Test accounts (password: password123):');
  console.log(`  STAFF:    staff@findhousehcmc.vn`);
  console.log(`  LANDLORD: landlord1@gmail.com`);
  console.log(`  LANDLORD: landlord2@gmail.com`);
  console.log(`  STUDENT:  student1@student.hcmut.edu.vn`);
  console.log(`  STUDENT:  student2@student.hcmut.edu.vn`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
