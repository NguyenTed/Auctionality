INSERT INTO category (name, slug)
VALUES
    ('Electronics', 'electronics'),
    ('Fashion', 'fashion'),
    ('Home & Living', 'home-living'),
    ('Sports & Outdoors', 'sports-outdoors'),
    ('Collectibles', 'collectibles');
-- Subcategories for Electronics
INSERT INTO category (name, slug, parent_id)
VALUES
    ('Smartphones', 'smartphones', (SELECT id FROM category WHERE slug='electronics')),
    ('Laptops', 'laptops', (SELECT id FROM category WHERE slug='electronics')),
    ('Cameras', 'cameras', (SELECT id FROM category WHERE slug='electronics'));

-- Subcategories for Fashion
INSERT INTO category (name, slug, parent_id)
VALUES
    ('Men Clothing', 'men-clothing', (SELECT id FROM category WHERE slug='fashion')),
    ('Women Clothing', 'women-clothing', (SELECT id FROM category WHERE slug='fashion')),
    ('Shoes', 'shoes', (SELECT id FROM category WHERE slug='fashion'));

-- Subcategories for Home & Living
INSERT INTO category (name, slug, parent_id)
VALUES
    ('Furniture', 'furniture', (SELECT id FROM category WHERE slug='home-living')),
    ('Kitchenware', 'kitchenware', (SELECT id FROM category WHERE slug='home-living')),
    ('Decor', 'decor', (SELECT id FROM category WHERE slug='home-living'));

-- Subcategories for Sports & Outdoors
INSERT INTO category (name, slug, parent_id)
VALUES
    ('Exercise Equipment', 'exercise-equipment', (SELECT id FROM category WHERE slug='sports-outdoors')),
    ('Outdoor Gear', 'outdoor-gear', (SELECT id FROM category WHERE slug='sports-outdoors')),
    ('Cycling', 'cycling', (SELECT id FROM category WHERE slug='sports-outdoors'));

-- Subcategories for Collectibles
INSERT INTO category (name, slug, parent_id)
VALUES
    ('Figurines', 'figurines', (SELECT id FROM category WHERE slug='collectibles')),
    ('Trading Cards', 'trading-cards', (SELECT id FROM category WHERE slug='collectibles')),
    ('Vintage Items', 'vintage-items', (SELECT id FROM category WHERE slug='collectibles'));
