import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Seller, Product, Order, Review } from '../models/Schemas';

const MONGODB_URI = 'mongodb://localhost:27017/nearnest';

// Coordinates of Kozhikode Beach (Reference Hub Center)
// Lat: 11.2588, Lng: 75.7804
const KozhikodeCenter = { lat: 11.2588, lng: 75.7804 };

// Helper function to generate unique referral codes
const generateReferralCode = (name: string, suffix: string): string => {
  return `${name.substring(0, 4).toUpperCase()}${suffix}`;
};

const seedDB = async () => {
  try {
    console.log('🌱 Starting NearNest Database Seeding...');
    await mongoose.connect(MONGODB_URI);
    
    // Drop duplicate index if it exists to allow clean seeding
    try {
      await User.collection.dropIndex('referralCode_1');
    } catch (err) {
      // Index doesn't exist, that's fine
    }
    
    // Clear existing data
    await User.deleteMany({});
    await Seller.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Existing collections cleared successfully');

    // Hashing standard password
    const passwordHash = await bcrypt.hash('password123', 10);

    // ----------------------------------------------------
    // 1. CREATE USERS
    // ----------------------------------------------------
    const buyerUser = new User({
      name: 'Ananya Ramesh',
      email: 'buyer@nearnest.in',
      phone: '9876543210',
      passwordHash,
      role: ['buyer'],
      isEmailVerified: true,
      isPhoneVerified: true,
      walletBalance: 250,
      referralCode: 'ANANYA50',
      addresses: [
        {
          label: 'Home (Calicut Beach)',
          addressLine: 'House No 12, Beach Road, Kozhikode',
          city: 'Kozhikode',
          state: 'Kerala',
          pincode: '673032',
          location: { type: 'Point', coordinates: [75.7725, 11.2581] }, // [lng, lat] (Close to Beach)
          isDefault: true
        },
        {
          label: 'Office (Mavoor Road)',
          addressLine: 'CyberPark Calicut, By-pass Road, Kozhikode',
          city: 'Kozhikode',
          state: 'Kerala',
          pincode: '673016',
          location: { type: 'Point', coordinates: [75.8202, 11.2750] }, // CyberPark
          isDefault: false
        }
      ],
      defaultAddressIndex: 0
    });

    const sellerUser = new User({
      name: 'Chef Haris Malabar',
      email: 'seller@nearnest.in',
      phone: '8765432109',
      passwordHash,
      role: ['buyer', 'seller'],
      isEmailVerified: true,
      isPhoneVerified: true,
      walletBalance: 0,
      referralCode: 'HARIS100'
    });

    const adminUser = new User({
      name: 'SuperAdmin NearNest',
      email: 'admin@nearnest.in',
      phone: '7654321098',
      passwordHash,
      role: ['buyer', 'admin', 'superadmin'],
      isEmailVerified: true,
      isPhoneVerified: true,
      walletBalance: 0,
      referralCode: 'NEARSUPER'
    });

    await buyerUser.save();
    await sellerUser.save();
    await adminUser.save();
    console.log('👤 Standard accounts (buyer, seller, admin) created');

    // ----------------------------------------------------
    // 2. CREATE SELLERS
    // ----------------------------------------------------
    
    // Seller 1: Calicut Crusts & Crumbs (Bakery) - 1.2km from center
    const seller1 = new Seller({
      userId: sellerUser._id,
      businessName: 'Calicut Crusts & Crumbs',
      slug: 'calicut-crusts-crumbs',
      description: 'Artisan home bakery crafting organic sourdough, customized theme cakes, and warm cookies.',
      category: 'bakery',
      subCategories: ['Cakes', 'Breads', 'Cookies'],
      logo: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200',
      banner: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600',
      location: { type: 'Point', coordinates: [75.7720, 11.2580] },
      address: {
        addressLine: 'Door No 4A, Gandhi Road Cross, Gandhi Junction',
        city: 'Kozhikode',
        state: 'Kerala',
        pincode: '673011'
      },
      deliveryRadiusKm: 8,
      deliveryOptions: ['self-delivery', 'pickup'],
      baseDeliveryFee: 20,
      perKmRate: 5,
      maxDeliveryFee: 60,
      freeDeliveryAbove: 500,
      isOpen: true,
      isApproved: true,
      approvalStatus: 'approved',
      bankDetails: {
        accountHolder: 'Haris K.V.',
        accountNumber: '10928374652',
        ifscCode: 'SBIN0000858',
        bankName: 'State Bank of India'
      },
      rating: { average: 4.8, count: 18 },
      totalOrders: 42,
      totalRevenue: 15400
    });

    // Seller 2: Malabar Spice Meals (Meals) - 0.8km from center
    const seller2User = new User({
      name: 'Suhara Fathima',
      email: 'suhara@nearnest.in',
      phone: '9567843210',
      passwordHash,
      role: ['buyer', 'seller'],
      referralCode: generateReferralCode('Suhara', '200')
    });
    await seller2User.save();

    const seller2 = new Seller({
      userId: seller2User._id,
      businessName: 'Malabar Spice Kitchen',
      slug: 'malabar-spice-kitchen',
      description: 'Traditional home-cooked Calicut biryanis, authentic tiffin services, and fresh curries made on order.',
      category: 'food',
      subCategories: ['Biryani', 'Meals', 'Tiffin'],
      logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      banner: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      location: { type: 'Point', coordinates: [75.7870, 11.2640] },
      address: {
        addressLine: 'Arafa House, Mavoor Road, Near KSRTC, Kozhikode',
        city: 'Kozhikode',
        state: 'Kerala',
        pincode: '673001'
      },
      deliveryRadiusKm: 5,
      deliveryOptions: ['self-delivery', 'pickup'],
      baseDeliveryFee: 25,
      perKmRate: 6,
      maxDeliveryFee: 50,
      freeDeliveryAbove: 300,
      isOpen: true,
      isApproved: true,
      approvalStatus: 'approved',
      bankDetails: {
        accountHolder: 'Suhara Fathima',
        accountNumber: '9876123455',
        ifscCode: 'FDRL0001004',
        bankName: 'Federal Bank'
      },
      rating: { average: 4.9, count: 24 },
      totalOrders: 65,
      totalRevenue: 28900
    });

    // Seller 3: Kozhikode Clay & Candle Crafts (Crafts) - 2.4km from center
    const seller3User = new User({
      name: 'Ragesh Kumar',
      email: 'ragesh@nearnest.in',
      phone: '9123456780',
      passwordHash,
      role: ['buyer', 'seller'],
      referralCode: generateReferralCode('Ragesh', '300')
    });
    await seller3User.save();

    const seller3 = new Seller({
      userId: seller3User._id,
      businessName: 'Clay & Candle Craft Co.',
      slug: 'clay-candle-craft-co',
      description: 'Earthy hand-poured soy wax candles, organic essential oils, and hand-carved clay pottery home decor.',
      category: 'crafts',
      subCategories: ['Candles', 'Pottery', 'Decor'],
      logo: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=200',
      banner: 'https://images.unsplash.com/photo-1602872030219-aa06422b5fee?w=600',
      location: { type: 'Point', coordinates: [75.7950, 11.2480] },
      address: {
        addressLine: 'Ragam Villa, Chalappuram, Kozhikode',
        city: 'Kozhikode',
        state: 'Kerala',
        pincode: '673002'
      },
      deliveryRadiusKm: 15,
      deliveryOptions: ['pickup', 'self-delivery'],
      baseDeliveryFee: 30,
      perKmRate: 4,
      maxDeliveryFee: 100,
      isOpen: true,
      isApproved: true,
      approvalStatus: 'approved',
      bankDetails: {
        accountHolder: 'Ragesh Kumar',
        accountNumber: '4455889922',
        ifscCode: 'ICIC0000032',
        bankName: 'ICICI Bank'
      },
      rating: { average: 4.7, count: 9 },
      totalOrders: 14,
      totalRevenue: 7200
    });

    // Seller 4: Thalassery Treat Snacks (Snacks) - 3.2km from center
    const seller4User = new User({
      name: 'Aisha Mahmood',
      email: 'aisha@nearnest.in',
      phone: '8281123456',
      passwordHash,
      role: ['buyer', 'seller'],
      referralCode: generateReferralCode('Aisha', '400')
    });
    await seller4User.save();

    const seller4 = new Seller({
      userId: seller4User._id,
      businessName: 'Thalassery Treat Snacks',
      slug: 'thalassery-treat-snacks',
      description: 'Authentic Malabar snacks: banana chips fried in coconut oil, sweet unnakaya, and spicy samosas.',
      category: 'snacks',
      subCategories: ['Chips', 'Fried Snacks', 'Sweets'],
      logo: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200',
      banner: 'https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=600',
      location: { type: 'Point', coordinates: [75.7680, 11.2720] },
      address: {
        addressLine: 'Flat 3B, Crescent Arcade, East Hill, Kozhikode',
        city: 'Kozhikode',
        state: 'Kerala',
        pincode: '673005'
      },
      deliveryRadiusKm: 10,
      deliveryOptions: ['self-delivery', 'pickup'],
      baseDeliveryFee: 20,
      perKmRate: 5,
      maxDeliveryFee: 70,
      isOpen: true,
      isApproved: true,
      approvalStatus: 'approved',
      bankDetails: {
        accountHolder: 'Aisha Mahmood',
        accountNumber: '112233445566',
        ifscCode: 'BARB0KOZHIK',
        bankName: 'Bank of Baroda'
      },
      rating: { average: 4.9, count: 32 },
      totalOrders: 110,
      totalRevenue: 18200
    });

    // Seller 5: Pending Seller Application (For Admin Testing) - 2.0km from center
    const pendingSellerUser = new User({
      name: 'Deepa Raj',
      email: 'deepa@nearnest.in',
      phone: '9000112233',
      passwordHash,
      role: ['buyer'],
      referralCode: generateReferralCode('Deepa', '500')
    });
    await pendingSellerUser.save();

    const pendingSeller = new Seller({
      userId: pendingSellerUser._id,
      businessName: 'Vatakara Spice & Pickles',
      slug: 'vatakara-spice-pickles',
      description: 'Traditional grandma-recipe pickles, homemade masala mixes, and virgin coconut oils.',
      category: 'snacks',
      location: { type: 'Point', coordinates: [75.7900, 11.2500] },
      address: {
        addressLine: 'Kalyani Nivas, Bilathikulam, Kozhikode',
        city: 'Kozhikode',
        state: 'Kerala',
        pincode: '673006'
      },
      isOpen: false,
      isApproved: false,
      approvalStatus: 'pending',
      bankDetails: {
        accountHolder: 'Deepa Raj',
        accountNumber: '9988776655',
        ifscCode: 'SBIN0070188',
        bankName: 'State Bank of India'
      }
    });

    await seller1.save();
    await seller2.save();
    await seller3.save();
    await seller4.save();
    await pendingSeller.save();
    console.log('🏡 Mock sellers verified and pending approvals added');

    // ----------------------------------------------------
    // 3. CREATE PRODUCTS
    // ----------------------------------------------------
    const productsToSeed = [
      // Products for Seller 1 (Calicut Crusts & Crumbs)
      {
        sellerId: seller1._id,
        title: 'Homemade Organic Sourdough Boule',
        slug: 'homemade-organic-sourdough-boule',
        description: 'Naturally fermented for 24 hours, extra crusty, soft open crumb inside. Excellent for breakfasts and gourmet toast.',
        ingredients: 'Organic stone-ground wheat flour, spring water, wild starter yeast, sea salt.',
        allergens: ['Wheat / Gluten'],
        images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600'],
        category: 'bakery',
        tags: ['sourdough', 'bread', 'bakery', 'organic'],
        dietaryTags: ['vegan', 'vegetarian'],
        price: 180,
        discountedPrice: 150,
        unit: '450g boule',
        stock: 5,
        preparationTimeMinutes: 60,
        location: seller1.location
      },
      {
        sellerId: seller1._id,
        title: 'Double Chocolate Fudge Brownies',
        slug: 'double-chocolate-fudge-brownies',
        description: 'Super fudgy rich chocolate brownies containing melted dark chocolate chunks. Crackly shiny crust on top!',
        ingredients: 'Callebaut dark chocolate, cocoa powder, country eggs, butter, brown sugar.',
        allergens: ['Egg', 'Dairy', 'Wheat'],
        images: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600'],
        category: 'bakery',
        tags: ['brownies', 'chocolate', 'dessert', 'fudge'],
        dietaryTags: ['vegetarian'],
        price: 240,
        unit: 'Box of 6',
        stock: 12,
        preparationTimeMinutes: 30,
        location: seller1.location
      },

      // Products for Seller 2 (Malabar Spice Kitchen)
      {
        sellerId: seller2._id,
        title: 'Classic Calicut Chicken Biryani',
        slug: 'classic-calicut-chicken-biryani',
        description: 'Authentic Malabar biryani layered with aromatic Kaima rice, local spices, ghee-cooked chicken, caramelized onions, and cashews.',
        ingredients: 'Aromatic Kaima rice, country chicken, pure Malabar spices, ghee, curd, saffron, fried onions.',
        allergens: ['Dairy / Ghee'],
        images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600'],
        category: 'food',
        tags: ['biryani', 'chicken', 'malabar', 'meals', 'lunch'],
        dietaryTags: ['halal'],
        price: 220,
        discountedPrice: 199,
        unit: '1 Portion with Raita',
        stock: 15,
        preparationTimeMinutes: 45,
        location: seller2.location
      },
      {
        sellerId: seller2._id,
        title: 'Kerala Fish Curry (Neymeen)',
        slug: 'kerala-fish-curry-neymeen',
        description: 'Spicy Seer fish curry prepared in traditional clay pot with organic coconut milk and sour Gambooge (Kudampuli).',
        ingredients: 'Seer fish (Neymeen), Kudampuli, freshly extracted coconut milk, ginger, curry leaves, red chilies.',
        allergens: ['Fish'],
        images: ['https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600'],
        category: 'food',
        tags: ['curry', 'fish', 'kerala', 'spicy'],
        dietaryTags: ['halal'],
        price: 320,
        unit: '500ml container',
        stock: 8,
        preparationTimeMinutes: 40,
        location: seller2.location
      },

      // Products for Seller 3 (Clay & Candle Craft Co.)
      {
        sellerId: seller3._id,
        title: 'Hand-poured Lavender Soy Wax Candle',
        slug: 'hand-poured-lavender-soy-wax-candle',
        description: 'Calming lavender oil infused clean-burning soy wax candle. Housed in reusable hand-crafted earthenware pottery.',
        ingredients: '100% natural soy wax, pure organic lavender essential oil, wood wick.',
        allergens: [],
        images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600'],
        category: 'crafts',
        tags: ['candle', 'lavender', 'scented', 'decor', 'gift'],
        dietaryTags: [],
        price: 450,
        unit: '1 Candle (40hr Burn)',
        stock: 20,
        isUnlimitedStock: true,
        preparationTimeMinutes: 10,
        location: seller3.location
      },

      // Products for Seller 4 (Thalassery Treat Snacks)
      {
        sellerId: seller4._id,
        title: 'Coconut Oil Banana Chips',
        slug: 'coconut-oil-banana-chips',
        description: 'Thin, crispy, stone-salted raw Nedran banana chips fried in freshly pressed pure coconut oil. Zero preservatives.',
        ingredients: 'Nendran bananas, pure coconut oil, stone salt, turmeric.',
        allergens: [],
        images: ['https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600'],
        category: 'snacks',
        tags: ['chips', 'banana', 'snacks', 'traditional'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
        price: 130,
        discountedPrice: 120,
        unit: '250g packet',
        stock: 30,
        preparationTimeMinutes: 15,
        location: seller4.location
      },
      {
        sellerId: seller4._id,
        title: 'Homemade Aromatic Malabar Unnakaya',
        slug: 'homemade-aromatic-malabar-unnakaya',
        description: 'Traditional steamed banana rolls stuffed with sweetened grated coconut, cardamoms, and fried raisins, deep-fried to golden.',
        ingredients: 'Ripe bananas, grated coconut, sugar, ghee, raisins, cardamom.',
        allergens: ['Dairy'],
        images: ['https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=600'],
        category: 'snacks',
        tags: ['unnakaya', 'sweet', 'banana', 'ramadan', 'snack'],
        dietaryTags: ['vegetarian'],
        price: 150,
        unit: 'Box of 5 pieces',
        stock: 10,
        preparationTimeMinutes: 30,
        location: seller4.location
      }
    ];

    const seededProducts = [];
    for (const prodData of productsToSeed) {
      const prod = new Product(prodData);
      await prod.save();
      seededProducts.push(prod);
    }
    console.log(`📦 Seeded ${seededProducts.length} premium products`);

    // ----------------------------------------------------
    // 4. CREATE MOCK ORDERS
    // ----------------------------------------------------
    
    // Order 1: Completed Order (Delivered)
    const order1 = new Order({
      orderNumber: 'NNO-20260519-03829',
      buyerId: buyerUser._id,
      sellerId: seller1._id,
      items: [
        {
          productId: seededProducts[0]._id,
          title: seededProducts[0].title,
          image: seededProducts[0].images[0],
          price: seededProducts[0].price,
          quantity: 2,
          subtotal: seededProducts[0].price * 2
        }
      ],
      itemsTotal: seededProducts[0].price * 2,
      deliveryFee: 20,
      platformFee: 5,
      discount: 20, // applied wallet
      total: (seededProducts[0].price * 2) + 20 + 5 - 20,
      commissionAmount: Math.round((seededProducts[0].price * 2) * 0.1),
      sellerEarnings: (seededProducts[0].price * 2) + 20 - Math.round((seededProducts[0].price * 2) * 0.1),
      deliveryAddress: {
        addressLine: buyerUser.addresses[0].addressLine,
        city: buyerUser.addresses[0].city,
        state: buyerUser.addresses[0].state,
        pincode: buyerUser.addresses[0].pincode,
        location: buyerUser.addresses[0].location
      },
      deliveryMode: 'delivery',
      status: 'delivered',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 48*60*60*1000), note: 'Order placed by buyer' },
        { status: 'accepted', timestamp: new Date(Date.now() - 47*60*60*1000), note: 'Seller accepted order' },
        { status: 'preparing', timestamp: new Date(Date.now() - 47*60*60*1000), note: 'Sourdough dough is baking' },
        { status: 'out_for_delivery', timestamp: new Date(Date.now() - 46*60*60*1000) },
        { status: 'delivered', timestamp: new Date(Date.now() - 46*60*60*1000), note: 'Handed over to customer' }
      ],
      paymentStatus: 'paid',
      paymentMethod: 'Razorpay',
      paymentId: 'pay_ABC123456XYZ',
      isReviewed: true
    });

    // Order 2: Incoming Order (Active - Placed)
    const order2 = new Order({
      orderNumber: 'NNO-20260521-99823',
      buyerId: buyerUser._id,
      sellerId: seller2._id,
      items: [
        {
          productId: seededProducts[2]._id,
          title: seededProducts[2].title,
          image: seededProducts[2].images[0],
          price: seededProducts[2].price,
          quantity: 1,
          subtotal: seededProducts[2].price
        }
      ],
      itemsTotal: seededProducts[2].price,
      deliveryFee: 25,
      platformFee: 5,
      discount: 0,
      total: seededProducts[2].price + 25 + 5,
      commissionAmount: Math.round(seededProducts[2].price * 0.1),
      sellerEarnings: seededProducts[2].price + 25 - Math.round(seededProducts[2].price * 0.1),
      deliveryAddress: {
        addressLine: buyerUser.addresses[0].addressLine,
        city: buyerUser.addresses[0].city,
        state: buyerUser.addresses[0].state,
        pincode: buyerUser.addresses[0].pincode,
        location: buyerUser.addresses[0].location
      },
      deliveryMode: 'delivery',
      status: 'placed',
      statusHistory: [
        { status: 'placed', timestamp: new Date(), note: 'Awaiting seller acceptance' }
      ],
      paymentStatus: 'paid',
      paymentMethod: 'Razorpay',
      paymentId: 'pay_99988887776'
    });

    await order1.save();
    await order2.save();
    console.log('🧾 Seeded active & completed orders successfully');

    // ----------------------------------------------------
    // 5. CREATE MOCK REVIEWS
    // ----------------------------------------------------
    const review = new Review({
      orderId: order1._id,
      productId: seededProducts[0]._id,
      sellerId: seller1._id,
      buyerId: buyerUser._id,
      productRating: 5,
      sellerRating: 5,
      comment: 'Absolutely incredible sourdough! Still warm when it arrived, beautiful thick crunchy crust and wonderful sour aroma. Will buy every single week!',
      images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300'],
      helpfulCount: 4
    });

    await review.save();
    console.log('⭐ Seeded product reviews');

    console.log('🎉 Database seeding completed successfully! Close connection.');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
