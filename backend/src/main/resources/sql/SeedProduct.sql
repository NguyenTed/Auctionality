INSERT INTO product (seller_id, category_id, title, status, start_price, current_price, buy_now_price, bid_increment, start_time, end_time)
VALUES
    (1, 17, 'Ancient Chinese Liao Dynasty Rare Terracotta Tablet Tsa-Tsa With Three Buddhas (No reserve price)', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (2, 17, 'Chupícuaro, Guanajuato, México Terracotta Bowl. 400 BC – 100 AD. 10 cm diameter. Spanish Export License.  (No Reserve Price)', 'active', 150, 150, 350, 5, NOW(), NOW() + INTERVAL '5 days'),
    (3, 17, 'European Padlock with original key - 4.5 cm  (No reserve price)', 'active', 300, 300, 600, 10, NOW(), NOW() + INTERVAL '6 days'),
    (1, 17, 'Viking Era Silver decorated Amulet', 'active', 500, 500, 900, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 17, 'Luristan Bronze, Interesting Pendant  (No reserve price)', 'active', 1000, 1000, 9000, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 17, 'Medieval Bronze, Rare & Interesting Islam Seal Ring (No reserve price)', 'active', 600, 600, 2000, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 17, 'Ancient Egyptian Wood, Gold Sculpture of the God Min. New Kingdom, 1550-1070 BC. 12.5 cm height.', 'active', 800, 800, 4000, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 17, 'Ancient Roman Roman glassware - Relief-decorated pitcher - intact - with export license', 'active', 250, 250, 6000, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 17, 'Ancient Roman Gold Ring', 'active', 7000, 7000, 10000, 10, NOW(), NOW() + INTERVAL '7 days'),
    (1, 17, 'Ancient Roman Gold Earrings', 'active', 4000, 4000, 12000, 10, NOW(), NOW() + INTERVAL '7 days');

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

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (6,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/5/7/0/5704e98a-7d4e-48bb-90b8-5e93983e7196.jpg@webp', true),
    (6,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/d/d/a/ddac27d9-7a01-4bcf-9957-58e0bfbddb73.jpg@webp', false),
    (6,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/5/0/d/50d4584a-c476-421b-acb7-7d64123ace92.jpg@webp', false),
    (6,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/5/e/f/5ef98c6e-1c9f-4734-b95f-c17066a66c1b.jpg@webp', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (7,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2024/7/18/b/e/4/be426c1f-d95d-4e02-8177-c1b643e64912.jpg@webp', true),
    (7,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2024/7/18/e/c/b/ecb6f396-53ef-4a3a-b04c-960a4d6dfae8.jpg@webp', false),
    (7,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2024/7/18/9/0/b/90b986b1-17b5-48d6-b9e7-9d0101b119d9.jpg@webp', false),
    (7,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2024/7/18/8/8/7/887a2309-cdb1-41e6-be28-53b36b535014.jpg@webp', false),
    (7,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2024/7/18/5/6/3/5632cb04-3050-4d67-886b-2286f986edc8.jpg@webp', false),
    (7,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2024/7/18/a/7/e/a7e4e05c-60a8-4c00-aab4-a5707b8f2425.jpg', false),
    (7,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2024/7/18/8/4/4/844de92a-4b5e-4b63-b878-9c01a5b55bc8.jpg', false);


INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (8,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/6/7/4/5/745a0a9e-22aa-4323-8fcc-219d41b41521.jpg@webp', true),
    (8,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/6/7/6/4/7647162a-7000-4a7a-90cf-5cab358c9c0f.jpg@webp', false),
    (8,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/6/e/b/8/eb8c582f-4160-4032-861e-a73fdfde6183.jpg@webp', false),
    (8,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/6/f/0/b/f0bf027a-51a8-4512-ac9b-de11771d0dd4.jpg@webp', false),
    (8,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/9/6/6/5/9/659eba9f-f0c9-4f38-bbbb-00bd92772f8f.jpg@webp', false),
    (8,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/9/6/e/0/8/e08af320-d940-4a72-8c70-237fedd8972d.jpg', false),
    (8,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/9/6/1/4/7/147a4cd0-6fae-4dbf-b276-4e161890fa56.jpg', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (9,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/2/2/0/6/2065a7fe-c2ed-40a0-8db2-b23911b8d3ff.jpg@webp', true),
    (9,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/2/3/a/e/3ae5ca66-fa0c-428d-b94c-1c9d76a6787a.jpg@webp', false),
    (9,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/2/c/8/3/c83d8832-8f63-4594-99ae-2f163ed250b8.jpg@webp', false),
    (9,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/2/2/a/d/2ada171c-a7f0-4d52-adde-2b8232afd6b6.jpg@webp', false),
    (9,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/7/2/7/a/0/7a0dfb5d-c718-4457-bf8c-30c57758d268.jpg@webp', false),
    (9,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/7/2/0/9/2/092a8ff1-940a-4106-969c-9bc3818c134b.jpg', false),
    (9,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/7/2/b/e/8/be8a7248-ef1c-41ed-9196-a24eb2247ae4.jpg', false);

INSERT INTO product_image (product_id, url, is_thumbnail)
VALUES
    (10,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/6/7/9/6793aefe-cf4d-4d9d-a1a3-69ae3c602f87.jpg@webp', true),
    (10,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/7/9/2/7920e8fa-24ca-4383-a5ea-2b36b9a1fad3.jpg@webp', false),
    (10,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/f/5/9/f59bca83-9eca-4a73-9665-6b0979365ca6.jpg@webp', false),
    (10,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/5/1/0/510f8983-76a6-46e1-918f-61238a47420a.jpg@webp', false),
    (10,  'https://assets.catawiki.com/image/cw_ldp_l/plain/assets/catawiki/assets/2025/12/17/a/8/4/a844585b-aa30-4c18-b49e-efaaad4e0cc5.jpg@webp', false),
    (10,  'https://assets.catawiki.com/image/cw_large/plain/assets/catawiki/assets/2025/12/17/7/d/3/7d3a6791-fda6-4b44-b47b-2328575b8008.jpg', false);

INSERT INTO product_extra_description(product_id, content, created_at)
SELECT
    gs AS product_id,
    repeat('Lorem ipsum ', 10) || substr(md5(random()::text), 1, 20) AS content,
    NOW() AS created_at
FROM generate_series(1, 10) AS gs;

