PRAGMA foreign_keys = ON;

DELETE FROM menu_items;
DELETE FROM categories;
DELETE FROM sqlite_sequence WHERE name IN ('menu_items', 'categories');

INSERT INTO categories (name, display_order) VALUES
  ('From The Grill', 10),
  ('Sweet Treats', 20),
  ('Snacks', 30),
  ('Drinks', 40);

INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'All Beef Hot Dog', '', 300, 10 FROM categories WHERE name = 'From The Grill';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Hamburger', '', 500, 20 FROM categories WHERE name = 'From The Grill';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Cheeseburger', '', 500, 30 FROM categories WHERE name = 'From The Grill';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Student Meal', 'Includes hot dog, chips & drink', 500, 40 FROM categories WHERE name = 'From The Grill';

INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Cotton Candy', '', 200, 10 FROM categories WHERE name = 'Sweet Treats';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Chips', '', 150, 20 FROM categories WHERE name = 'Sweet Treats';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Candy Bars', '', 200, 30 FROM categories WHERE name = 'Sweet Treats';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Airheads & Ring Pops', '', 50, 40 FROM categories WHERE name = 'Sweet Treats';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Small Candies', '', 25, 50 FROM categories WHERE name = 'Sweet Treats';

INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Popcorn', '', 100, 10 FROM categories WHERE name = 'Snacks';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Whole Pickle', '', 100, 20 FROM categories WHERE name = 'Snacks';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Soft Pretzel', '', 250, 30 FROM categories WHERE name = 'Snacks';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Soft Pretzel w/cheese', '', 300, 40 FROM categories WHERE name = 'Snacks';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Nachos & Cheese', '', 300, 50 FROM categories WHERE name = 'Snacks';

INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Pepsi Products', '', 300, 10 FROM categories WHERE name = 'Drinks';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Gatorade', '', 300, 20 FROM categories WHERE name = 'Drinks';
INSERT INTO menu_items (category_id, name, description, price_cents, display_order)
SELECT id, 'Water', '', 200, 30 FROM categories WHERE name = 'Drinks';
