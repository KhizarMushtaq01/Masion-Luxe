/**
 * Maison Luxe — Database Seeder
 * Run: node backend/seed.js
 * Creates: 1 admin, 2 users, 8 categories, 40 products, sample coupons
 */

require('dotenv').config({ path: __dirname + '/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Product = require('./models/Product')
const { Category, Coupon } = require('./models/index')

const UNSPLASH = {
  women: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  ],
  men: [
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1602810319428-019690571b5b?w=800&q=80',
  ],
  bags: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
  ],
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800&q=80',
  ],
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const price = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2))

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  // Clear
  await Promise.all([
    User.deleteMany({}), Product.deleteMany({}),
    Category.deleteMany({}), Coupon.deleteMany({})
  ])
  console.log('🗑  Cleared existing data')

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Clothing', slug: 'clothing', gender: 'all', sortOrder: 1, isActive: true },
    { name: 'Bags', slug: 'bags', gender: 'all', sortOrder: 2, isActive: true },
    { name: 'Shoes', slug: 'shoes', gender: 'all', sortOrder: 3, isActive: true },
    { name: 'Accessories', slug: 'accessories', gender: 'all', sortOrder: 4, isActive: true },
    { name: 'Jewellery', slug: 'jewellery', gender: 'women', sortOrder: 5, isActive: true },
    { name: 'Perfumes', slug: 'perfumes', gender: 'all', sortOrder: 6, isActive: true },
    { name: 'Sunglasses', slug: 'sunglasses', gender: 'all', sortOrder: 7, isActive: true },
    { name: 'Kids', slug: 'kids', gender: 'kids', sortOrder: 8, isActive: true },
  ])
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c._id]))
  console.log(`✅ Created ${categories.length} categories`)

  // ─── Users ───────────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    firstName: 'Admin', lastName: 'Maison',
    email: 'admin@maisonluxe.com', password: 'admin1234',
    role: 'superadmin', isEmailVerified: true,
    totalOrders: 0, totalSpent: 0, loyaltyPoints: 500,
  })
  const testUser = await User.create({
    firstName: 'Sophie', lastName: 'Laurent',
    email: 'sophie@example.com', password: 'password123',
    role: 'user', isEmailVerified: true,
    totalOrders: 3, totalSpent: 1850.00, loyaltyPoints: 1850,
  })
  const testUser2 = await User.create({
    firstName: 'James', lastName: 'Harper',
    email: 'james@example.com', password: 'password123',
    role: 'user', isEmailVerified: true,
    totalOrders: 1, totalSpent: 620.00, loyaltyPoints: 620,
  })
  console.log('✅ Created 3 users (1 admin + 2 test users)')
  console.log('   Admin login: admin@maisonluxe.com / admin1234')
  console.log('   User login:  sophie@example.com / password123')

  // ─── Products ────────────────────────────────────────────────────────────────
  const womenProducts = [
    { name: 'Silk Draped Evening Gown', category: catMap['clothing'], gender: 'women', basePrice: price(1800, 4200), material: '100% Silk', sizes: ['XS','S','M','L'], isNew: true, isFeatured: true, stock: rand(5,20), tags: ['dresses','evening','silk'], images: [{ url: UNSPLASH.women[0], isPrimary: true }, { url: UNSPLASH.women[2], isPrimary: false }] },
    { name: 'Cashmere Wrap Coat', category: catMap['clothing'], gender: 'women', basePrice: price(2200, 3800), material: '100% Cashmere', sizes: ['XS','S','M','L','XL'], isFeatured: true, isBestseller: true, stock: rand(5,15), tags: ['jackets','cashmere','coats'], images: [{ url: UNSPLASH.women[1], isPrimary: true }] },
    { name: 'Tailored Blazer in Ivory', category: catMap['clothing'], gender: 'women', basePrice: price(890, 1600), material: 'Italian Wool', sizes: ['XS','S','M','L'], isNew: true, stock: rand(8,25), tags: ['jackets','blazer','tailored'], images: [{ url: UNSPLASH.women[3], isPrimary: true }] },
    { name: 'Pleated Midi Skirt', category: catMap['clothing'], gender: 'women', basePrice: price(580, 980), material: 'Silk Chiffon', sizes: ['XS','S','M','L'], stock: rand(10,30), tags: ['trousers','skirt'], images: [{ url: UNSPLASH.women[4], isPrimary: true }] },
    { name: 'Quilted Leather Shoulder Bag', category: catMap['bags'], gender: 'women', basePrice: price(1400, 3200), material: 'Full-grain Italian Leather', isBestseller: true, isFeatured: true, stock: rand(3,12), tags: ['bags','leather'], images: [{ url: UNSPLASH.bags[0], isPrimary: true }, { url: UNSPLASH.bags[1], isPrimary: false }] },
    { name: 'Chain-Link Mini Bag', category: catMap['bags'], gender: 'women', basePrice: price(980, 1800), isNew: true, isOnSale: true, salePrice: price(680, 920), material: 'Lambskin', stock: rand(5,15), tags: ['bags','chain'], images: [{ url: UNSPLASH.bags[2], isPrimary: true }] },
    { name: 'Strappy Heeled Sandals', category: catMap['shoes'], gender: 'women', basePrice: price(680, 1400), sizes: ['36','37','38','39','40','41'], isFeatured: true, stock: rand(6,18), tags: ['shoes','heels','sandals'], images: [{ url: UNSPLASH.shoes[0], isPrimary: true }] },
    { name: 'Patent Leather Pumps', category: catMap['shoes'], gender: 'women', basePrice: price(580, 1100), sizes: ['36','37','38','39','40'], isBestseller: true, stock: rand(8,20), tags: ['shoes','heels','pumps'], images: [{ url: UNSPLASH.shoes[1], isPrimary: true }] },
    { name: 'Gold Statement Earrings', category: catMap['jewellery'], gender: 'women', basePrice: price(380, 880), isNew: true, stock: rand(10,40), tags: ['jewellery','earrings','gold'], images: [{ url: UNSPLASH.accessories[0], isPrimary: true }] },
    { name: 'Layered Pearl Necklace', category: catMap['jewellery'], gender: 'women', basePrice: price(480, 1200), stock: rand(8,25), tags: ['jewellery','necklace','pearl'], images: [{ url: UNSPLASH.accessories[1], isPrimary: true }] },
  ]

  const menProducts = [
    { name: 'Double-Breasted Wool Suit', category: catMap['clothing'], gender: 'men', basePrice: price(2800, 5500), material: 'Loro Piana Wool', sizes: ['44','46','48','50','52','54'], isFeatured: true, isBestseller: true, stock: rand(5,15), tags: ['suits','tailored','formal'], images: [{ url: UNSPLASH.men[0], isPrimary: true }] },
    { name: 'Egyptian Cotton Dress Shirt', category: catMap['clothing'], gender: 'men', basePrice: price(380, 780), material: '100% Egyptian Cotton', sizes: ['S','M','L','XL','XXL'], isNew: true, stock: rand(10,30), tags: ['shirts','formal'], images: [{ url: UNSPLASH.men[1], isPrimary: true }] },
    { name: 'Slim-Cut Merino Trousers', category: catMap['clothing'], gender: 'men', basePrice: price(480, 980), material: 'Merino Wool', sizes: ['44','46','48','50','52'], stock: rand(8,25), tags: ['trousers','formal'], images: [{ url: UNSPLASH.men[2], isPrimary: true }] },
    { name: 'Leather Weekend Holdall', category: catMap['bags'], gender: 'men', basePrice: price(1200, 2400), material: 'Full-grain Calfskin', isFeatured: true, stock: rand(4,12), tags: ['bags','leather','travel'], images: [{ url: UNSPLASH.bags[0], isPrimary: true }] },
    { name: 'Oxford Brogues', category: catMap['shoes'], gender: 'men', basePrice: price(680, 1400), sizes: ['40','41','42','43','44','45','46'], isBestseller: true, stock: rand(8,20), tags: ['shoes','brogues','formal'], images: [{ url: UNSPLASH.shoes[2], isPrimary: true }] },
    { name: 'Cashmere Roll-Neck Sweater', category: catMap['clothing'], gender: 'men', basePrice: price(480, 980), material: '100% Cashmere', sizes: ['S','M','L','XL'], isNew: true, stock: rand(10,30), tags: ['knitwear','cashmere'], images: [{ url: UNSPLASH.men[3], isPrimary: true }] },
    { name: 'Slim Leather Bifold Wallet', category: catMap['accessories'], gender: 'men', basePrice: price(280, 580), material: 'Saffiano Leather', isBestseller: true, stock: rand(15,40), tags: ['wallets','leather','accessories'], images: [{ url: UNSPLASH.accessories[0], isPrimary: true }] },
    { name: 'Silk Jacquard Tie', category: catMap['accessories'], gender: 'men', basePrice: price(180, 380), material: '100% Silk', stock: rand(20,50), tags: ['ties','silk','accessories'], images: [{ url: UNSPLASH.accessories[1], isPrimary: true }] },
  ]

  const unisexProducts = [
    { name: 'Signature Eau de Parfum', category: catMap['perfumes'], gender: 'unisex', basePrice: price(220, 480), isBestseller: true, isFeatured: true, stock: rand(20,60), tags: ['perfumes','fragrance'], images: [{ url: UNSPLASH.accessories[0], isPrimary: true }] },
    { name: 'Oversized Aviator Sunglasses', category: catMap['sunglasses'], gender: 'unisex', basePrice: price(380, 880), isNew: true, isOnSale: true, salePrice: price(250, 370), stock: rand(10,30), tags: ['sunglasses','eyewear'], images: [{ url: UNSPLASH.accessories[1], isPrimary: true }] },
    { name: 'Logo Silk Scarf', category: catMap['accessories'], gender: 'unisex', basePrice: price(380, 780), material: '100% Silk', isFeatured: true, stock: rand(8,25), tags: ['scarves','silk','accessories'], images: [{ url: UNSPLASH.accessories[0], isPrimary: true }] },
    { name: 'Leather Belt with Gold Buckle', category: catMap['accessories'], gender: 'unisex', basePrice: price(280, 580), sizes: ['S','M','L','XL'], material: 'Italian Calf Leather', stock: rand(15,40), tags: ['belts','leather'], images: [{ url: UNSPLASH.accessories[1], isPrimary: true }] },
    { name: 'Canvas & Leather Tote', category: catMap['bags'], gender: 'unisex', basePrice: price(580, 1200), isOnSale: true, salePrice: price(380, 560), stock: rand(8,20), tags: ['bags','canvas','tote'], images: [{ url: UNSPLASH.bags[1], isPrimary: true }] },
  ]

  const kidsProducts = [
    { name: 'Velvet Party Dress', category: catMap['kids'], gender: 'kids', basePrice: price(180, 380), material: 'Velvet', sizes: ['2Y','4Y','6Y','8Y','10Y'], isNew: true, stock: rand(10,25), tags: ['dresses','formal'], images: [{ url: UNSPLASH.women[4], isPrimary: true }] },
    { name: 'Wool Blend Blazer (Boys)', category: catMap['kids'], gender: 'kids', basePrice: price(220, 480), material: 'Wool Blend', sizes: ['4Y','6Y','8Y','10Y','12Y'], stock: rand(8,20), tags: ['blazer','formal'], images: [{ url: UNSPLASH.men[0], isPrimary: true }] },
  ]

  const allProducts = [...womenProducts, ...menProducts, ...unisexProducts, ...kidsProducts].map(p => ({
    ...p,
    description: `A masterpiece of craftsmanship and style, ${p.name} represents the pinnacle of Maison Luxe's design philosophy. Crafted with meticulous attention to detail, this piece embodies timeless elegance and modern sophistication. Each element has been carefully considered to ensure both comfort and visual impact, making it the ideal choice for the discerning individual who refuses to compromise on quality.`,
    shortDescription: `Exquisite ${p.name.toLowerCase()} crafted with the finest materials by Maison Luxe artisans.`,
    features: [
      'Hand-finished with meticulous attention to detail',
      'Made in Italy by master artisans',
      'Comes with Maison Luxe dust bag and authenticity card',
      'Sustainable and ethically sourced materials',
    ],
    careInstructions: ['Dry clean only', 'Store in dust bag when not in use', 'Avoid direct sunlight'],
    isActive: true,
    ratings: { average: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)), count: rand(0, 45) },
    views: rand(50, 2000),
    soldCount: rand(2, 180),
    slug: undefined, // will be generated by pre-save
  }))

  const savedProducts = await Product.insertMany(allProducts)
  console.log(`✅ Created ${savedProducts.length} products`)

  // ─── Coupons ─────────────────────────────────────────────────────────────────
  await Coupon.insertMany([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 200, description: 'Welcome discount — 10% off your first order', isActive: true, validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    { code: 'LUXE20', discountType: 'percentage', discountValue: 20, minOrderAmount: 500, description: '20% off orders over $500', isActive: true, validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    { code: 'FLAT100', discountType: 'fixed', discountValue: 100, minOrderAmount: 800, description: '$100 off orders over $800', isActive: true, validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    { code: 'SUMMER25', discountType: 'percentage', discountValue: 25, minOrderAmount: 1000, description: 'Summer sale — 25% off', isActive: false },
  ])
  console.log('✅ Created 4 coupons')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Database seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:   admin@maisonluxe.com / admin1234')
  console.log('User:    sophie@example.com / password123')
  console.log('Coupon:  WELCOME10 (10% off $200+)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  process.exit(0)
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1) })
