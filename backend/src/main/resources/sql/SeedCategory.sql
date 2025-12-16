INSERT INTO category (name, slug) VALUES
                                      ('Archaeology & Natural History', 'archaeology-and-natural-history'),
                                      ('Art', 'art'),
                                      ('Asian & Tribal Art', 'asian-and-tribal-art'),
                                      ('Books & Historical Memorabilia', 'books-and-historical-memorabilia'),
                                      ('Classic Cars, Motorcycles & Automobilia', 'classic-cars-motorcycles-and-automobilia'),
                                      ('Coins & Stamps', 'coins-and-stamps'),
                                      ('Comics & Animation', 'comics-and-animation'),
                                      ('Fashion', 'fashion'),
                                      ('Interiors & Decorations', 'interiors-and-decorations'),
                                      ('Jewellery & Precious Stones', 'jewellery-and-precious-stones'),
                                      ('Music, Movies & Cameras', 'music-movies-and-cameras'),
                                      ('Sports', 'sports'),
                                      ('Toys & Models', 'toys-and-models'),
                                      ('Trading Cards', 'trading-cards'),
                                      ('Watches, Pens & Lighters', 'watches-pens-and-lighters'),
                                      ('Wine, Whisky & Spirits', 'wine-whisky-and-spirits');
INSERT INTO category (name, slug, parent_id) VALUES
                                                 ('Archaeology', 'archaeology', 1),
                                                 ('Fossils', 'fossils', 1),
                                                 ('Minerals & Meteorites', 'minerals-and-meteorites', 1),
                                                 ('Natural History & Taxidermy', 'natural-history-and-taxidermy', 1);
INSERT INTO category (name, slug, parent_id) VALUES
                                                 ('Classical Art', 'classical-art', 2),
                                                 ('Modern & Contemporary Art', 'modern-and-contemporary-art', 2),
                                                 ('Photography', 'photography', 2),
                                                 ('Prints & Multiples', 'prints-and-multiples', 2);
INSERT INTO category (name, slug, parent_id) VALUES
                                                 ('African & Tribal Art', 'african-and-tribal-art', 3),
                                                 ('Chinese Art', 'chinese-art', 3),
                                                 ('Indian & Islamic Art', 'indian-and-islamic-art', 3),
                                                 ('Japanese Art', 'japanese-art', 3),
                                                 ('Southeast Asian, Oceanic & American Art', 'southeast-asian-oceanic-and-american-art', 3);
INSERT INTO category (name, slug, parent_id) VALUES
                                                 ('Art & Photography Books', 'art-and-photography-books', 4),
                                                 ('Books', 'books', 4),
                                                 ('Historical Memorabilia', 'historical-memorabilia', 4),
                                                 ('Maps', 'maps', 4);
