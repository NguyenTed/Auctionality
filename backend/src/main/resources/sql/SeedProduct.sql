INSERT INTO product (seller_id, category_id, title, status, start_price, current_price, buy_now_price, bid_increment, start_time, end_time)
VALUES
    (1, 1, 'Apple iPhone 13 Pro Max 256GB', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (2, 1, 'Sony WH-1000XM5 Noise Cancelling Headphones', 'active', 150, 150, 350, 5, NOW(), NOW() + INTERVAL '5 days'),
    (3, 1, 'Samsung 4K Smart TV 55-inch', 'active', 300, 300, 600, 10, NOW(), NOW() + INTERVAL '6 days'),

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
