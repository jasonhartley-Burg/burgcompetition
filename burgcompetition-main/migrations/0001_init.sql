CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sold_out INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(active, display_order, id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_order ON menu_items(category_id, active, display_order, id);

INSERT INTO categories (name, display_order) VALUES
  ('Main Menu', 10),
  ('Snacks', 20),
  ('Drinks', 30)
;

INSERT INTO menu_items (category_id, name, description, price_cents, display_order) VALUES
  (1, 'Cheeseburger', 'Grilled burger with American cheese', 600, 10),
  (1, 'Hot Dog', 'Classic all-beef hot dog', 400, 20),
  (1, 'Nachos', 'Warm tortilla chips with cheese', 450, 30),
  (2, 'Pretzel', 'Warm salted soft pretzel', 400, 10),
  (2, 'Candy', 'Assorted theater-size candy', 300, 20),
  (3, 'Bottled Water', '', 200, 10),
  (3, 'Soft Drink', 'Assorted flavors', 300, 20)
;
