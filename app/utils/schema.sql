-- Utenti Table
CREATE TABLE utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories Table
CREATE TABLE menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Menu Items Table
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- Seed data for utenti
INSERT IGNORE INTO utenti (id, email, password, created_at) VALUES
(1, 'lerudine@gmail.com', 'password123', '2029-02-07 23:11:57'),
(2, 'test@example.com', 'password456', '2025-10-02 21:56:14.008619');

-- Seed data for cryolipolisi
INSERT IGNORE INTO cryolipolisi(id, prezzo, numero_zone, tipo, created_at)
VALUES
(1, 75000, 1, 'a seance', '2025-09-19 23:19:36.485348'),
(2, 150000, 2, 'a seance', '2025-09-19 23:19:36.485348'),
(3, 200000, 3, 'a seance', '2025-09-19 23:19:36.485348'),
(4, 280000, 4, 'a seance', '2025-09-19 23:19:36.485348'),
(5, 210000, 1, 'a forfait', '2025-09-19 23:19:36.485348'),
(6, 430000, 2, 'a forfait', '2025-09-19 23:19:36.485348'),
(7, 500000, 3, 'a forfait', '2025-09-19 23:19:36.485348'),
(8, 750000, 4, 'a forfait', '2025-09-19 23:19:36.485348');

-- Seed data for menu_categories
INSERT IGNORE INTO menu_categories (id, name) VALUES
(1, 'Nez'),
(2, 'Pieds'),
(3, 'Epilation');

INSERT INTO menu_items (name, description, price, category_id) VALUES
('Soin de visage', 'Nettoyage en profondeur, masque et hydratation', 25000, 1),
('Extensions de cils', 'Pose cil à cil pour un regard de biche', 35000, 1),
('Manucure', 'Limage, cuticules et pose de vernis', 15000, 2),
('Pédicure', 'Soin complet des pieds avec bain, gommage et massage', 20000, 2),
('Épilation complète', 'Cire traditionnelle pour une peau douce', 40000, 3),
('Épilation maillot', 'Style au choix pour une finition parfaite', 18000, 3);

-- Users table to store login information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store email verification tokens
CREATE TABLE email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table to store password reset tokens
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);