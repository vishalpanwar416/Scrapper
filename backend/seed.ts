import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo data...');

  // Get websites
  const websites = await prisma.website.findMany();

  if (websites.length === 0) {
    console.log('⚠️ No websites found. Please add websites first.');
    process.exit(1);
  }

  const baseProducts = [
    {
      title: 'Classic White T-Shirt',
      price: 29.99,
      originalPrice: 49.99,
      description: 'Premium quality white t-shirt made from 100% organic cotton. Perfect for everyday wear.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      colors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' },
        { name: 'Navy', code: '#000080' },
      ],
      sizes: [
        { size: 'XS', available: true, stock: 10 },
        { size: 'S', available: true, stock: 15 },
        { size: 'M', available: true, stock: 20 },
        { size: 'L', available: true, stock: 18 },
        { size: 'XL', available: true, stock: 12 },
        { size: 'XXL', available: false, stock: 0 },
      ],
    },
    {
      title: 'Slim Fit Jeans',
      price: 79.99,
      originalPrice: 120.00,
      description: 'Timeless slim fit jeans with a modern cut. Durable denim with stretch comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop',
      colors: [
        { name: 'Dark Blue', code: '#00008B' },
        { name: 'Light Blue', code: '#ADD8E6' },
        { name: 'Black', code: '#000000' },
      ],
      sizes: [
        { size: '28', available: true, stock: 8 },
        { size: '30', available: true, stock: 12 },
        { size: '32', available: true, stock: 15 },
        { size: '34', available: true, stock: 14 },
        { size: '36', available: true, stock: 10 },
        { size: '38', available: false, stock: 0 },
      ],
    },
    {
      title: 'Leather Jacket',
      price: 199.99,
      originalPrice: 299.99,
      description: 'Premium genuine leather jacket with a sleek design. Perfect for any season.',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=400&fit=crop',
      colors: [
        { name: 'Black', code: '#000000' },
        { name: 'Brown', code: '#8B4513' },
        { name: 'Tan', code: '#D2B48C' },
      ],
      sizes: [
        { size: 'XS', available: true, stock: 3 },
        { size: 'S', available: true, stock: 5 },
        { size: 'M', available: true, stock: 8 },
        { size: 'L', available: true, stock: 7 },
        { size: 'XL', available: true, stock: 4 },
      ],
    },
    {
      title: 'Summer Dress',
      price: 59.99,
      originalPrice: 89.99,
      description: 'Light and breezy summer dress perfect for warm days. Made from breathable fabric.',
      imageUrl: 'https://images.unsplash.com/photo-1595777707802-13b82e908642?w=400&h=400&fit=crop',
      colors: [
        { name: 'Coral', code: '#FF7F50' },
        { name: 'Mint Green', code: '#98FF98' },
        { name: 'Sky Blue', code: '#87CEEB' },
      ],
      sizes: [
        { size: 'XS', available: true, stock: 6 },
        { size: 'S', available: true, stock: 9 },
        { size: 'M', available: true, stock: 11 },
        { size: 'L', available: true, stock: 8 },
        { size: 'XL', available: true, stock: 5 },
      ],
    },
    {
      title: 'Casual Sneakers',
      price: 89.99,
      originalPrice: 129.99,
      description: 'Comfortable and stylish casual sneakers. Perfect for everyday activities.',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      colors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' },
        { name: 'Gray', code: '#808080' },
      ],
      sizes: [
        { size: '6', available: true, stock: 4 },
        { size: '7', available: true, stock: 6 },
        { size: '8', available: true, stock: 8 },
        { size: '9', available: true, stock: 10 },
        { size: '10', available: true, stock: 9 },
        { size: '11', available: true, stock: 7 },
        { size: '12', available: true, stock: 5 },
      ],
    },
    {
      title: 'Wool Sweater',
      price: 49.99,
      originalPrice: 79.99,
      description: 'Cozy wool sweater perfect for fall and winter. Soft and warm.',
      imageUrl: 'https://images.unsplash.com/photo-1578932750294-708c764c18f6?w=400&h=400&fit=crop',
      colors: [
        { name: 'Cream', code: '#FFFDD0' },
        { name: 'Gray', code: '#808080' },
        { name: 'Burgundy', code: '#800020' },
      ],
      sizes: [
        { size: 'XS', available: true, stock: 7 },
        { size: 'S', available: true, stock: 10 },
        { size: 'M', available: true, stock: 12 },
        { size: 'L', available: true, stock: 9 },
        { size: 'XL', available: true, stock: 6 },
      ],
    },
  ];

  for (const website of websites) {
    console.log(`\n📦 Adding products for ${website.name}...`);

    for (let i = 0; i < baseProducts.length; i++) {
      const productData = baseProducts[i];
      try {
        const product = await prisma.product.create({
          data: {
            title: productData.title,
            url: `${website.url}/product-${i}-${Date.now()}`,
            price: productData.price,
            originalPrice: productData.originalPrice,
            description: productData.description,
            imageUrl: productData.imageUrl,
            websiteId: website.id,
            colors: {
              create: productData.colors,
            },
            sizes: {
              create: productData.sizes,
            },
          },
          include: {
            colors: true,
            sizes: true,
          },
        });
        console.log(`  ✅ Added: ${product.title}`);
      } catch (error) {
        console.log(`  ⚠️ Skipped: ${productData.title} (might already exist)`);
      }
    }
  }

  console.log('\n✨ Seeding complete!');
  const totalProducts = await prisma.product.count();
  console.log(`📊 Total products in database: ${totalProducts}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e.message);
  process.exit(1);
});
