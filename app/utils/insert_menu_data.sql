-- Insert into menu_categories if 'Cryolipolisi' does not exist
INSERT IGNORE INTO menu_categories (name) VALUES ('Cryolipolisi');

-- Insert into menu_items
-- We use a subquery to get the category_id for 'Cryolipolisi'
INSERT INTO menu_items (name, description, price, duration, category_id)
VALUES (
    'Cryolipolisi 1 Zone',
    'Traitement de cryolipolyse pour 1 zone',
    150,
    60,
    (SELECT id FROM menu_categories WHERE name = 'Cryolipolisi')
);
