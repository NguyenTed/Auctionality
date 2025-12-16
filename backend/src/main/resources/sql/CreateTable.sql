-- =============================
-- USERS & AUTHENTICATION
-- =============================

CREATE TABLE "user" (
                        id SERIAL PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        is_email_verified BOOLEAN DEFAULT FALSE,
                        status TEXT DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profile (
                              user_id INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
                              full_name TEXT,
                              phone_number TEXT,
                              avatar_url TEXT,
                              rating_positive_count INT DEFAULT 0,
                              rating_negative_count INT DEFAULT 0,
                              rating_percent FLOAT DEFAULT 0
);

CREATE TABLE role (
                      id SERIAL PRIMARY KEY,
                      name TEXT UNIQUE NOT NULL,
                      description TEXT
);

CREATE TABLE permission (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            description TEXT
);

CREATE TABLE user_role (
                           user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
                           role_id INT REFERENCES role(id) ON DELETE CASCADE,
                           PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permission (
                                 role_id INT REFERENCES role(id) ON DELETE CASCADE,
                                 permission_id INT REFERENCES permission(id) ON DELETE CASCADE,
                                 PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE email_verification_token (
                                          id SERIAL PRIMARY KEY,
                                          user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
                                          token TEXT NOT NULL,
                                          expires_at TIMESTAMP NOT NULL,
                                          used_at TIMESTAMP
);

CREATE TABLE password_reset_token (
                                      id SERIAL PRIMARY KEY,
                                      user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
                                      token TEXT NOT NULL,
                                      expires_at TIMESTAMP NOT NULL,
                                      used_at TIMESTAMP
);

CREATE TABLE refresh_token (
                               id SERIAL PRIMARY KEY,
                               user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
                               token TEXT NOT NULL,
                               expires_at TIMESTAMP NOT NULL,
                               revoked_at TIMESTAMP
);

CREATE TABLE social_login_account (
                                      id SERIAL PRIMARY KEY,
                                      user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
                                      provider TEXT NOT NULL,
                                      provider_user_id TEXT NOT NULL
);

CREATE TABLE seller_upgrade_request (
                                        id SERIAL PRIMARY KEY,
                                        user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
                                        processed_by_admin_id INT REFERENCES "user"(id),
                                        status TEXT NOT NULL,
                                        requested_at TIMESTAMP DEFAULT NOW(),
                                        processed_at TIMESTAMP
);

-- =============================
-- CATEGORY & PRODUCT
-- =============================

CREATE TABLE category (
                          id SERIAL PRIMARY KEY,
                          name TEXT NOT NULL,
                          slug TEXT UNIQUE NOT NULL,
                          parent_id INT REFERENCES category(id)
);

CREATE TABLE product (
                         id SERIAL PRIMARY KEY,
                         seller_id INT REFERENCES "user"(id),
                         category_id INT REFERENCES category(id),
                         title TEXT NOT NULL,
                         status TEXT DEFAULT 'active',
                         start_price FLOAT NOT NULL,
                         current_price FLOAT,
                         buy_now_price FLOAT,
                         bid_increment FLOAT DEFAULT 1,
                         start_time TIMESTAMP NOT NULL,
                         end_time TIMESTAMP NOT NULL,
                         auto_extension_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE product_image (
                               id SERIAL PRIMARY KEY,
                               product_id INT REFERENCES product(id) ON DELETE CASCADE,
                               url TEXT,
                               is_thumbnail BOOLEAN DEFAULT FALSE
);

CREATE TABLE product_extra_description (
                                           id SERIAL PRIMARY KEY,
                                           product_id INT REFERENCES product(id) ON DELETE CASCADE,
                                           content TEXT,
                                           created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE watchlist_item (
                                id SERIAL PRIMARY KEY,
                                user_id INT REFERENCES "user"(id),
                                product_id INT REFERENCES product(id),
                                created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_question (
                                  id SERIAL PRIMARY KEY,
                                  product_id INT REFERENCES product(id),
                                  asker_id INT REFERENCES "user"(id),
                                  content TEXT NOT NULL,
                                  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_answer (
                                id SERIAL PRIMARY KEY,
                                question_id INT REFERENCES product_question(id) ON DELETE CASCADE,
                                responder_id INT REFERENCES "user"(id),
                                content TEXT NOT NULL,
                                created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- BIDDING SYSTEM
-- =============================

CREATE TABLE bid (
                     id SERIAL PRIMARY KEY,
                     product_id INT REFERENCES product(id),
                     bidder_id INT REFERENCES "user"(id),
                     amount FLOAT NOT NULL,
                     is_auto_bid BOOLEAN DEFAULT FALSE,
                     created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auto_bid_config (
                                 id SERIAL PRIMARY KEY,
                                 product_id INT REFERENCES product(id),
                                 bidder_id INT REFERENCES "user"(id),
                                 max_price FLOAT NOT NULL,
                                 created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rejected_bidder (
                                 id SERIAL PRIMARY KEY,
                                 product_id INT REFERENCES product(id),
                                 bidder_id INT REFERENCES "user"(id),
                                 reason TEXT,
                                 created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bidder_approval (
                                 id SERIAL PRIMARY KEY,
                                 product_id INT REFERENCES product(id),
                                 bidder_id INT REFERENCES "user"(id),
                                 status TEXT,
                                 created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_auction_rule (
                                     id SERIAL PRIMARY KEY,
                                     time_threshold_minutes INT NOT NULL,
                                     extension_minutes INT NOT NULL,
                                     is_active BOOLEAN DEFAULT TRUE
);

-- =============================
-- ORDER / PAYMENT / SHIPPING
-- =============================

CREATE TABLE "order" (
                         id SERIAL PRIMARY KEY,
                         product_id INT REFERENCES product(id),
                         buyer_id INT REFERENCES "user"(id),
                         seller_id INT REFERENCES "user"(id),
                         final_price FLOAT NOT NULL,
                         status TEXT,
                         created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment (
                         id SERIAL PRIMARY KEY,
                         order_id INT REFERENCES "order"(id),
                         gateway TEXT,
                         amount FLOAT,
                         currency TEXT,
                         status TEXT,
                         transaction_code TEXT,
                         paid_at TIMESTAMP
);

CREATE TABLE shipping_address (
                                  id SERIAL PRIMARY KEY,
                                  order_id INT REFERENCES "order"(id),
                                  receiver_name TEXT,
                                  phone TEXT,
                                  address_line1 TEXT,
                                  address_line2 TEXT,
                                  city TEXT,
                                  country TEXT,
                                  postal_code TEXT
);

CREATE TABLE shipment (
                          id SERIAL PRIMARY KEY,
                          order_id INT REFERENCES "order"(id),
                          carrier TEXT,
                          tracking_number TEXT,
                          shipped_at TIMESTAMP,
                          delivered_at TIMESTAMP
);

CREATE TABLE transaction_cancellation (
                                          id SERIAL PRIMARY KEY,
                                          order_id INT REFERENCES "order"(id),
                                          cancelled_by_user_id INT REFERENCES "user"(id),
                                          reason TEXT,
                                          created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_rating (
                              id SERIAL PRIMARY KEY,
                              order_id INT REFERENCES "order"(id),
                              from_user_id INT REFERENCES "user"(id),
                              to_user_id INT REFERENCES "user"(id),
                              value INT,
                              comment TEXT,
                              created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- CHAT SYSTEM
-- =============================

CREATE TABLE chat_thread (
                             id SERIAL PRIMARY KEY,
                             order_id INT REFERENCES "order"(id),
                             buyer_id INT REFERENCES "user"(id),
                             seller_id INT REFERENCES "user"(id),
                             created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_message (
                              id SERIAL PRIMARY KEY,
                              thread_id INT REFERENCES chat_thread(id),
                              sender_id INT REFERENCES "user"(id),
                              content TEXT,
                              message_type TEXT,
                              is_read BOOLEAN DEFAULT FALSE,
                              created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- NOTIFICATION & LOGGING
-- =============================

CREATE TABLE notification (
                              id SERIAL PRIMARY KEY,
                              user_id INT REFERENCES "user"(id),
                              type TEXT,
                              title TEXT,
                              message TEXT,
                              reference_type TEXT,
                              reference_id INT,
                              is_read BOOLEAN DEFAULT FALSE,
                              created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_moderation (
                                    id SERIAL PRIMARY KEY,
                                    product_id INT REFERENCES product(id),
                                    admin_id INT REFERENCES "user"(id),
                                    action TEXT,
                                    reason TEXT,
                                    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_audit_log (
                                id SERIAL PRIMARY KEY,
                                user_id INT REFERENCES "user"(id),
                                action TEXT,
                                ip_address TEXT,
                                user_agent TEXT,
                                created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_setting (
                                key TEXT PRIMARY KEY,
                                value TEXT,
                                updated_at TIMESTAMP DEFAULT NOW(),
                                updated_by_admin_id INT REFERENCES "user"(id)
);
