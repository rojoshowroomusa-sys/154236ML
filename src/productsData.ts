import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // --- MERCADO LIBRE ---
  {
    id: 'ml-1',
    title: 'Sony WH-1000XM5 Noise Canceling Headphones',
    price: 349.00,
    originalPrice: 399.99,
    discount: 12,
    store: 'Mercado Libre',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 1248,
    url: 'https://www.mercadolibre.com',
    description: 'Industry leading noise canceling headphones with Auto NC Optimizer, crystal clear hands-free calling, and Alexa voice control.',
    specs: {
      'Battery Life': 'Up to 30 hours',
      'Noise Canceling': 'Industry Leading Dual Noise Sensor',
      'Connectivity': 'Bluetooth 5.2, Multipoint',
      'Charging': 'USB-C Quick Charge (3 min for 3 hours)'
    },
    featured: true
  },
  {
    id: 'ml-2',
    title: 'Breville Barista Pro Espresso Machine',
    price: 799.95,
    originalPrice: 849.95,
    discount: 5,
    store: 'Mercado Libre',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 452,
    url: 'https://www.mercadolibre.com',
    description: 'Barista-quality performance with a new intuitive interface that provides all the information you need to create third wave specialty coffee at home.',
    specs: {
      'Water Tank': '2.0 Liters',
      'Heating System': 'ThermoJet (3-second heat up)',
      'Grinder': 'Integrated conical burr (30 grind settings)',
      'Pressure': '15 Bar'
    },
    featured: true
  },
  {
    id: 'ml-3',
    title: 'iPhone 15 Pro Max - 256GB Titanium',
    price: 1199.00,
    originalPrice: 1299.00,
    discount: 7,
    store: 'Mercado Libre',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewsCount: 890,
    url: 'https://www.mercadolibre.com',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    specs: {
      'Processor': 'A17 Pro Chip',
      'Display': '6.7" Super Retina XDR OLED',
      'Camera': '48MP Main, 5x Telephoto',
      'Material': 'Aerospace-grade Titanium'
    },
    featured: true
  },
  {
    id: 'ml-4',
    title: 'Ergonomic Mesh Office Chair with Lumbar Support',
    price: 189.50,
    originalPrice: 249.99,
    discount: 24,
    store: 'Mercado Libre',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    reviewsCount: 1650,
    url: 'https://www.mercadolibre.com',
    description: 'High-back mesh chair designed to provide comfortable back and lumbar support, promoting a healthy posture during long working hours.',
    specs: {
      'Material': 'High-density Breathable Mesh',
      'Weight Capacity': 'Up to 300 lbs',
      'Adjustability': 'Headrest, Armrests, Lumbar, Recline',
      'Gas Lift': 'Class 4 Heavy Duty'
    },
    featured: true
  },

  // --- AMAZON ---
  {
    id: 'am-1',
    title: 'Kindle Scribe – Reading and Writing (10.2" 300 ppi)',
    price: 339.99,
    originalPrice: 369.99,
    discount: 8,
    store: 'Amazon',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 1894,
    url: 'https://www.amazon.com',
    description: 'The first Kindle for reading and writing, featuring a 10.2" 300 ppi paperwhite display. Take notes within millions of titles, write journals, and draw.',
    specs: {
      'Display': '10.2" Paperwhite (300 ppi)',
      'Pen': 'Basic or Premium Pen included',
      'Storage': '16GB, 32GB, or 64GB',
      'Battery Life': 'Weeks of battery life'
    },
    featured: true
  },
  {
    id: 'am-2',
    title: 'Echo Pop Compact Smart Speaker with Alexa',
    price: 39.99,
    store: 'Amazon',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    reviewsCount: 3410,
    url: 'https://www.amazon.com',
    description: 'This compact smart speaker with Alexa features full sound that\'s great for bedrooms and small spaces. Control music with your voice, set timers, and ask questions.',
    specs: {
      'Speaker': '1.95" front-firing speaker',
      'Voice Assistant': 'Amazon Alexa Built-In',
      'Connectivity': 'Dual-band Wi-Fi, Bluetooth',
      'Privacy': 'Microphone off button'
    },
    featured: true
  },
  {
    id: 'am-3',
    title: 'Fire TV Stick 4K Max Streaming Device',
    price: 59.99,
    originalPrice: 64.99,
    discount: 7,
    store: 'Amazon',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 8200,
    url: 'https://www.amazon.com',
    description: 'Our most powerful streaming stick with 40% more power than Fire TV Stick 4K, featuring faster app starts and fluid navigation.',
    specs: {
      'Resolution': '4K Ultra HD, HDR, Dolby Vision',
      'Processor': 'Quad-core 2.0GHz',
      'Wi-Fi': 'Wi-Fi 6E Support',
      'Remote': 'Alexa Voice Remote Enhanced'
    },
    featured: true
  },
  {
    id: 'am-4',
    title: 'Audio-Technica Premium Wireless ANC Headphones',
    price: 299.99,
    originalPrice: 349.00,
    discount: 14,
    store: 'Amazon',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 980,
    url: 'https://www.amazon.com',
    description: 'High-fidelity audio meets digital hybrid active noise-cancelling technology for the ultimate personal listening experience.',
    specs: {
      'Drivers': '40 mm custom-designed',
      'Battery Life': 'Up to 50 hours',
      'Audio Codecs': 'LDAC, AAC, SBC',
      'Microphone': 'Beamforming mic technology'
    },
    featured: false
  },

  // --- ALIEXPRESS ---
  {
    id: 'al-1',
    title: 'G68 RGB Hot-Swappable Mechanical Keyboard',
    price: 42.50,
    originalPrice: 88.50,
    discount: 52,
    store: 'AliExpress',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 520,
    url: 'https://www.aliexpress.com',
    description: '68-key compact layout with hot-swappable switches, gorgeous pre-key RGB lighting, dual-mode wireless connectivity, and premium linear yellow switches.',
    specs: {
      'Layout': '65% Compact (68 keys)',
      'Switches': 'Gateron Yellow Linear (Hot-swappable)',
      'Backlight': 'Full RGB (18 pre-set modes)',
      'Connection': '2.4G Wireless + Bluetooth 5.0 + USB-C'
    },
    featured: true
  },
  {
    id: 'al-2',
    title: '4K Ultra Laser Projector Pro - Home Theater',
    price: 749.00,
    originalPrice: 1200.00,
    discount: 38,
    store: 'AliExpress',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600',
    rating: 4.4,
    reviewsCount: 88,
    url: 'https://www.aliexpress.com',
    description: 'Immersive home theater experience with a true 4K ultra-short-throw laser projection, delivering breathtaking brightness and color accuracy.',
    specs: {
      'Resolution': 'True 4K (3840 x 2160)',
      'Brightness': '2500 ANSI Lumens',
      'Projection Size': '80" to 150" UST',
      'Audio': 'Dolby Atmos Audio integrated'
    },
    featured: true
  },
  {
    id: 'al-3',
    title: 'Skeleton Automatic Mechanical Sport Watch',
    price: 125.00,
    originalPrice: 227.00,
    discount: 45,
    store: 'AliExpress',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 312,
    url: 'https://www.aliexpress.com',
    description: 'Exquisite skeleton automatic watch featuring self-winding movement, mineral glass lens, premium stainless steel bracelet, and water resistance up to 50m.',
    specs: {
      'Movement': 'Automatic Self-Winding',
      'Case Diameter': '42 mm',
      'Water Resistance': '5 ATM (50 meters)',
      'Band Material': 'Stainless Steel'
    },
    featured: true
  },
  {
    id: 'al-4',
    title: 'Tactile RGB Mechanical Keyboard - Pro Series',
    price: 64.50,
    originalPrice: 79.99,
    discount: 19,
    store: 'AliExpress',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 712,
    url: 'https://www.aliexpress.com',
    description: 'Premium gaming mechanical keyboard with aluminum alloy top frame, customizable tactile switches, dedicated media keys, and plush magnetic wrist rest.',
    specs: {
      'Layout': 'Tenkeyless (87 keys)',
      'Switches': 'Outemu Brown Tactile (Lubed)',
      'Material': 'Aircraft-grade Aluminum Top Plate',
      'N-Key Rollover': '100% Anti-Ghosting'
    },
    featured: false
  },
  {
    id: 'al-5',
    title: 'Vlogging Camera 4K Ultra HD with Flip Screen',
    price: 419.00,
    originalPrice: 499.00,
    discount: 16,
    store: 'AliExpress',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    rating: 4.3,
    reviewsCount: 145,
    url: 'https://www.aliexpress.com',
    description: 'Perfect camera for creators, featuring 4K video, 48MP photos, a 3.0" 180-degree flip screen, autofocus, and external microphone support.',
    specs: {
      'Sensor': 'CMOS 48 Megapixels',
      'Video Resolution': '4K at 30fps / 1080p at 60fps',
      'Screen': '3.0" IPS 180° Rotating Flip',
      'Lens': 'Wide Angle Lens & Macro Lens Kit'
    },
    featured: false
  },
  {
    id: 'al-6',
    title: 'Ultra Smart Watch Series 5 - Titanium Case',
    price: 199.00,
    originalPrice: 299.00,
    discount: 33,
    store: 'AliExpress',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    reviewsCount: 420,
    url: 'https://www.aliexpress.com',
    description: 'Rugged titanium smart watch designed for outdoor adventures with standalone GPS, altitude tracking, cellular connectivity, and IP68 water resistance.',
    specs: {
      'Material': 'Aviation Titanium Case',
      'Screen': '1.96" Always-On AMOLED',
      'Battery Life': 'Up to 14 Days (Standard mode)',
      'Sensors': 'ECG, Heart Rate, SpO2, Altimeter'
    },
    featured: false
  },

  // EXTRA FASHION ITEMS FOR CATEGORY COVERAGE
  {
    id: 'fa-1',
    title: 'Water-Resistant Technical Windbreaker',
    price: 89.00,
    originalPrice: 120.00,
    discount: 25,
    store: 'Amazon',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    rating: 4.4,
    reviewsCount: 310,
    url: 'https://www.amazon.com',
    description: 'Lightweight technical windbreaker jacket designed with waterproof zippers, adjustable drawstrings, and reflective accents for running and urban styling.',
    specs: {
      'Material': '100% Recycled Nylon',
      'Waterproof': 'DWR (Durable Water Repellent) coating',
      'Features': 'Hidden pockets, adjustable hood',
      'Weight': 'Lightweight (180g)'
    }
  },
  {
    id: 'fa-2',
    title: 'Handcrafted Minimalist Leather Wallet',
    price: 49.99,
    store: 'Mercado Libre',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 154,
    url: 'https://www.mercadolibre.com',
    description: 'Genuine full-grain leather wallet designed for simplicity and ease of access. Holds up to 8 cards and folded cash with RFID protection.',
    specs: {
      'Material': 'Full Grain Vegetable-Tanned Leather',
      'Capacity': '8 Cards + Cash slot',
      'Security': 'RFID Blocking Technology',
      'Stitching': 'Heavy Duty Waxed Thread'
    }
  },

  // --- OUTDOOR & ADVENTURE (Aire Libre) ---
  {
    id: 'out-1',
    title: 'Yeti Hopper Flip 12 Portable Soft Cooler',
    price: 249.99,
    originalPrice: 299.99,
    discount: 17,
    store: 'Amazon',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1533630195456-13785340624a?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 421,
    url: 'https://www.amazon.com',
    description: 'The Hopper Flip 12 has ColdCell Insulation, a closed-cell foam that offers superior cold-holding to ordinary soft coolers, with a capacity of up to 12 cans plus ice.',
    specs: {
      'Material': 'High-density fabric, waterproof',
      'Insulation': 'ColdCell closed-cell foam',
      'Capacity': '12 cans + ice ratio',
      'Leakproof': 'HydroLok Zipper technology'
    },
    featured: true
  },
  {
    id: 'out-2',
    title: 'Waterproof 4-Person Instant Cabin Tent',
    price: 119.99,
    originalPrice: 149.99,
    discount: 20,
    store: 'Mercado Libre',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 231,
    url: 'https://www.mercadolibre.com',
    description: 'Specially engineered instant cabin tent setups in under 60 seconds with a pre-assembled pole framework. Stay completely dry with WeatherTec weatherproofing.',
    specs: {
      'Capacity': '4 Persons',
      'Setup Time': 'Under 1 minute',
      'Material': 'Polyguard dual-thick fabric',
      'Waterproof': 'WeatherTec welded corners'
    },
    featured: false
  },
  {
    id: 'out-3',
    title: 'Ultralight Inflatable Camping Sleeping Pad',
    price: 24.50,
    originalPrice: 45.00,
    discount: 45,
    store: 'AliExpress',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    reviewsCount: 1105,
    url: 'https://www.aliexpress.com',
    description: 'Ergonomically engineered cell design is built for ultimate support and side-sleeping luxury. Inflates in 10-15 breaths and deflates in seconds.',
    specs: {
      'Weight': 'Only 490 grams (Ultralight)',
      'Thickness': '2.5 inches of supportive lift',
      'R-Value': '2.1 for multi-season comfort',
      'Material': '40D Nylon ripstop + TPU layer'
    },
    featured: false
  },

  // --- TOOLS & HOME IMPROVEMENT (Herramientas) ---
  {
    id: 'tl-1',
    title: 'DEWALT 20V MAX Cordless Drill & Driver Kit',
    price: 99.00,
    originalPrice: 159.00,
    discount: 37,
    store: 'Amazon',
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewsCount: 14502,
    url: 'https://www.amazon.com',
    description: 'Compact and lightweight driver design fits into tight work areas. Features a high performance motor delivering 300 unit watts out of pure power.',
    specs: {
      'Voltage': '20 Volts MAX',
      'Speed Settings': 'Two speed transmissions (0-450 / 1500 RPM)',
      'Chuck Size': '1/2-inch keyless sleeve',
      'Weight': '3.6 lbs'
    },
    featured: true
  },
  {
    id: 'tl-2',
    title: 'Bosch Professional Digital Laser Measure (165ft)',
    price: 79.50,
    originalPrice: 99.99,
    discount: 20,
    store: 'Mercado Libre',
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    reviewsCount: 884,
    url: 'https://www.mercadolibre.com',
    description: 'Extremely accurate and easy-to-use digital measuring tool. Measures up to 165 feet with +/- 1/16 in. precision and features a vibrant backlit color screen.',
    specs: {
      'Range': 'Up to 165 Feet (50 meters)',
      'Accuracy': '+/- 1/16 Inch (1.5mm)',
      'Memory': 'Stores last 10 measurements',
      'Protection': 'IP54 Dust and Splash Resistant'
    },
    featured: false
  },
  {
    id: 'tl-3',
    title: '120-in-1 Precision Magnetic Screwdriver Set',
    price: 15.90,
    originalPrice: 29.90,
    discount: 46,
    store: 'AliExpress',
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 3412,
    url: 'https://www.aliexpress.com',
    description: 'Ultimate repairing tool set containing 101 high-quality magnetic bits and essential tool accessories for repairing phones, laptops, and watches.',
    specs: {
      'Bits Count': '101 CR-V steel magnetic bits',
      'Material': 'Premium Chrome Vanadium Steel',
      'Handle': 'Ergonomic non-slip silicone grip',
      'Case': 'Dual-sided organizing carrying case'
    },
    featured: false
  },

  // --- TOYS & ENTERTAINMENT (Diversión) ---
  {
    id: 'ent-1',
    title: 'Nintendo Switch - OLED Model (White Joy-Con)',
    price: 319.99,
    originalPrice: 349.99,
    discount: 8,
    store: 'Amazon',
    category: 'Entertainment',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewsCount: 8934,
    url: 'https://www.amazon.com',
    description: 'Features a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.',
    specs: {
      'Screen': '7.0-inch OLED display',
      'Storage': '64 GB High-Speed Flash',
      'Modes': 'TV Mode, Tabletop Mode, Handheld Mode',
      'Controllers': 'Includes left and right Joy-Con'
    },
    featured: true
  },
  {
    id: 'ent-2',
    title: 'DJI Mini 3 Lightweight Drone with 4K HDR Camera',
    price: 429.00,
    originalPrice: 469.00,
    discount: 8,
    store: 'Mercado Libre',
    category: 'Entertainment',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    reviewsCount: 1042,
    url: 'https://www.mercadolibre.com',
    description: 'An ultra-compact and fold-ready companion drone, weighing less than 249 grams. Features stellar 4K HDR video and True Vertical Shooting support.',
    specs: {
      'Weight': 'Under 249g (No registration needed)',
      'Video': '4K HDR at 30 fps',
      'Battery Life': 'Up to 38 minutes flight time',
      'Transmission': 'Up to 10 km HD digital video'
    },
    featured: true
  },
  {
    id: 'ent-3',
    title: 'Retro Portable Handheld Game Console',
    price: 18.50,
    originalPrice: 39.99,
    discount: 53,
    store: 'AliExpress',
    category: 'Entertainment',
    image: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=600',
    rating: 4.4,
    reviewsCount: 1845,
    url: 'https://www.aliexpress.com',
    description: 'Pocket-friendly classical game console loaded with 400 built-in old school games. Connects to TV screens with an included AV out cord.',
    specs: {
      'Games': '400 Classical games integrated',
      'Screen': '3.0" Color LCD display',
      'Battery': '1020mAh rechargeable Li-ion',
      'Outputs': 'AV out, Headphone jack, USB-C'
    },
    featured: false
  },

  // --- TEMU ---
  {
    id: 'tm-1',
    title: 'LED Strip Lights 10M RGB Smart WiFi + App Control',
    price: 8.99,
    originalPrice: 24.99,
    discount: 64,
    store: 'Temu',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    reviewsCount: 8420,
    url: 'https://www.temu.com',
    description: 'Transform any room with vibrant color-changing LED strips. Control via app or voice assistant, set schedules, sync to music, and choose from 16 million colors.',
    specs: {
      'Length': '10 meters (32.8 ft)',
      'Control': 'WiFi + Alexa + Google Home',
      'Colors': '16 million RGB colors',
      'IP Rating': 'IP65 water resistant'
    },
    featured: true
  },
  {
    id: 'tm-2',
    title: 'Portable Mini Projector 1080P HD – 150" Display',
    price: 39.99,
    originalPrice: 89.99,
    discount: 55,
    store: 'Temu',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
    rating: 4.3,
    reviewsCount: 3210,
    url: 'https://www.temu.com',
    description: 'Pocket-sized projector that delivers up to 150-inch display with full HD clarity. Built-in speaker, HDMI and USB ports, supports phone screen mirroring.',
    specs: {
      'Resolution': '1080P Full HD Support',
      'Screen Size': 'Up to 150 inches',
      'Connectivity': 'HDMI, USB, AV, WiFi Mirroring',
      'Speaker': 'Built-in Dual Stereo'
    },
    featured: true
  },
  {
    id: 'tm-3',
    title: 'Stainless Steel Insulated Water Bottle 1L – BPA Free',
    price: 6.49,
    originalPrice: 19.99,
    discount: 67,
    store: 'Temu',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    reviewsCount: 14800,
    url: 'https://www.temu.com',
    description: 'Double-wall vacuum insulated bottle keeps drinks cold for 24h or hot for 12h. Leakproof lid, wide mouth for ice cubes, BPA-free food-grade stainless steel.',
    specs: {
      'Capacity': '1 Liter (34 oz)',
      'Insulation': 'Double-wall vacuum',
      'Cold': 'Up to 24 hours cold',
      'Hot': 'Up to 12 hours hot'
    },
    featured: true
  },
  {
    id: 'tm-4',
    title: 'Wireless Earbuds ANC – 40H Playtime + Charging Case',
    price: 18.99,
    originalPrice: 49.99,
    discount: 62,
    store: 'Temu',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600',
    rating: 4.4,
    reviewsCount: 6750,
    url: 'https://www.temu.com',
    description: 'Premium true wireless earbuds with active noise cancellation, transparency mode, and up to 40 hours total playtime including the fast-charge case.',
    specs: {
      'Battery': '8H buds + 32H case (40H total)',
      'ANC': 'Active Noise Cancellation + Transparency Mode',
      'Connectivity': 'Bluetooth 5.3',
      'Charge': '15-min fast charge = 3H play'
    },
    featured: true
  }
];
