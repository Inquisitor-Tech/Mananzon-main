const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manazon', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB for seeding');
  seedDatabase();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@manazon.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    console.log('👤 Created admin user:', adminUser.email);

    // Create test user
    const userPassword = await bcrypt.hash('user123', 12);
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@manazon.com',
      password: userPassword,
      role: 'user',
      isActive: true,
      emailVerified: true,
      addresses: [
        {
          type: 'home',
          street: '123 Magic Lane',
          city: 'Wizard City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          isDefault: true
        }
      ]
    });
    console.log('👤 Created test user:', testUser.email);

    // Create products
    const products = [
      {
        name: 'Magic Wand (Unicorn Hair Core)',
        description: 'A magnificent wand crafted from ancient oak wood with a unicorn hair core. This wand is perfect for both beginners and advanced wizards, offering exceptional control and magical conductivity. The unicorn hair core provides a natural affinity for charm and healing spells.',
        price: 10.90,
        priceCents: 1090,
        category: 'wand',
        sku: 'WAND-UH-001',
        inventory: {
          quantity: 25,
          lowStockThreshold: 5,
          trackQuantity: true
        },
        rating: {
          stars: 4.5,
          count: 87
        },
        keywords: ['wand', 'unicorn hair', 'focus', 'spellcasting', 'beginner friendly'],
        images: [
          {
            url: 'images/products/magic-wand.jpg',
            alt: 'Magic Wand with Unicorn Hair Core',
            isMain: true
          }
        ],
        attributes: {
          material: 'Oak Wood',
          dimensions: {
            length: 12,
            width: 1,
            height: 1,
            unit: 'inches'
          },
          weight: {
            value: 50,
            unit: 'g'
          },
          core: 'Unicorn Hair'
        },
        isFeatured: true,
        tags: ['bestseller', 'beginner', 'healing']
      },
      {
        name: 'Shrunken Head',
        description: 'An authentic shrunken head from the Amazon rainforest, carefully preserved and enchanted with protective wards. This mystical artifact is believed to bring good fortune and protection to its owner. Each head is unique and comes with its own history.',
        price: 20.95,
        priceCents: 2095,
        category: 'other',
        sku: 'SHRNK-001',
        inventory: {
          quantity: 8,
          lowStockThreshold: 3,
          trackQuantity: true
        },
        rating: {
          stars: 4.0,
          count: 127
        },
        keywords: ['cursed', 'decor', 'necromancy', 'protection', 'amazon'],
        images: [
          {
            url: 'images/products/shrunken-head.png',
            alt: 'Authentic Shrunken Head',
            isMain: true
          }
        ],
        attributes: {
          material: 'Organic',
          dimensions: {
            length: 6,
            width: 5,
            height: 5,
            unit: 'inches'
          },
          weight: {
            value: 200,
            unit: 'g'
          },
          origin: 'Amazon Rainforest'
        },
        tags: ['rare', 'protection', 'decorative']
      },
      {
        name: 'Dragon Egg',
        description: 'A rare dragon egg believed to be from a Common Welsh Green dragon. The egg has been magically preserved to maintain its potential for hatching. Dragon eggs are extremely rare and highly sought after by collectors and magical creature enthusiasts.',
        price: 7.99,
        priceCents: 799,
        category: 'creature',
        sku: 'DRG-EGG-001',
        inventory: {
          quantity: 3,
          lowStockThreshold: 1,
          trackQuantity: true
        },
        rating: {
          stars: 4.5,
          count: 56
        },
        keywords: ['dragon', 'egg', 'creatures', 'rare', 'hatching'],
        images: [
          {
            url: 'images/products/dragon-egg.jpg',
            alt: 'Dragon Egg',
            isMain: true
          }
        ],
        attributes: {
          dimensions: {
            length: 8,
            width: 6,
            height: 6,
            unit: 'inches'
          },
          weight: {
            value: 500,
            unit: 'g'
          },
          species: 'Common Welsh Green'
        },
        isFeatured: true,
        tags: ['rare', 'creature', 'collector']
      },
      {
        name: 'Mandrake Plant',
        description: 'A fully grown mandrake plant, carefully cultivated in magical greenhouses. This particular specimen is known for its potent restorative properties and is commonly used in advanced healing potions. Comes with specialized ear protection for safe handling.',
        price: 18.99,
        priceCents: 1899,
        category: 'ingredient',
        sku: 'MAND-001',
        inventory: {
          quantity: 15,
          lowStockThreshold: 5,
          trackQuantity: true
        },
        rating: {
          stars: 5.0,
          count: 1002
        },
        keywords: ['herbology', 'plant', 'ingredient', 'screaming plant', 'healing'],
        images: [
          {
            url: 'images/products/mandrake.jpg',
            alt: 'Mandrake Plant',
            isMain: true
          }
        ],
        attributes: {
          type: 'Magical Plant',
          dimensions: {
            length: 12,
            width: 8,
            height: 8,
            unit: 'inches'
          },
          weight: {
            value: 300,
            unit: 'g'
          },
          potency: 'High'
        },
        isFeatured: true,
        tags: ['healing', 'potion ingredient', 'herbology']
      },
      {
        name: 'Spell Book: Advanced Magic',
        description: 'A comprehensive spell book covering advanced magical techniques and rare spells. Written by renowned wizard Albus Dumbledore, this tome includes detailed instructions for complex transfiguration, defensive spells, and advanced charm work. Essential for any serious magic practitioner.',
        price: 30.00,
        priceCents: 3000,
        category: 'book',
        sku: 'SPELL-ADV-001',
        inventory: {
          quantity: 12,
          lowStockThreshold: 3,
          trackQuantity: true
        },
        rating: {
          stars: 4.0,
          count: 167
        },
        keywords: ['spell', 'learning', 'wizardry', 'advanced', 'transfiguration'],
        images: [
          {
            url: 'images/products/spell-book.jpg',
            alt: 'Advanced Spell Book',
            isMain: true
          }
        ],
        attributes: {
          material: 'Leather Bound',
          dimensions: {
            length: 10,
            width: 8,
            height: 2,
            unit: 'inches'
          },
          weight: {
            value: 800,
            unit: 'g'
          },
          pages: 500,
          author: 'Albus Dumbledore'
        },
        tags: ['advanced', 'learning', 'spellcraft']
      },
      {
        name: 'Necronomicon',
        description: 'The infamous Necronomicon, a book of ancient and forbidden spells. This rare grimoire contains powerful necromantic rituals and dark magic. Handle with extreme caution - this book is not for the faint of heart and should only be used by experienced practitioners.',
        price: 100.00,
        priceCents: 10000,
        category: 'book',
        sku: 'NECR-001',
        inventory: {
          quantity: 2,
          lowStockThreshold: 1,
          trackQuantity: true
        },
        rating: {
          stars: 5.0,
          count: 626
        },
        keywords: ['learning', 'necromancy', 'forbidden', 'dark magic', 'ritual'],
        images: [
          {
            url: 'images/products/necronomicon.jpg',
            alt: 'The Necronomicon',
            isMain: true
          }
        ],
        attributes: {
          material: 'Human Skin Bound',
          dimensions: {
            length: 12,
            width: 9,
            height: 3,
            unit: 'inches'
          },
          weight: {
            value: 1200,
            unit: 'g'
          },
          pages: 300,
          language: 'Ancient Sumerian'
        },
        isFeatured: true,
        tags: ['forbidden', 'rare', 'dark magic', 'advanced']
      },
      {
        name: 'Key of Solomon',
        description: 'A complete edition of the Key of Solomon, containing detailed instructions for summoning and commanding spirits. This grimoire is essential for practitioners of demonology and exorcism. Includes protective circles, sigils, and detailed summoning rituals.',
        price: 50.00,
        priceCents: 5000,
        category: 'book',
        sku: 'SOLO-001',
        inventory: {
          quantity: 6,
          lowStockThreshold: 2,
          trackQuantity: true
        },
        rating: {
          stars: 3.5,
          count: 1200
        },
        keywords: ['demonology', 'exorcism', 'beginner', 'summoning', 'ritual'],
        images: [
          {
            url: 'images/products/key-of-solomon.jpg',
            alt: 'Key of Solomon',
            isMain: true
          }
        ],
        attributes: {
          material: 'Vellum',
          dimensions: {
            length: 11,
            width: 8,
            height: 2.5,
            unit: 'inches'
          },
          weight: {
            value: 900,
            unit: 'g'
          },
          pages: 400,
          language: 'Latin'
        },
        tags: ['summoning', 'exorcism', 'ritual magic']
      },
      {
        name: 'Phoenix Feather',
        description: 'A genuine phoenix feather, harvested during the bird\'s natural molting cycle. Phoenix feathers are incredibly powerful magical components, especially useful in wand cores and healing potions. Each feather contains a spark of the phoenix\'s regenerative magic.',
        price: 35.00,
        priceCents: 3500,
        category: 'ingredient',
        sku: 'PHNX-FTH-001',
        inventory: {
          quantity: 10,
          lowStockThreshold: 3,
          trackQuantity: true
        },
        rating: {
          stars: 4.0,
          count: 254
        },
        keywords: ['feather', 'alchemy', 'pyromancy', 'healing', 'regeneration'],
        images: [
          {
            url: 'images/products/phoenix-feather.jpg',
            alt: 'Phoenix Feather',
            isMain: true
          }
        ],
        attributes: {
          dimensions: {
            length: 8,
            width: 2,
            height: 0.5,
            unit: 'inches'
          },
          weight: {
            value: 5,
            unit: 'g'
          },
          magicalProperties: ['Healing', 'Regeneration', 'Fire Resistance']
        },
        tags: ['rare', 'healing', 'alchemy', 'wand core']
      },
      {
        name: 'Wizard Robe',
        description: 'Traditional wizard robe made from enchanted fabric that provides minor magical protection. These robes are standard issue at most magical academies and feature embroidered house crests and reinforced pockets for wands and spell components.',
        price: 7.99,
        priceCents: 799,
        category: 'clothing',
        type: 'clothing',
        sku: 'ROBE-001',
        inventory: {
          quantity: 30,
          lowStockThreshold: 10,
          trackQuantity: true
        },
        rating: {
          stars: 4.5,
          count: 56
        },
        keywords: ['robes', 'academy', 'uniform', 'protection', 'clothing'],
        images: [
          {
            url: 'images/products/wizard-robe.jpg',
            alt: 'Wizard Academy Robe',
            isMain: true
          }
        ],
        attributes: {
          material: 'Enchanted Cotton',
          dimensions: {
            length: 48,
            width: 24,
            height: 2,
            unit: 'inches'
          },
          weight: {
            value: 500,
            unit: 'g'
          },
          size: 'One Size Fits Most',
          sizeChartLink: 'images/clothing-size-chart.png'
        },
        tags: ['uniform', 'academy', 'protection', 'clothing']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Add some products to test user's wishlist
    testUser.wishlist = [
      createdProducts[0]._id, // Magic Wand
      createdProducts[3]._id, // Mandrake Plant
      createdProducts[7]._id  // Phoenix Feather
    ];
    await testUser.save();
    console.log('❤️ Added products to test user wishlist');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@manazon.com / admin123');
    console.log('   User:  user@manazon.com  / user123');
    console.log('\n🔗 API URL: http://localhost:5000/api');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}
