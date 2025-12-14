-- Seed default roles
INSERT INTO role (name, description) VALUES
    ('GUEST', 'Anonymous guest user'),
    ('BUYER', 'Registered buyer/bidder'),
    ('SELLER', 'Seller (upgraded from buyer)'),
    ('ADMIN', 'Administrator')
ON CONFLICT (name) DO NOTHING;

-- Seed default permissions
INSERT INTO permission (name, description) VALUES
    -- Product permissions
    ('PRODUCT_VIEW', 'View products'),
    ('PRODUCT_CREATE', 'Create new products'),
    ('PRODUCT_UPDATE', 'Update products'),
    ('PRODUCT_DELETE_OWN', 'Delete own products'),
    ('PRODUCT_DELETE', 'Delete any product (admin only)'),
    
    -- Bid permissions
    ('BID_PLACE', 'Place bids on products'),
    ('BID_VIEW_OWN', 'View own bids'),
    ('BID_VIEW_ALL', 'View all bids (admin/seller)'),
    
    -- Watchlist permissions
    ('WATCHLIST_MANAGE', 'Manage watchlist'),
    
    -- Category permissions
    ('CATEGORY_VIEW', 'View categories'),
    ('CATEGORY_MANAGE', 'Manage categories (admin only)'),
    
    -- User permissions
    ('USER_VIEW_OWN', 'View own profile'),
    ('USER_UPDATE_OWN', 'Update own profile'),
    ('USER_MANAGE', 'Manage users (admin only)'),
    
    -- Order permissions
    ('ORDER_VIEW_OWN', 'View own orders'),
    ('ORDER_CREATE', 'Create orders'),
    ('ORDER_UPDATE', 'Update orders'),
    
    -- System permissions
    ('SYSTEM_MANAGE', 'System administration (admin only)')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to BUYER role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'BUYER'
AND p.name IN (
    'PRODUCT_VIEW',
    'BID_PLACE',
    'BID_VIEW_OWN',
    'WATCHLIST_MANAGE',
    'CATEGORY_VIEW',
    'USER_VIEW_OWN',
    'USER_UPDATE_OWN',
    'ORDER_VIEW_OWN',
    'ORDER_CREATE'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to SELLER role (includes all BUYER permissions)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'SELLER'
AND p.name IN (
    'PRODUCT_VIEW',
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE_OWN',
    'BID_PLACE',
    'BID_VIEW_OWN',
    'BID_VIEW_ALL',
    'WATCHLIST_MANAGE',
    'CATEGORY_VIEW',
    'USER_VIEW_OWN',
    'USER_UPDATE_OWN',
    'ORDER_VIEW_OWN',
    'ORDER_CREATE',
    'ORDER_UPDATE'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to ADMIN role (all permissions)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

