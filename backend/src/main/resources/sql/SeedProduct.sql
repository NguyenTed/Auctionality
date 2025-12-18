INSERT INTO product (seller_id, category_id, title, status, start_price, current_price, buy_now_price, bid_increment, start_time, end_time)
VALUES
    (1, 1, 'Ancient Chinese Liao Dynasty Rare Terracotta Tablet Tsa-Tsa With Three Buddhas (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (2, 1, 'Chupícuaro, Guanajuato, México Terracotta Bowl. 400 BC – 100 AD. 10 cm diameter. Spanish Export License.  (No Reserve Price)', 'active', 150, 150, 350, 5, NOW(), NOW() + INTERVAL '5 days'),
    (3, 1, 'European Padlock with original key - 4.5 cm  (No reserve price)', 'active', 300, 300, 600, 10, NOW(), NOW() + INTERVAL '6 days'),
    (1, 1, 'Viking Era Silver decorated Amulet', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 1, 'Luristan Bronze, Interesting Pendant  (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 1, 'Medieval, Crusaders Era Bronze Ring', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 1, 'Viking Era Bronze, Antique ring with runic symbols on the bezel - 16 mm - 9th/11th century AD Ring  (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 1, 'Ancient Egyptian to Roman Glass over 100 ancient beads  (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 1, 'Medieval, Crusaders Era Bronze, Top Cross Pendant  (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 1, 'Viking Era Ancient Omega amulet / pendant in bronze, Viking period, 900-1100 AD Amulet  (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days');



    (4, 2, 'Nike Air Max 270 Sneakers', 'active', 50, 50, 120, 2, NOW(), NOW() + INTERVAL '4 days'),
    (5, 2, 'Adidas Ultraboost Running Shoes', 'active', 60, 60, 130, 2, NOW(), NOW() + INTERVAL '4 days'),
    (6, 2, 'Men Premium Leather Wallet', 'active', 15, 15, 40, 1, NOW(), NOW() + INTERVAL '3 days'),

    (7, 3, 'Dyson V11 Vacuum Cleaner', 'active', 200, 200, 450, 10, NOW(), NOW() + INTERVAL '5 days'),
    (8, 3, 'IKEA Wooden Coffee Table', 'active', 30, 30, 80, 2, NOW(), NOW() + INTERVAL '6 days'),
    (9, 3, 'Philips Air Fryer XXL', 'active', 70, 70, 150, 3, NOW(), NOW() + INTERVAL '4 days'),

    (10, 4, 'Wilson Professional Tennis Racket', 'active', 40, 40, 110, 2, NOW(), NOW() + INTERVAL '3 days'),
    (10, 4, 'Camping Tent 4-Person Waterproof', 'active', 45, 45, 120, 2, NOW(), NOW() + INTERVAL '6 days'),
    (10, 4, 'Garmin Forerunner 245 GPS Watch', 'active', 80, 80, 200, 5, NOW(), NOW() + INTERVAL '4 days'),

    (10, 5, 'Vintage Pokémon Card Charizard 1999', 'active', 300, 300, 1200, 20, NOW(), NOW() + INTERVAL '10 days'),
    (10, 5, 'Star Wars Action Figure Limited Edition', 'active', 100, 100, 300, 5, NOW(), NOW() + INTERVAL '7 days'),
    (10, 5, 'Antique Silver Pocket Watch (1920s)', 'active', 120, 120, 400, 5, NOW(), NOW() + INTERVAL '8 days'),

    (1, 1, 'GoPro Hero 12 Black Action Camera', 'active', 180, 180, 350, 5, NOW(), NOW() + INTERVAL '5 days'),
    (2, 3, 'Premium Ceramic Vase Handmade', 'active', 20, 20, 55, 2, NOW(), NOW() + INTERVAL '4 days'),
    (3, 4, 'Professional Mountain Bike Helmet', 'active', 25, 25, 70, 2, NOW(), NOW() + INTERVAL '4 days'),
    (4, 2, 'Women Luxury Silk Scarf', 'active', 10, 10, 45, 1, NOW(), NOW() + INTERVAL '3 days'),
    (5, 5, 'Rare Coin Collection Set (1960–1980)', 'active', 80, 80, 220, 3, NOW(), NOW() + INTERVAL '6 days');

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (1,  'https://assets.catawiki.com/image/cw_lot_card/plain/assets/catawiki/assets/2025/12/3/7/d/e/7de94989-6170-4768-af59-22eae37c54e7.jpg@webp', true),
    (1,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/3/7/d/e/7de94989-6170-4768-af59-22eae37c54e7.jpg@webp', false),
    (1,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/3/3/0/8/30869174-9a10-4993-9a15-f2a287c34709.jpg@webp', false),
    (1,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/3/b/5/4/b540e2cf-c0e6-4155-9c78-e815e0fff1de.jpg@webp', false),
    (1,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/3/a/2/6/a2663f11-670c-4587-a4e8-ec76894e3159.jpg@webp', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (2,  'https://assets.catawiki.com/image/cw_lot_card/plain/assets/catawiki/assets/2025/9/16/6/3/7/63786049-f138-4603-9ec1-94138014b7f6.jpg@webp', true),
    (2,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/16/6/3/7/63786049-f138-4603-9ec1-94138014b7f6.jpg@webp', false),
    (2,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/16/e/e/c/eecc8e3b-724e-442d-8817-19492f20f3a2.jpg@webp', false),
    (2,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/16/c/b/2/cb2c2574-4405-4c01-a260-118afb623941.jpg@webp', false),
    (2,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/16/a/c/2/ac236cde-3e6a-4b80-8166-b4e51096c1f1.jpg@webp', false),
    (2,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/9/16/5/5/c/55c55180-c57c-408c-82c4-0a548d61a92f.jpg', false),
    (2,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/9/16/4/7/b/47ba67f1-6060-419c-bb40-cf34bb3abe54.jpg', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (3,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/8/d/4/0/d40a01cb-6de9-49a5-bb1e-be4b6265291b.jpg@webp', true),
    (3,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/8/8/f/a/8fab5eb8-89d2-45e1-8deb-b92dfa593e0f.jpg@webp', false),
    (3,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/8/b/d/9/bd9d91ed-cb59-4cda-a652-723fadede33d.jpg@webp', false),
    (3,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/8/8/f/5/8f588ff6-28e3-46a1-b3ea-2a69ab0604e8.jpg@webp', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (4,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/7/4/3/5/435dc160-65c7-47d9-a13c-6bd8ba45f7ca.jpg@webp', true),
    (4,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/7/8/5/3/853fbbaf-45c8-4e8b-a8a2-0f7e6f408a63.jpg@webp', false),
    (4,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/7/5/c/2/5c28f061-613e-4b8c-9154-0fc5cdf8df35.jpg@webp', false),
    (4,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/7/5/4/f/54ff551c-4838-4225-b6c3-c4279d57ef5d.jpg@webp', false),
    (4,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/7/e/7/c/e7c5551b-3dc7-4e2b-a93b-516acacc51f8.jpg@webp', false),
    (4,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/7/7/5/4/f/54ff551c-4838-4225-b6c3-c4279d57ef5d.jpg', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (5,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/7/a/1/4/a14e2d41-ce0e-4389-98a2-9048960f334c.jpg@webp', true),
    (5,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/7/7/7/d/77de03ed-3f1e-4dc4-a8ab-371de943981e.jpg@webp', false),
    (5,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/7/e/7/4/e74d3a7e-5dd2-4ba1-ae76-749268d2a620.jpg@webp', false),
    (5,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/7/1/f/2/1f2afc91-0652-497e-b8ac-93c5aabd3fe7.jpg@webp', false);
