-- =============================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =============================
-- These policies enforce data access at the database level
-- Session variables are set by Spring application based on authenticated user

-- Enable RLS on all tables that need row-level security
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answer ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_bid_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejected_bidder ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidder_approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_thread ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- Additional tables that need RLS enabled
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_login_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_upgrade_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_extra_description ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_auction_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_cancellation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_setting ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_moderation ENABLE ROW LEVEL SECURITY;

-- =============================
-- USER TABLE POLICIES
-- =============================

-- Users can see their own record
CREATE POLICY user_select_own ON "user"
    FOR SELECT
    USING (id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all users
CREATE POLICY user_select_admin ON "user"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Users can update their own record (except status and roles - handled by admin)
CREATE POLICY user_update_own ON "user"
    FOR UPDATE
    USING (id = current_setting('app.user_id', true)::INTEGER)
    WITH CHECK (id = current_setting('app.user_id', true)::INTEGER);

-- Admins can update any user
CREATE POLICY user_update_admin ON "user"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- USER_PROFILE TABLE POLICIES
-- =============================

-- Users can see their own profile
CREATE POLICY user_profile_select_own ON user_profile
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all profiles
CREATE POLICY user_profile_select_admin ON user_profile
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Users can update their own profile
CREATE POLICY user_profile_update_own ON user_profile
    FOR UPDATE
    USING (user_id = current_setting('app.user_id', true)::INTEGER)
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- PRODUCT TABLE POLICIES
-- =============================

-- Everyone can see active products (public read)
CREATE POLICY product_select_active ON product
    FOR SELECT
    USING (status = 'active');

-- Sellers can see their own products (including inactive)
CREATE POLICY product_select_own ON product
    FOR SELECT
    USING (seller_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all products
CREATE POLICY product_select_admin ON product
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Sellers can insert their own products
CREATE POLICY product_insert_seller ON product
    FOR INSERT
    WITH CHECK (
        seller_id = current_setting('app.user_id', true)::INTEGER
        AND EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name IN ('SELLER', 'ADMIN')
        )
    );

-- Sellers can update their own products
CREATE POLICY product_update_own ON product
    FOR UPDATE
    USING (seller_id = current_setting('app.user_id', true)::INTEGER)
    WITH CHECK (seller_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can update any product
CREATE POLICY product_update_admin ON product
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Sellers can delete their own products
CREATE POLICY product_delete_own ON product
    FOR DELETE
    USING (seller_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can delete any product
CREATE POLICY product_delete_admin ON product
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- BID TABLE POLICIES
-- =============================

-- Users can see their own bids
CREATE POLICY bid_select_own ON bid
    FOR SELECT
    USING (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- Sellers can see bids on their products
CREATE POLICY bid_select_seller ON bid
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = bid.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Admins can see all bids
CREATE POLICY bid_select_admin ON bid
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Users can insert their own bids
CREATE POLICY bid_insert_own ON bid
    FOR INSERT
    WITH CHECK (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- WATCHLIST_ITEM TABLE POLICIES
-- =============================

-- Users can see only their own watchlist items
CREATE POLICY watchlist_select_own ON watchlist_item
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own watchlist items
CREATE POLICY watchlist_insert_own ON watchlist_item
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can delete their own watchlist items
CREATE POLICY watchlist_delete_own ON watchlist_item
    FOR DELETE
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- ORDER TABLE POLICIES
-- =============================

-- Buyers can see their own orders
CREATE POLICY order_select_buyer ON "order"
    FOR SELECT
    USING (buyer_id = current_setting('app.user_id', true)::INTEGER);

-- Sellers can see orders for their products
CREATE POLICY order_select_seller ON "order"
    FOR SELECT
    USING (seller_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all orders
CREATE POLICY order_select_admin ON "order"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- ORDER_RATING TABLE POLICIES
-- =============================

-- Users can see ratings they gave or received
CREATE POLICY order_rating_select_own ON order_rating
    FOR SELECT
    USING (
        from_user_id = current_setting('app.user_id', true)::INTEGER
        OR to_user_id = current_setting('app.user_id', true)::INTEGER
    );

-- Users can insert ratings they give
CREATE POLICY order_rating_insert_own ON order_rating
    FOR INSERT
    WITH CHECK (from_user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- PRODUCT_QUESTION TABLE POLICIES
-- =============================

-- Everyone can see questions on active products
CREATE POLICY product_question_select_public ON product_question
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_question.product_id
            AND p.status = 'active'
        )
    );

-- Users can see their own questions
CREATE POLICY product_question_select_own ON product_question
    FOR SELECT
    USING (asker_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own questions
CREATE POLICY product_question_insert_own ON product_question
    FOR INSERT
    WITH CHECK (asker_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- PRODUCT_ANSWER TABLE POLICIES
-- =============================

-- Everyone can see answers to questions on active products
CREATE POLICY product_answer_select_public ON product_answer
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product_question pq
            JOIN product p ON p.id = pq.product_id
            WHERE pq.id = product_answer.question_id
            AND p.status = 'active'
        )
    );

-- Sellers can see answers to questions on their products
CREATE POLICY product_answer_select_seller ON product_answer
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product_question pq
            JOIN product p ON p.id = pq.product_id
            WHERE pq.id = product_answer.question_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can insert answers to questions on their products
CREATE POLICY product_answer_insert_seller ON product_answer
    FOR INSERT
    WITH CHECK (
        responder_id = current_setting('app.user_id', true)::INTEGER
        AND EXISTS (
            SELECT 1 FROM product_question pq
            JOIN product p ON p.id = pq.product_id
            WHERE pq.id = product_answer.question_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- AUTO_BID_CONFIG TABLE POLICIES
-- =============================

-- Users can see their own auto-bid configs
CREATE POLICY auto_bid_select_own ON auto_bid_config
    FOR SELECT
    USING (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own auto-bid configs
CREATE POLICY auto_bid_insert_own ON auto_bid_config
    FOR INSERT
    WITH CHECK (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- Users can update their own auto-bid configs
CREATE POLICY auto_bid_update_own ON auto_bid_config
    FOR UPDATE
    USING (bidder_id = current_setting('app.user_id', true)::INTEGER)
    WITH CHECK (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- Users can delete their own auto-bid configs
CREATE POLICY auto_bid_delete_own ON auto_bid_config
    FOR DELETE
    USING (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- REJECTED_BIDDER TABLE POLICIES
-- =============================

-- Sellers can see rejected bidders on their products
CREATE POLICY rejected_bidder_select_seller ON rejected_bidder
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = rejected_bidder.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Users can see if they are rejected
CREATE POLICY rejected_bidder_select_own ON rejected_bidder
    FOR SELECT
    USING (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- Sellers can insert rejections for their products
CREATE POLICY rejected_bidder_insert_seller ON rejected_bidder
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = rejected_bidder.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- BIDDER_APPROVAL TABLE POLICIES
-- =============================

-- Sellers can see approvals for their products
CREATE POLICY bidder_approval_select_seller ON bidder_approval
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = bidder_approval.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Users can see their own approvals
CREATE POLICY bidder_approval_select_own ON bidder_approval
    FOR SELECT
    USING (bidder_id = current_setting('app.user_id', true)::INTEGER);

-- Sellers can insert approvals for their products
CREATE POLICY bidder_approval_insert_seller ON bidder_approval
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = bidder_approval.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- CHAT_THREAD TABLE POLICIES
-- =============================

-- Users can see chat threads they are part of
CREATE POLICY chat_thread_select_own ON chat_thread
    FOR SELECT
    USING (
        buyer_id = current_setting('app.user_id', true)::INTEGER
        OR seller_id = current_setting('app.user_id', true)::INTEGER
    );

-- =============================
-- CHAT_MESSAGE TABLE POLICIES
-- =============================

-- Users can see messages in threads they are part of
CREATE POLICY chat_message_select_own ON chat_message
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_thread ct
            WHERE ct.id = chat_message.thread_id
            AND (
                ct.buyer_id = current_setting('app.user_id', true)::INTEGER
                OR ct.seller_id = current_setting('app.user_id', true)::INTEGER
            )
        )
    );

-- Users can insert messages in threads they are part of
CREATE POLICY chat_message_insert_own ON chat_message
    FOR INSERT
    WITH CHECK (
        sender_id = current_setting('app.user_id', true)::INTEGER
        AND EXISTS (
            SELECT 1 FROM chat_thread ct
            WHERE ct.id = chat_message.thread_id
            AND (
                ct.buyer_id = current_setting('app.user_id', true)::INTEGER
                OR ct.seller_id = current_setting('app.user_id', true)::INTEGER
            )
        )
    );

-- =============================
-- NOTIFICATION TABLE POLICIES
-- =============================

-- Users can see their own notifications
CREATE POLICY notification_select_own ON notification
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can update their own notifications
CREATE POLICY notification_update_own ON notification
    FOR UPDATE
    USING (user_id = current_setting('app.user_id', true)::INTEGER)
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- ROLE TABLE POLICIES
-- =============================

-- Everyone can read roles (public read)
CREATE POLICY role_select_public ON role
    FOR SELECT
    USING (true);

-- Only admins can modify roles
CREATE POLICY role_modify_admin ON role
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- PERMISSION TABLE POLICIES
-- =============================

-- Everyone can read permissions (public read)
CREATE POLICY permission_select_public ON permission
    FOR SELECT
    USING (true);

-- Only admins can modify permissions
CREATE POLICY permission_modify_admin ON permission
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- USER_ROLE TABLE POLICIES
-- =============================

-- Users can see their own roles
CREATE POLICY user_role_select_own ON user_role
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all user roles
CREATE POLICY user_role_select_admin ON user_role
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Only admins can modify user roles
CREATE POLICY user_role_modify_admin ON user_role
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- ROLE_PERMISSION TABLE POLICIES
-- =============================

-- Everyone can read role-permission mappings (public read)
CREATE POLICY role_permission_select_public ON role_permission
    FOR SELECT
    USING (true);

-- Only admins can modify role-permission mappings
CREATE POLICY role_permission_modify_admin ON role_permission
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- EMAIL_VERIFICATION_TOKEN TABLE POLICIES
-- =============================

-- Users can see their own verification tokens
CREATE POLICY email_verification_token_select_own ON email_verification_token
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own verification tokens
CREATE POLICY email_verification_token_insert_own ON email_verification_token
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- PASSWORD_RESET_TOKEN TABLE POLICIES
-- =============================

-- Users can see their own reset tokens
CREATE POLICY password_reset_token_select_own ON password_reset_token
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own reset tokens
CREATE POLICY password_reset_token_insert_own ON password_reset_token
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- REFRESH_TOKEN TABLE POLICIES
-- =============================

-- Users can see their own refresh tokens
CREATE POLICY refresh_token_select_own ON refresh_token
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own refresh tokens
CREATE POLICY refresh_token_insert_own ON refresh_token
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can update their own refresh tokens
CREATE POLICY refresh_token_update_own ON refresh_token
    FOR UPDATE
    USING (user_id = current_setting('app.user_id', true)::INTEGER)
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can delete their own refresh tokens
CREATE POLICY refresh_token_delete_own ON refresh_token
    FOR DELETE
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- SOCIAL_LOGIN_ACCOUNT TABLE POLICIES
-- =============================

-- Users can see their own social login accounts
CREATE POLICY social_login_account_select_own ON social_login_account
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can insert their own social login accounts
CREATE POLICY social_login_account_insert_own ON social_login_account
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- Users can delete their own social login accounts
CREATE POLICY social_login_account_delete_own ON social_login_account
    FOR DELETE
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- =============================
-- SELLER_UPGRADE_REQUEST TABLE POLICIES
-- =============================

-- Users can see their own upgrade requests
CREATE POLICY seller_upgrade_request_select_own ON seller_upgrade_request
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all upgrade requests
CREATE POLICY seller_upgrade_request_select_admin ON seller_upgrade_request
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Users can insert their own upgrade requests
CREATE POLICY seller_upgrade_request_insert_own ON seller_upgrade_request
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can update upgrade requests
CREATE POLICY seller_upgrade_request_update_admin ON seller_upgrade_request
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- CATEGORY TABLE POLICIES
-- =============================

-- Everyone can read categories (public read)
CREATE POLICY category_select_public ON category
    FOR SELECT
    USING (true);

-- Only admins can modify categories
CREATE POLICY category_modify_admin ON category
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- PRODUCT_IMAGE TABLE POLICIES
-- =============================

-- Everyone can see images for active products
CREATE POLICY product_image_select_public ON product_image
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_image.product_id
            AND p.status = 'active'
        )
    );

-- Sellers can see images for their own products
CREATE POLICY product_image_select_seller ON product_image
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_image.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can insert images for their own products
CREATE POLICY product_image_insert_seller ON product_image
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_image.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can update images for their own products
CREATE POLICY product_image_update_seller ON product_image
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_image.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can delete images for their own products
CREATE POLICY product_image_delete_seller ON product_image
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_image.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- PRODUCT_EXTRA_DESCRIPTION TABLE POLICIES
-- =============================

-- Everyone can see extra descriptions for active products
CREATE POLICY product_extra_description_select_public ON product_extra_description
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_extra_description.product_id
            AND p.status = 'active'
        )
    );

-- Sellers can see extra descriptions for their own products
CREATE POLICY product_extra_description_select_seller ON product_extra_description
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_extra_description.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can insert extra descriptions for their own products
CREATE POLICY product_extra_description_insert_seller ON product_extra_description
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_extra_description.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- SYSTEM_AUCTION_RULE TABLE POLICIES
-- =============================

-- Only admins can see system auction rules
CREATE POLICY system_auction_rule_select_admin ON system_auction_rule
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Only admins can modify system auction rules
CREATE POLICY system_auction_rule_modify_admin ON system_auction_rule
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- PAYMENT TABLE POLICIES
-- =============================

-- Buyers can see payments for their orders
CREATE POLICY payment_select_buyer ON payment
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = payment.order_id
            AND o.buyer_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can see payments for orders of their products
CREATE POLICY payment_select_seller ON payment
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = payment.order_id
            AND o.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Admins can see all payments
CREATE POLICY payment_select_admin ON payment
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- SHIPPING_ADDRESS TABLE POLICIES
-- =============================

-- Buyers can see shipping addresses for their orders
CREATE POLICY shipping_address_select_buyer ON shipping_address
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = shipping_address.order_id
            AND o.buyer_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can see shipping addresses for orders of their products
CREATE POLICY shipping_address_select_seller ON shipping_address
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = shipping_address.order_id
            AND o.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- SHIPMENT TABLE POLICIES
-- =============================

-- Buyers can see shipments for their orders
CREATE POLICY shipment_select_buyer ON shipment
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = shipment.order_id
            AND o.buyer_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can see shipments for orders of their products
CREATE POLICY shipment_select_seller ON shipment
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = shipment.order_id
            AND o.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can update shipments for orders of their products
CREATE POLICY shipment_update_seller ON shipment
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = shipment.order_id
            AND o.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- TRANSACTION_CANCELLATION TABLE POLICIES
-- =============================

-- Buyers can see cancellations for their orders
CREATE POLICY transaction_cancellation_select_buyer ON transaction_cancellation
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = transaction_cancellation.order_id
            AND o.buyer_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Sellers can see cancellations for orders of their products
CREATE POLICY transaction_cancellation_select_seller ON transaction_cancellation
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "order" o
            WHERE o.id = transaction_cancellation.order_id
            AND o.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- =============================
-- USER_AUDIT_LOG TABLE POLICIES
-- =============================

-- Users can see their own audit logs
CREATE POLICY user_audit_log_select_own ON user_audit_log
    FOR SELECT
    USING (user_id = current_setting('app.user_id', true)::INTEGER);

-- Admins can see all audit logs
CREATE POLICY user_audit_log_select_admin ON user_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- SYSTEM_SETTING TABLE POLICIES
-- =============================

-- Everyone can read system settings (public read)
CREATE POLICY system_setting_select_public ON system_setting
    FOR SELECT
    USING (true);

-- Only admins can modify system settings
CREATE POLICY system_setting_modify_admin ON system_setting
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- =============================
-- PRODUCT_MODERATION TABLE POLICIES
-- =============================

-- Admins can see all product moderations
CREATE POLICY product_moderation_select_admin ON product_moderation
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

-- Sellers can see moderations for their own products
CREATE POLICY product_moderation_select_seller ON product_moderation
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM product p
            WHERE p.id = product_moderation.product_id
            AND p.seller_id = current_setting('app.user_id', true)::INTEGER
        )
    );

-- Only admins can insert product moderations
CREATE POLICY product_moderation_insert_admin ON product_moderation
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.user_id', true)::INTEGER
            AND r.name = 'ADMIN'
        )
    );

