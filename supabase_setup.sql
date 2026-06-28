-- SETUP DE BASE DE DATOS PARA SUPABASE (EJECUTAR EN EL SQL EDITOR)

-- 1. CREACIÓN DE TABLAS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    discount INTEGER,
    store TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    rating NUMERIC NOT NULL DEFAULT 0,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    store TEXT NOT NULL,
    discount TEXT NOT NULL,
    discount_value NUMERIC NOT NULL DEFAULT 0,
    min_order NUMERIC,
    description TEXT NOT NULL,
    category TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_hot BOOLEAN NOT NULL DEFAULT false,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. HABILITAR RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD
-- Lectura pública (Cualquiera puede ver productos y cupones)
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.products;
CREATE POLICY "Permitir lectura publica de productos" ON public.products
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de cupones" ON public.coupons;
CREATE POLICY "Permitir lectura publica de cupones" ON public.coupons
    FOR SELECT TO public USING (true);

-- Permisos de Escritura para el Administrador (admin@globalshop.com)
DROP POLICY IF EXISTS "Permitir escritura a admin en productos" ON public.products;
CREATE POLICY "Permitir escritura a admin en productos" ON public.products
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@globalshop.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@globalshop.com');

DROP POLICY IF EXISTS "Permitir escritura a admin en cupones" ON public.coupons;
CREATE POLICY "Permitir escritura a admin en cupones" ON public.coupons
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@globalshop.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@globalshop.com');

-- Permiso total a service_role (Bypass interno)
DROP POLICY IF EXISTS "Permitir todo a service_role en productos" ON public.products;
CREATE POLICY "Permitir todo a service_role en productos" ON public.products
    FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Permitir todo a service_role en cupones" ON public.coupons;
CREATE POLICY "Permitir todo a service_role en cupones" ON public.coupons
    FOR ALL TO service_role USING (true);


-- 4. INSERTAR DATOS INICIALES (Semilla)
-- Productos
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ml-1', 
    'Sony WH-1000XM5 Noise Canceling Headphones', 
    349, 
    399.99, 
    12, 
    'Mercado Libre', 
    'Electronics', 
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', 
    4.8, 
    1248, 
    'https://www.mercadolibre.com', 
    'Industry leading noise canceling headphones with Auto NC Optimizer, crystal clear hands-free calling, and Alexa voice control.', 
    '{"Battery Life":"Up to 30 hours","Noise Canceling":"Industry Leading Dual Noise Sensor","Connectivity":"Bluetooth 5.2, Multipoint","Charging":"USB-C Quick Charge (3 min for 3 hours)"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ml-2', 
    'Breville Barista Pro Espresso Machine', 
    799.95, 
    849.95, 
    5, 
    'Mercado Libre', 
    'Home & Kitchen', 
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600', 
    4.7, 
    452, 
    'https://www.mercadolibre.com', 
    'Barista-quality performance with a new intuitive interface that provides all the information you need to create third wave specialty coffee at home.', 
    '{"Water Tank":"2.0 Liters","Heating System":"ThermoJet (3-second heat up)","Grinder":"Integrated conical burr (30 grind settings)","Pressure":"15 Bar"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ml-3', 
    'iPhone 15 Pro Max - 256GB Titanium', 
    1199, 
    1299, 
    7, 
    'Mercado Libre', 
    'Electronics', 
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600', 
    4.9, 
    890, 
    'https://www.mercadolibre.com', 
    'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.', 
    '{"Processor":"A17 Pro Chip","Display":"6.7\" Super Retina XDR OLED","Camera":"48MP Main, 5x Telephoto","Material":"Aerospace-grade Titanium"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ml-4', 
    'Ergonomic Mesh Office Chair with Lumbar Support', 
    189.5, 
    249.99, 
    24, 
    'Mercado Libre', 
    'Home & Kitchen', 
    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600', 
    4.5, 
    1650, 
    'https://www.mercadolibre.com', 
    'High-back mesh chair designed to provide comfortable back and lumbar support, promoting a healthy posture during long working hours.', 
    '{"Material":"High-density Breathable Mesh","Weight Capacity":"Up to 300 lbs","Adjustability":"Headrest, Armrests, Lumbar, Recline","Gas Lift":"Class 4 Heavy Duty"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'am-1', 
    'Kindle Scribe – Reading and Writing (10.2" 300 ppi)', 
    339.99, 
    369.99, 
    8, 
    'Amazon', 
    'Electronics', 
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', 
    4.6, 
    1894, 
    'https://www.amazon.com', 
    'The first Kindle for reading and writing, featuring a 10.2" 300 ppi paperwhite display. Take notes within millions of titles, write journals, and draw.', 
    '{"Display":"10.2\" Paperwhite (300 ppi)","Pen":"Basic or Premium Pen included","Storage":"16GB, 32GB, or 64GB","Battery Life":"Weeks of battery life"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'am-2', 
    'Echo Pop Compact Smart Speaker with Alexa', 
    39.99, 
    NULL, 
    NULL, 
    'Amazon', 
    'Electronics', 
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600', 
    4.5, 
    3410, 
    'https://www.amazon.com', 
    'This compact smart speaker with Alexa features full sound that''s great for bedrooms and small spaces. Control music with your voice, set timers, and ask questions.', 
    '{"Speaker":"1.95\" front-firing speaker","Voice Assistant":"Amazon Alexa Built-In","Connectivity":"Dual-band Wi-Fi, Bluetooth","Privacy":"Microphone off button"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'am-3', 
    'Fire TV Stick 4K Max Streaming Device', 
    59.99, 
    64.99, 
    7, 
    'Amazon', 
    'Electronics', 
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600', 
    4.7, 
    8200, 
    'https://www.amazon.com', 
    'Our most powerful streaming stick with 40% more power than Fire TV Stick 4K, featuring faster app starts and fluid navigation.', 
    '{"Resolution":"4K Ultra HD, HDR, Dolby Vision","Processor":"Quad-core 2.0GHz","Wi-Fi":"Wi-Fi 6E Support","Remote":"Alexa Voice Remote Enhanced"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'am-4', 
    'Audio-Technica Premium Wireless ANC Headphones', 
    299.99, 
    349, 
    14, 
    'Amazon', 
    'Electronics', 
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600', 
    4.6, 
    980, 
    'https://www.amazon.com', 
    'High-fidelity audio meets digital hybrid active noise-cancelling technology for the ultimate personal listening experience.', 
    '{"Drivers":"40 mm custom-designed","Battery Life":"Up to 50 hours","Audio Codecs":"LDAC, AAC, SBC","Microphone":"Beamforming mic technology"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'al-1', 
    'G68 RGB Hot-Swappable Mechanical Keyboard', 
    42.5, 
    88.5, 
    52, 
    'AliExpress', 
    'Electronics', 
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600', 
    4.7, 
    520, 
    'https://www.aliexpress.com', 
    '68-key compact layout with hot-swappable switches, gorgeous pre-key RGB lighting, dual-mode wireless connectivity, and premium linear yellow switches.', 
    '{"Layout":"65% Compact (68 keys)","Switches":"Gateron Yellow Linear (Hot-swappable)","Backlight":"Full RGB (18 pre-set modes)","Connection":"2.4G Wireless + Bluetooth 5.0 + USB-C"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'al-2', 
    '4K Ultra Laser Projector Pro - Home Theater', 
    749, 
    1200, 
    38, 
    'AliExpress', 
    'Electronics', 
    'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600', 
    4.4, 
    88, 
    'https://www.aliexpress.com', 
    'Immersive home theater experience with a true 4K ultra-short-throw laser projection, delivering breathtaking brightness and color accuracy.', 
    '{"Resolution":"True 4K (3840 x 2160)","Brightness":"2500 ANSI Lumens","Projection Size":"80\" to 150\" UST","Audio":"Dolby Atmos Audio integrated"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'al-3', 
    'Skeleton Automatic Mechanical Sport Watch', 
    125, 
    227, 
    45, 
    'AliExpress', 
    'Fashion', 
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600', 
    4.6, 
    312, 
    'https://www.aliexpress.com', 
    'Exquisite skeleton automatic watch featuring self-winding movement, mineral glass lens, premium stainless steel bracelet, and water resistance up to 50m.', 
    '{"Movement":"Automatic Self-Winding","Case Diameter":"42 mm","Water Resistance":"5 ATM (50 meters)","Band Material":"Stainless Steel"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'al-4', 
    'Tactile RGB Mechanical Keyboard - Pro Series', 
    64.5, 
    79.99, 
    19, 
    'AliExpress', 
    'Electronics', 
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600', 
    4.8, 
    712, 
    'https://www.aliexpress.com', 
    'Premium gaming mechanical keyboard with aluminum alloy top frame, customizable tactile switches, dedicated media keys, and plush magnetic wrist rest.', 
    '{"Layout":"Tenkeyless (87 keys)","Switches":"Outemu Brown Tactile (Lubed)","Material":"Aircraft-grade Aluminum Top Plate","N-Key Rollover":"100% Anti-Ghosting"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'al-5', 
    'Vlogging Camera 4K Ultra HD with Flip Screen', 
    419, 
    499, 
    16, 
    'AliExpress', 
    'Electronics', 
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600', 
    4.3, 
    145, 
    'https://www.aliexpress.com', 
    'Perfect camera for creators, featuring 4K video, 48MP photos, a 3.0" 180-degree flip screen, autofocus, and external microphone support.', 
    '{"Sensor":"CMOS 48 Megapixels","Video Resolution":"4K at 30fps / 1080p at 60fps","Screen":"3.0\" IPS 180° Rotating Flip","Lens":"Wide Angle Lens & Macro Lens Kit"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'al-6', 
    'Ultra Smart Watch Series 5 - Titanium Case', 
    199, 
    299, 
    33, 
    'AliExpress', 
    'Electronics', 
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600', 
    4.5, 
    420, 
    'https://www.aliexpress.com', 
    'Rugged titanium smart watch designed for outdoor adventures with standalone GPS, altitude tracking, cellular connectivity, and IP68 water resistance.', 
    '{"Material":"Aviation Titanium Case","Screen":"1.96\" Always-On AMOLED","Battery Life":"Up to 14 Days (Standard mode)","Sensors":"ECG, Heart Rate, SpO2, Altimeter"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'fa-1', 
    'Water-Resistant Technical Windbreaker', 
    89, 
    120, 
    25, 
    'Amazon', 
    'Fashion', 
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600', 
    4.4, 
    310, 
    'https://www.amazon.com', 
    'Lightweight technical windbreaker jacket designed with waterproof zippers, adjustable drawstrings, and reflective accents for running and urban styling.', 
    '{"Material":"100% Recycled Nylon","Waterproof":"DWR (Durable Water Repellent) coating","Features":"Hidden pockets, adjustable hood","Weight":"Lightweight (180g)"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'fa-2', 
    'Handcrafted Minimalist Leather Wallet', 
    49.99, 
    NULL, 
    NULL, 
    'Mercado Libre', 
    'Fashion', 
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600', 
    4.7, 
    154, 
    'https://www.mercadolibre.com', 
    'Genuine full-grain leather wallet designed for simplicity and ease of access. Holds up to 8 cards and folded cash with RFID protection.', 
    '{"Material":"Full Grain Vegetable-Tanned Leather","Capacity":"8 Cards + Cash slot","Security":"RFID Blocking Technology","Stitching":"Heavy Duty Waxed Thread"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'out-1', 
    'Yeti Hopper Flip 12 Portable Soft Cooler', 
    249.99, 
    299.99, 
    17, 
    'Amazon', 
    'Outdoor', 
    'https://images.unsplash.com/photo-1533630195456-13785340624a?auto=format&fit=crop&q=80&w=600', 
    4.8, 
    421, 
    'https://www.amazon.com', 
    'The Hopper Flip 12 has ColdCell Insulation, a closed-cell foam that offers superior cold-holding to ordinary soft coolers, with a capacity of up to 12 cans plus ice.', 
    '{"Material":"High-density fabric, waterproof","Insulation":"ColdCell closed-cell foam","Capacity":"12 cans + ice ratio","Leakproof":"HydroLok Zipper technology"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'out-2', 
    'Waterproof 4-Person Instant Cabin Tent', 
    119.99, 
    149.99, 
    20, 
    'Mercado Libre', 
    'Outdoor', 
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600', 
    4.6, 
    231, 
    'https://www.mercadolibre.com', 
    'Specially engineered instant cabin tent setups in under 60 seconds with a pre-assembled pole framework. Stay completely dry with WeatherTec weatherproofing.', 
    '{"Capacity":"4 Persons","Setup Time":"Under 1 minute","Material":"Polyguard dual-thick fabric","Waterproof":"WeatherTec welded corners"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'out-3', 
    'Ultralight Inflatable Camping Sleeping Pad', 
    24.5, 
    45, 
    45, 
    'AliExpress', 
    'Outdoor', 
    'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=600', 
    4.5, 
    1105, 
    'https://www.aliexpress.com', 
    'Ergonomically engineered cell design is built for ultimate support and side-sleeping luxury. Inflates in 10-15 breaths and deflates in seconds.', 
    '{"Weight":"Only 490 grams (Ultralight)","Thickness":"2.5 inches of supportive lift","R-Value":"2.1 for multi-season comfort","Material":"40D Nylon ripstop + TPU layer"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tl-1', 
    'DEWALT 20V MAX Cordless Drill & Driver Kit', 
    99, 
    159, 
    37, 
    'Amazon', 
    'Tools', 
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600', 
    4.9, 
    14502, 
    'https://www.amazon.com', 
    'Compact and lightweight driver design fits into tight work areas. Features a high performance motor delivering 300 unit watts out of pure power.', 
    '{"Voltage":"20 Volts MAX","Speed Settings":"Two speed transmissions (0-450 / 1500 RPM)","Chuck Size":"1/2-inch keyless sleeve","Weight":"3.6 lbs"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tl-2', 
    'Bosch Professional Digital Laser Measure (165ft)', 
    79.5, 
    99.99, 
    20, 
    'Mercado Libre', 
    'Tools', 
    'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600', 
    4.7, 
    884, 
    'https://www.mercadolibre.com', 
    'Extremely accurate and easy-to-use digital measuring tool. Measures up to 165 feet with +/- 1/16 in. precision and features a vibrant backlit color screen.', 
    '{"Range":"Up to 165 Feet (50 meters)","Accuracy":"+/- 1/16 Inch (1.5mm)","Memory":"Stores last 10 measurements","Protection":"IP54 Dust and Splash Resistant"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tl-3', 
    '120-in-1 Precision Magnetic Screwdriver Set', 
    15.9, 
    29.9, 
    46, 
    'AliExpress', 
    'Tools', 
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600', 
    4.6, 
    3412, 
    'https://www.aliexpress.com', 
    'Ultimate repairing tool set containing 101 high-quality magnetic bits and essential tool accessories for repairing phones, laptops, and watches.', 
    '{"Bits Count":"101 CR-V steel magnetic bits","Material":"Premium Chrome Vanadium Steel","Handle":"Ergonomic non-slip silicone grip","Case":"Dual-sided organizing carrying case"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ent-1', 
    'Nintendo Switch - OLED Model (White Joy-Con)', 
    319.99, 
    349.99, 
    8, 
    'Amazon', 
    'Entertainment', 
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600', 
    4.9, 
    8934, 
    'https://www.amazon.com', 
    'Features a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.', 
    '{"Screen":"7.0-inch OLED display","Storage":"64 GB High-Speed Flash","Modes":"TV Mode, Tabletop Mode, Handheld Mode","Controllers":"Includes left and right Joy-Con"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ent-2', 
    'DJI Mini 3 Lightweight Drone with 4K HDR Camera', 
    429, 
    469, 
    8, 
    'Mercado Libre', 
    'Entertainment', 
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600', 
    4.8, 
    1042, 
    'https://www.mercadolibre.com', 
    'An ultra-compact and fold-ready companion drone, weighing less than 249 grams. Features stellar 4K HDR video and True Vertical Shooting support.', 
    '{"Weight":"Under 249g (No registration needed)","Video":"4K HDR at 30 fps","Battery Life":"Up to 38 minutes flight time","Transmission":"Up to 10 km HD digital video"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'ent-3', 
    'Retro Portable Handheld Game Console', 
    18.5, 
    39.99, 
    53, 
    'AliExpress', 
    'Entertainment', 
    'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=600', 
    4.4, 
    1845, 
    'https://www.aliexpress.com', 
    'Pocket-friendly classical game console loaded with 400 built-in old school games. Connects to TV screens with an included AV out cord.', 
    '{"Games":"400 Classical games integrated","Screen":"3.0\" Color LCD display","Battery":"1020mAh rechargeable Li-ion","Outputs":"AV out, Headphone jack, USB-C"}'::jsonb, 
    false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tm-1', 
    'LED Strip Lights 10M RGB Smart WiFi + App Control', 
    8.99, 
    24.99, 
    64, 
    'Temu', 
    'Home & Kitchen', 
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600', 
    4.5, 
    8420, 
    'https://www.temu.com', 
    'Transform any room with vibrant color-changing LED strips. Control via app or voice assistant, set schedules, sync to music, and choose from 16 million colors.', 
    '{"Length":"10 meters (32.8 ft)","Control":"WiFi + Alexa + Google Home","Colors":"16 million RGB colors","IP Rating":"IP65 water resistant"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tm-2', 
    'Portable Mini Projector 1080P HD – 150" Display', 
    39.99, 
    89.99, 
    55, 
    'Temu', 
    'Electronics', 
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600', 
    4.3, 
    3210, 
    'https://www.temu.com', 
    'Pocket-sized projector that delivers up to 150-inch display with full HD clarity. Built-in speaker, HDMI and USB ports, supports phone screen mirroring.', 
    '{"Resolution":"1080P Full HD Support","Screen Size":"Up to 150 inches","Connectivity":"HDMI, USB, AV, WiFi Mirroring","Speaker":"Built-in Dual Stereo"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tm-3', 
    'Stainless Steel Insulated Water Bottle 1L – BPA Free', 
    6.49, 
    19.99, 
    67, 
    'Temu', 
    'Outdoor', 
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600', 
    4.6, 
    14800, 
    'https://www.temu.com', 
    'Double-wall vacuum insulated bottle keeps drinks cold for 24h or hot for 12h. Leakproof lid, wide mouth for ice cubes, BPA-free food-grade stainless steel.', 
    '{"Capacity":"1 Liter (34 oz)","Insulation":"Double-wall vacuum","Cold":"Up to 24 hours cold","Hot":"Up to 12 hours hot"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, title, price, original_price, discount, store, category, image, rating, reviews_count, url, description, specs, featured)
VALUES (
    'tm-4', 
    'Wireless Earbuds ANC – 40H Playtime + Charging Case', 
    18.99, 
    49.99, 
    62, 
    'Temu', 
    'Electronics', 
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600', 
    4.4, 
    6750, 
    'https://www.temu.com', 
    'Premium true wireless earbuds with active noise cancellation, transparency mode, and up to 40 hours total playtime including the fast-charge case.', 
    '{"Battery":"8H buds + 32H case (40H total)","ANC":"Active Noise Cancellation + Transparency Mode","Connectivity":"Bluetooth 5.3","Charge":"15-min fast charge = 3H play"}'::jsonb, 
    true
) ON CONFLICT (id) DO NOTHING;

-- Cupones
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'amz-1', 
    'AMAZON15', 
    'Amazon', 
    '15% DTO', 
    15, 
    30, 
    'Electrónica y gadgets tecnológicos', 
    'Electronics', 
    '2026-06-30T08:30:35.430Z', 
    true, 
    500, 
    314
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'amz-2', 
    'PRIMEDAY10', 
    'Amazon', 
    '$10 DTO', 
    10, 
    50, 
    'Cualquier categoría, mínimo $50', 
    'General', 
    '2026-07-01T20:30:35.430Z', 
    false, 
    1000, 
    441
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'ml-1', 
    'MELI20NOW', 
    'Mercado Libre', 
    '20% DTO', 
    20, 
    25, 
    'Artículos para el hogar y cocina', 
    'Home & Kitchen', 
    '2026-06-29T20:30:35.430Z', 
    true, 
    300, 
    256
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'ml-2', 
    'MELIFREE', 
    'Mercado Libre', 
    'Envío GRATIS', 
    5, 
    NULL, 
    'Envío gratis en cualquier compra', 
    'General', 
    '2026-06-30T20:30:35.430Z', 
    false, 
    2000, 
    880
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'ali-1', 
    'ALISUPER', 
    'AliExpress', 
    '$5 DTO', 
    5, 
    20, 
    'Cualquier compra mayor a $20', 
    'General', 
    '2026-06-29T08:30:35.430Z', 
    true, 
    5000, 
    4120
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'ali-2', 
    'ALITECH30', 
    'AliExpress', 
    '30% DTO', 
    30, 
    40, 
    'Solo electrónica, mínimo $40', 
    'Electronics', 
    '2026-07-01T08:30:35.430Z', 
    false, 
    800, 
    390
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'tm-1', 
    'TEMU40OFF', 
    'Temu', 
    '40% DTO', 
    40, 
    15, 
    'Tu primera compra en Temu', 
    'General', 
    '2026-07-02T20:30:35.430Z', 
    true, 
    10000, 
    7230
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, store, discount, discount_value, min_order, description, category, expires_at, is_hot, max_uses, used_count)
VALUES (
    'tm-2', 
    'TEMUNEW15', 
    'Temu', 
    '$15 DTO', 
    15, 
    50, 
    'Nuevos usuarios, mínimo $50', 
    'General', 
    '2026-07-03T20:30:35.430Z', 
    false, 
    3000, 
    1540
) ON CONFLICT (id) DO NOTHING;
