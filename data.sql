-- =============================================================
-- O'SINJEL DE OR - CENTRAL DATA SCRIPT
-- Part 1: Creation (databases + tables)
-- Part 2: Seed data (test data)
-- =============================================================

SET NAMES utf8mb4;

-- #############################################################
-- PART 1: CREATION (DATABASES + TABLES)
-- #############################################################

-- =============================================================
-- DATABASE: korisnici
-- =============================================================
CREATE DATABASE IF NOT EXISTS korisnici
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE korisnici;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(100) NULL,
    lastName VARCHAR(100) NULL,
    role ENUM('ADMIN', 'SALES_MANAGER', 'SELLER') NOT NULL DEFAULT 'SELLER',
    profileImage LONGTEXT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: proizvodnja
-- =============================================================
CREATE DATABASE IF NOT EXISTS proizvodnja
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE proizvodnja;

CREATE TABLE IF NOT EXISTS biljka (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opsti_naziv VARCHAR(100) NOT NULL,
    jacina_aromaticnih_ulja DECIMAL(2,1) NOT NULL,
    latinski_naziv VARCHAR(150) NOT NULL,
    zemlja_porekla VARCHAR(100) NOT NULL,
    stanje ENUM('posadjena', 'ubrana', 'preradjena') NOT NULL DEFAULT 'posadjena',
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_jacina_ulja CHECK (jacina_aromaticnih_ulja >= 1.0 AND jacina_aromaticnih_ulja <= 5.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: prerada
-- =============================================================
CREATE DATABASE IF NOT EXISTS prerada
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prerada;

CREATE TABLE IF NOT EXISTS parfem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    tip ENUM('parfem', 'kolonjska_voda') NOT NULL,
    neto_kolicina INT NOT NULL,
    serijski_broj VARCHAR(50) NOT NULL UNIQUE,
    biljka_id INT NOT NULL,
    rok_trajanja DATE NOT NULL,
    spakovan TINYINT(1) NOT NULL DEFAULT 0,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_neto_kolicina CHECK (neto_kolicina IN (150, 250)),
    INDEX idx_parfem_biljka (biljka_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: skladista
-- =============================================================
CREATE DATABASE IF NOT EXISTS skladista
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE skladista;

CREATE TABLE IF NOT EXISTS skladiste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    lokacija VARCHAR(200) NOT NULL,
    maksimalni_kapacitet INT NOT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_kapacitet CHECK (maksimalni_kapacitet > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ambalaza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    adresa_posiljaoca VARCHAR(200) NOT NULL,
    skladiste_id INT NULL,
    status ENUM('spakovana', 'rezervisana', 'poslata', 'raspakovana') NOT NULL DEFAULT 'spakovana',
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ambalaza_skladiste FOREIGN KEY (skladiste_id) REFERENCES skladiste(id) ON DELETE SET NULL,
    INDEX idx_ambalaza_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ambalaza_parfem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambalaza_id INT NOT NULL,
    parfem_id INT NOT NULL UNIQUE,
    datum_dodavanja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ambalaza_parfem_ambalaza FOREIGN KEY (ambalaza_id) REFERENCES ambalaza(id) ON DELETE CASCADE,
    INDEX idx_ambalaza_parfem_ambalaza_id (ambalaza_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: prodaja
-- =============================================================
CREATE DATABASE IF NOT EXISTS prodaja
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prodaja;

CREATE TABLE IF NOT EXISTS fiskalni_racun (
    id INT AUTO_INCREMENT PRIMARY KEY,
    broj_racuna VARCHAR(255) NOT NULL UNIQUE,
    tip_prodaje ENUM('maloprodaja', 'veleprodaja') NOT NULL,
    nacin_placanja ENUM('gotovina', 'uplata_na_racun', 'karticno') NOT NULL,
    prodati_proizvodi JSON NOT NULL,
    ukupan_iznos DECIMAL(12,2) NOT NULL,
    korisnik_id INT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_iznos CHECK (ukupan_iznos > 0),
    INDEX idx_fiskalni_korisnik (korisnik_id),
    INDEX idx_fiskalni_datum (datum_kreiranja)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stavka_racuna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiskalni_racun_id INT NOT NULL,
    parfem_id INT NOT NULL,
    naziv_parfema VARCHAR(100) NOT NULL,
    kolicina INT NOT NULL,
    cena_po_komadu DECIMAL(10,2) NOT NULL,
    ukupna_cena DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_stavka_fiskalni_racun FOREIGN KEY (fiskalni_racun_id) REFERENCES fiskalni_racun(id) ON DELETE CASCADE,
    CONSTRAINT chk_stavka_kolicina CHECK (kolicina > 0),
    CONSTRAINT chk_stavka_cena CHECK (cena_po_komadu > 0),
    CONSTRAINT chk_stavka_ukupna CHECK (ukupna_cena >= 0),
    INDEX idx_stavka_racun (fiskalni_racun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: izvestaji_analize
-- =============================================================
CREATE DATABASE IF NOT EXISTS izvestaji_analize
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE izvestaji_analize;

-- Legacy table (kept for backward compatibility)
CREATE TABLE IF NOT EXISTS izvestaj_analize (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(200) NOT NULL,
    tip_izvestaja ENUM('mesecni', 'nedeljni', 'godisnji', 'ukupno', 'trend', 'top_parfemi') NOT NULL,
    period_od DATE NULL,
    period_do DATE NULL,
    podaci JSON NOT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fiscal_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_prodaje VARCHAR(20) NOT NULL,
    nacin_placanja VARCHAR(30) NOT NULL,
    prodati_proizvodi JSON NOT NULL,
    ukupan_iznos DECIMAL(10,2) NOT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    korisnik_id INT NULL,
    CONSTRAINT chk_fiscal_bills_iznos CHECK (ukupan_iznos > 0),
    INDEX idx_fiscal_bills_datum (datum_kreiranja)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_perioda VARCHAR(20) NOT NULL,
    vrednost_perioda VARCHAR(50) NOT NULL,
    ukupna_prodaja DECIMAL(12,2) NOT NULL,
    broj_prodatih_jedinica INT NOT NULL,
    zarada DECIMAL(12,2) NOT NULL,
    detalji JSON NULL,
    generisan_datum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS top_product_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(50) NOT NULL,
    top_proizvodi JSON NOT NULL,
    ukupna_zarada_od_top DECIMAL(12,2) NOT NULL,
    generisan_datum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trend_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_analize VARCHAR(50) NOT NULL,
    podaci JSON NOT NULL,
    zakljucak TEXT NULL,
    generisan_datum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: izvestaji_performanse
-- =============================================================
CREATE DATABASE IF NOT EXISTS izvestaji_performanse
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE izvestaji_performanse;

CREATE TABLE IF NOT EXISTS izvestaj_performansi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(200) NOT NULL,
    tip_algoritma ENUM('distributivni_centar', 'magacinski_centar') NOT NULL,
    broj_ambalaza_po_slanju INT NOT NULL,
    vreme_obrade_sekunde DECIMAL(5,2) NOT NULL,
    efikasnost_procenat DECIMAL(5,2) NOT NULL,
    brzina_obrade DECIMAL(10,2) NOT NULL,
    podaci_simulacije JSON NOT NULL,
    zakljucci TEXT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: audit_logovi
-- =============================================================
CREATE DATABASE IF NOT EXISTS audit_logovi
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE audit_logovi;

CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_zapisa ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
    datum_vreme DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opis TEXT NOT NULL,
    mikroservis VARCHAR(100) NULL,
    korisnik_id INT NULL,
    ip_adresa VARCHAR(45) NULL,
    dodatni_podaci JSON NULL,
    INDEX idx_audit_datum (datum_vreme),
    INDEX idx_audit_tip (tip_zapisa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: notification_center
-- =============================================================
CREATE DATABASE IF NOT EXISTS notification_center
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE notification_center;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    source_service VARCHAR(100) NOT NULL,
    target_role ENUM('ADMIN', 'SALES_MANAGER', 'SELLER') NULL,
    target_user_id INT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    metadata JSON NULL,
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_priority (priority),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_target_role (target_role),
    INDEX idx_notifications_target_user_id (target_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_email_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NULL,
    subject VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(40) NULL,
    target_user_id INT NULL,
    metadata JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_email_log_created_at (created_at),
    INDEX idx_notification_email_log_notification_id (notification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATABASE: vremenski_uslovi
-- =============================================================
CREATE DATABASE IF NOT EXISTS vremenski_uslovi
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE vremenski_uslovi;

CREATE TABLE IF NOT EXISTS vremenski_dan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    datum DATE NOT NULL UNIQUE,
    datum_mesec CHAR(7) GENERATED ALWAYS AS (DATE_FORMAT(datum, '%Y-%m')) STORED,
    temperatura_c DECIMAL(4,1) NOT NULL,
    vlaznost_pct INT NOT NULL,
    padavine_mm DECIMAL(5,1) NOT NULL DEFAULT 0,
    stanje_temperature ENUM('COLD', 'MODERATE', 'HOT') NOT NULL,
    stanje_vlaznosti ENUM('DRY', 'OK', 'HUMID') NOT NULL,
    stanje_padavina ENUM('NONE', 'LIGHT', 'HEAVY') NOT NULL,
    napomena TEXT NULL,
    kreirao_korisnik_id INT NULL,
    datum_kreiranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vreme_datum (datum),
    INDEX idx_vreme_mesec (datum_mesec)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- DATABASE: preporuke
-- =============================================================
CREATE DATABASE IF NOT EXISTS preporuke
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE preporuke;

CREATE TABLE IF NOT EXISTS user_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    korisnik_id INT NOT NULL,
    preporuceni_parfemi JSON NOT NULL,
    tip_preporuke VARCHAR(20) NOT NULL,
    generisan_datum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    istice_datum DATETIME NOT NULL,
    INDEX idx_preporuke_korisnik (korisnik_id),
    INDEX idx_preporuke_istice (istice_datum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS item_co_occurrence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parfem_id_1 INT NOT NULL,
    parfem_id_2 INT NOT NULL,
    zajednicki_broj_kupovina INT NOT NULL DEFAULT 0,
    datum_azuriranja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_co_occurrence UNIQUE (parfem_id_1, parfem_id_2),
    CONSTRAINT chk_parfem_order CHECK (parfem_id_1 < parfem_id_2),
    INDEX idx_co_parfem1 (parfem_id_1),
    INDEX idx_co_parfem2 (parfem_id_2),
    INDEX idx_co_count (zajednicki_broj_kupovina DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- #############################################################
-- PART 2: SEED DATA (TEST DATA)
-- #############################################################

-- =============================================================
-- korisnici.users
-- =============================================================
USE korisnici;

INSERT INTO users (username, password, email, firstName, lastName, role) VALUES
('admin', '$2b$10$y1p5qkYzY2cnQmA7S9xEze5Ng8j7qf6YlWmX0z9lXq2M8hD4TnYQ6', 'admin@osinjel.com', 'Mila', 'Petrovic', 'ADMIN'),
('sales.manager', '$2b$10$L3n9Q0cD1sW8vP7kU4rAtef0x9C2jB5uYh3K6mN8pQ4tR2sV7wXyO', 'manager@osinjel.com', 'Nikola', 'Ilic', 'SALES_MANAGER'),
('ana.seller', '$2b$10$qz9gcJtD9.fYt70CPQjuQ.DKZIfgcsSIx54dmSN/XexrUVej4Pawa', 'ana@osinjel.com', 'Ana', 'Jovanovic', 'SELLER'),
('marko.seller', '$2b$10$oFSXtDNqyX1HDp7ySccv7.tTcoznXk/zUfTfqtfqGtQqX0kG9wtN2', 'marko@osinjel.com', 'Marko', 'Kostic', 'SELLER'),
('jelena.seller', '$2b$10$R6b3N8kD2vQ1yM5tL9pAxe4c7F0sH2jG8uW3mT6rP1nY4kV9zC5dB', 'jelena@osinjel.com', 'Jelena', 'Savic', 'SELLER');


-- =============================================================
-- proizvodnja.biljka
-- =============================================================
USE proizvodnja;

INSERT INTO biljka (opsti_naziv, jacina_aromaticnih_ulja, latinski_naziv, zemlja_porekla, stanje) VALUES
('Lavanda', 3.4, 'Lavandula angustifolia', 'Francuska', 'ubrana'),
('Ruza', 4.6, 'Rosa damascena', 'Bugarska', 'ubrana'),
('Bergamot', 2.9, 'Citrus bergamia', 'Italija', 'preradjena'),
('Jasmin', 4.1, 'Jasminum officinale', 'Egipat', 'ubrana'),
('Sandalovina', 4.3, 'Santalum album', 'Indija', 'posadjena'),
('Vetiver', 3.6, 'Chrysopogon zizanioides', 'Haiti', 'preradjena'),
('Paculi', 3.1, 'Pogostemon cablin', 'Indonezija', 'ubrana'),
('Iris', 4.0, 'Iris pallida', 'Italija', 'posadjena'),
('Neroli', 4.2, 'Citrus aurantium', 'Tunis', 'ubrana'),
('Kedar', 3.3, 'Cedrus atlantica', 'Maroko', 'preradjena');


-- =============================================================
-- prerada.parfem
-- =============================================================
USE prerada;

INSERT INTO parfem (naziv, tip, neto_kolicina, serijski_broj, biljka_id, rok_trajanja, spakovan) VALUES
('Rose Absolue', 'parfem', 250, 'PP-2026-001', 2, '2028-11-10', 1),
('Lavender Veil', 'kolonjska_voda', 150, 'PP-2026-002', 1, '2028-09-25', 1),
('Bergamot Intense', 'parfem', 250, 'PP-2026-003', 3, '2028-12-15', 1),
('Jasmine Nuit', 'parfem', 150, 'PP-2026-004', 4, '2028-08-30', 1),
('Santal Gold', 'parfem', 250, 'PP-2026-005', 5, '2029-02-12', 0),
('Vetiver Line', 'kolonjska_voda', 150, 'PP-2026-006', 6, '2028-07-01', 1),
('Paculi Noir', 'parfem', 150, 'PP-2026-007', 7, '2028-10-18', 0),
('Iris Signature', 'parfem', 250, 'PP-2026-008', 8, '2029-01-20', 1),
('Neroli Air', 'kolonjska_voda', 150, 'PP-2026-009', 9, '2028-06-14', 1),
('Cedar Trace', 'parfem', 250, 'PP-2026-010', 10, '2029-03-05', 0);


-- =============================================================
-- skladista.skladiste / skladista.ambalaza / skladista.ambalaza_parfem
-- =============================================================
USE skladista;

INSERT INTO skladiste (naziv, lokacija, maksimalni_kapacitet) VALUES
('Centralno skladiste', 'Pariz, Rue de Rivoli 22', 120),
('Severno skladiste', 'Pariz, Avenue Foch 11', 80),
('Juzno skladiste', 'Pariz, Boulevard Saint-Germain 91', 60);

INSERT INTO ambalaza (naziv, adresa_posiljaoca, skladiste_id, status) VALUES
('Paket-A1', 'Pariz, Fabrika 1', 1, 'spakovana'),
('Paket-A2', 'Pariz, Fabrika 1', 1, 'rezervisana'),
('Paket-B1', 'Pariz, Fabrika 2', 2, 'spakovana'),
('Paket-B2', 'Pariz, Fabrika 2', 2, 'poslata'),
('Paket-C1', 'Pariz, Fabrika 3', 3, 'spakovana'),
('Paket-C2', 'Pariz, Fabrika 3', 3, 'raspakovana'),
('Paket-D1', 'Pariz, Fabrika 4', NULL, 'spakovana'),
('Paket-D2', 'Pariz, Fabrika 4', 1, 'rezervisana');

INSERT INTO ambalaza_parfem (ambalaza_id, parfem_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4),
(4, 6),
(5, 8),
(7, 9),
(8, 10);


-- =============================================================
-- prodaja.fiskalni_racun / prodaja.stavka_racuna
-- =============================================================
USE prodaja;

INSERT INTO fiskalni_racun (broj_racuna, tip_prodaje, nacin_placanja, prodati_proizvodi, ukupan_iznos, korisnik_id, datum_kreiranja) VALUES
(
  'FR-2026-001',
  'maloprodaja',
  'karticno',
  '[{"productId":1,"productName":"Rose Absolue","quantity":1,"price":12900.00}]',
  12900.00,
  3,
  '2026-01-10 10:15:00'
),
(
  'FR-2026-002',
  'veleprodaja',
  'uplata_na_racun',
  '[{"productId":2,"productName":"Lavender Veil","quantity":4,"price":6400.00},{"productId":3,"productName":"Bergamot Intense","quantity":2,"price":11800.00}]',
  49200.00,
  2,
  '2026-01-11 14:35:00'
),
(
  'FR-2026-003',
  'maloprodaja',
  'gotovina',
  '[{"productId":4,"productName":"Jasmine Nuit","quantity":1,"price":8900.00}]',
  8900.00,
  4,
  '2026-01-12 12:05:00'
),
(
  'FR-2026-004',
  'maloprodaja',
  'karticno',
  '[{"productId":6,"productName":"Vetiver Line","quantity":2,"price":7200.00},{"productId":8,"productName":"Iris Signature","quantity":1,"price":13400.00}]',
  27800.00,
  5,
  '2026-01-13 18:20:00'
),
(
  'FR-2026-005',
  'veleprodaja',
  'uplata_na_racun',
  '[{"productId":9,"productName":"Neroli Air","quantity":6,"price":5900.00}]',
  35400.00,
  2,
  '2026-01-14 09:50:00'
),
(
  'FR-2026-006',
  'maloprodaja',
  'gotovina',
  '[{"productId":10,"productName":"Cedar Trace","quantity":1,"price":12100.00}]',
  12100.00,
  3,
  '2026-01-15 16:10:00'
);

INSERT INTO stavka_racuna (fiskalni_racun_id, parfem_id, naziv_parfema, kolicina, cena_po_komadu, ukupna_cena) VALUES
(1, 1, 'Rose Absolue', 1, 12900.00, 12900.00),
(2, 2, 'Lavender Veil', 4, 6400.00, 25600.00),
(2, 3, 'Bergamot Intense', 2, 11800.00, 23600.00),
(3, 4, 'Jasmine Nuit', 1, 8900.00, 8900.00),
(4, 6, 'Vetiver Line', 2, 7200.00, 14400.00),
(4, 8, 'Iris Signature', 1, 13400.00, 13400.00),
(5, 9, 'Neroli Air', 6, 5900.00, 35400.00),
(6, 10, 'Cedar Trace', 1, 12100.00, 12100.00);


-- =============================================================
-- izvestaji_analize tables
-- =============================================================
USE izvestaji_analize;

INSERT INTO izvestaj_analize (naziv, tip_izvestaja, period_od, period_do, podaci) VALUES
(
  'Nedeljni pregled prodaje',
  'nedeljni',
  '2026-01-09',
  '2026-01-15',
  '{"ukupna_prodaja": 15, "ukupna_zarada": 146300.00, "prosecno_po_racunu": 24383.33}'
),
(
  'Top parfemi januar',
  'top_parfemi',
  '2026-01-01',
  '2026-01-31',
  '{"lista": [{"naziv":"Neroli Air","kolicina":6},{"naziv":"Lavender Veil","kolicina":4}]}'
),
(
  'Trend prodaje Q1',
  'trend',
  '2026-01-01',
  '2026-03-31',
  '{"trend":"rast", "promena_procenat": 12.4}'
);

INSERT INTO fiscal_bills (tip_prodaje, nacin_placanja, prodati_proizvodi, ukupan_iznos, datum_kreiranja, korisnik_id) VALUES
(
  'maloprodaja',
  'karticno',
  '[{"productId":1,"productName":"Rose Absolue","quantity":1,"price":12900.00}]',
  12900.00,
  '2026-01-10 10:15:00',
  3
),
(
  'veleprodaja',
  'uplata_na_racun',
  '[{"productId":2,"productName":"Lavender Veil","quantity":4,"price":6400.00}]',
  25600.00,
  '2026-01-11 14:35:00',
  2
),
(
  'maloprodaja',
  'gotovina',
  '[{"productId":4,"productName":"Jasmine Nuit","quantity":1,"price":8900.00}]',
  8900.00,
  '2026-01-12 12:05:00',
  4
),
(
  'maloprodaja',
  'karticno',
  '[{"productId":8,"productName":"Iris Signature","quantity":1,"price":13400.00}]',
  13400.00,
  '2026-01-13 18:20:00',
  5
);

INSERT INTO sales_reports (tip_perioda, vrednost_perioda, ukupna_prodaja, broj_prodatih_jedinica, zarada, detalji, generisan_datum) VALUES
(
  'daily',
  '2026-01-10',
  12900.00,
  1,
  12900.00,
  '{"najprodavaniji":"Rose Absolue","broj_racuna":1}',
  '2026-01-10 23:59:00'
),
(
  'weekly',
  '2026-W02',
  146300.00,
  15,
  146300.00,
  '{"broj_racuna":6,"prosek_racuna":24383.33}',
  '2026-01-16 08:00:00'
),
(
  'monthly',
  '2026-01',
  146300.00,
  15,
  146300.00,
  '{"top_kategorija":"parfem"}',
  '2026-02-01 09:00:00'
);

INSERT INTO top_product_reports (period, top_proizvodi, ukupna_zarada_od_top, generisan_datum) VALUES
(
  '2026-01',
  '[{"productId":9,"productName":"Neroli Air","unitsSold":6,"revenue":35400.00,"percentage":34.89},{"productId":2,"productName":"Lavender Veil","unitsSold":4,"revenue":25600.00,"percentage":25.25}]',
  61000.00,
  '2026-02-01 10:00:00'
),
(
  '2026-W02',
  '[{"productId":9,"productName":"Neroli Air","unitsSold":6,"revenue":35400.00,"percentage":24.20},{"productId":3,"productName":"Bergamot Intense","unitsSold":2,"revenue":23600.00,"percentage":16.13}]',
  59000.00,
  '2026-01-16 10:30:00'
);

INSERT INTO trend_analyses (tip_analize, podaci, zakljucak, generisan_datum) VALUES
(
  'monthly_trend',
  '[{"label":"2025-11","value":98},{"label":"2025-12","value":121},{"label":"2026-01","value":146}]',
  'Stabilan rast prodaje u prethodna tri meseca.',
  '2026-02-01 11:15:00'
),
(
  'product_trend',
  '[{"label":"Rose Absolue","value":1},{"label":"Neroli Air","value":6},{"label":"Lavender Veil","value":4}]',
  'Neroli Air je trenutno najtrazeniji proizvod.',
  '2026-02-01 11:20:00'
);


-- =============================================================
-- izvestaji_performanse.izvestaj_performansi
-- =============================================================
USE izvestaji_performanse;

INSERT INTO izvestaj_performansi (naziv, tip_algoritma, broj_ambalaza_po_slanju, vreme_obrade_sekunde, efikasnost_procenat, brzina_obrade, podaci_simulacije, zakljucci) VALUES
(
  'Simulacija distributivnog centra - standard',
  'distributivni_centar',
  3,
  0.50,
  94.00,
  6.00,
  '{"iteracije":120,"uspesno":113,"neuspesno":7}',
  'Najbolji rezultat za grupna slanja.'
),
(
  'Simulacija magacinskog centra - standard',
  'magacinski_centar',
  1,
  2.50,
  36.00,
  0.40,
  '{"iteracije":120,"uspesno":43,"neuspesno":77}',
  'Pogodno za male i hitne pojedinacne zahteve.'
),
(
  'Simulacija distributivnog centra - veci pritisak',
  'distributivni_centar',
  3,
  0.65,
  90.00,
  4.62,
  '{"iteracije":200,"uspesno":180,"neuspesno":20}',
  'Efikasnost blago opada pri vecem opterecenju, ali i dalje nadmocno.'
);


-- =============================================================
-- audit_logovi.audit_log
-- =============================================================
USE audit_logovi;

INSERT INTO audit_log (tip_zapisa, datum_vreme, opis, mikroservis, korisnik_id, ip_adresa, dodatni_podaci) VALUES
('INFO',    '2026-01-10 10:16:00', 'Uspesno kreiran fiskalni racun FR-2026-001.', 'sales-microservice', 3, '192.168.1.10', '{"billNumber":"FR-2026-001","total":12900.00}'),
('INFO',    '2026-01-11 14:36:00', 'Uspesno kreiran fiskalni racun FR-2026-002.', 'sales-microservice', 2, '192.168.1.11', '{"billNumber":"FR-2026-002","total":49200.00}'),
('WARNING', '2026-01-12 09:10:00', 'Nizak broj dostupnih ambalaza na severnom skladistu.', 'storage-microservice', NULL, '192.168.1.20', '{"warehouseId":2,"available":4}'),
('INFO',    '2026-01-12 12:10:00', 'Prosledjeni podaci o prodaji analitici.', 'analysis-microservice', 4, '192.168.1.30', '{"period":"2026-01"}'),
('ERROR',   '2026-01-13 07:45:00', 'Neuspesna konekcija ka weather servisu pri prvom pokusaju.', 'gateway-api', NULL, '192.168.1.1', '{"retry":1}'),
('INFO',    '2026-01-13 07:45:03', 'Konekcija ka weather servisu uspesno obnovljena.', 'gateway-api', NULL, '192.168.1.1', '{"retry":2}'),
('INFO',    '2026-01-14 09:55:00', 'Veleprodajni racun FR-2026-005 potvrden.', 'sales-microservice', 2, '192.168.1.12', '{"billNumber":"FR-2026-005"}'),
('WARNING', '2026-01-15 16:20:00', 'Povecano vreme obrade magacinskog centra.', 'performance-microservice', NULL, '192.168.1.40', '{"observedSeconds":3.1}');


-- =============================================================
-- vremenski_uslovi.vremenski_dan
-- =============================================================
USE vremenski_uslovi;

INSERT INTO vremenski_dan (
    datum,
    temperatura_c,
    vlaznost_pct,
    padavine_mm,
    stanje_temperature,
    stanje_vlaznosti,
    stanje_padavina,
    napomena,
    kreirao_korisnik_id
) VALUES
('2026-01-08', 3.0, 78, 12.0, 'COLD', 'HUMID', 'HEAVY', 'Jaka kisa tokom noci.', 2),
('2026-01-09', 1.0, 82, 6.0, 'COLD', 'HUMID', 'LIGHT', 'Hladno jutro, slaba kisa.', 2),
('2026-01-10', 5.0, 60, 0.0, 'COLD', 'OK', 'NONE', 'Suncano i suvo.', 3),
('2026-01-11', 7.5, 58, 1.5, 'MODERATE', 'OK', 'LIGHT', 'Kratka popodnevna kisa.', 3),
('2026-01-12', 9.0, 52, 0.0, 'MODERATE', 'OK', 'NONE', 'Stabilan dan za transport.', 4),
('2026-01-13', 11.0, 49, 0.0, 'MODERATE', 'OK', 'NONE', 'Bez padavina.', 4),
('2026-01-14', 13.5, 44, 0.0, 'MODERATE', 'OK', 'NONE', 'Toplije za januar.', 5),
('2026-01-15', 15.0, 40, 0.0, 'MODERATE', 'OK', 'NONE', 'Idealni uslovi za logistiku.', 5),
('2026-01-16', 6.0, 72, 2.0, 'MODERATE', 'HUMID', 'LIGHT', 'Povecana vlaznost.', 2),
('2026-01-17', 4.0, 68, 0.0, 'COLD', 'OK', 'NONE', 'Hladniji dan bez padavina.', 2);


-- =============================================================
-- preporuke.item_co_occurrence (seed na osnovu prodaja podataka)
-- =============================================================
USE preporuke;


INSERT INTO item_co_occurrence (parfem_id_1, parfem_id_2, zajednicki_broj_kupovina) VALUES
(1, 2, 3),
(1, 4, 2),
(2, 3, 1),
(3, 4, 2),
(3, 10, 2),
(4, 9, 3),
(6, 8, 1),
(9, 10, 4);

-- =============================================================
-- preporuke.user_recommendations (seed primjeri)
-- =============================================================

-- Preporuka za korisnika 3 (ana.seller) - kupio parfem 1 i 10
INSERT INTO user_recommendations (korisnik_id, preporuceni_parfemi, tip_preporuke, generisan_datum, istice_datum)
VALUES (
    3,
    '[
        {"parfemId":9,"naziv":"Neroli Air","preporukaTip":"popularity","score":90},
        {"parfemId":2,"naziv":"Lavender Veil","preporukaTip":"popularity","score":80},
        {"parfemId":3,"naziv":"Bergamot Intense","preporukaTip":"popularity","score":70},
        {"parfemId":4,"naziv":"Jasmine Nuit","preporukaTip":"popularity","score":60},
        {"parfemId":6,"naziv":"Vetiver Line","preporukaTip":"popularity","score":50}
    ]',
    'hybrid',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 DAY)
);

-- Preporuka za korisnika 4 (marko.seller) - kupio parfem 4
INSERT INTO user_recommendations (korisnik_id, preporuceni_parfemi, tip_preporuke, generisan_datum, istice_datum)
VALUES (
    4,
    '[
        {"parfemId":9,"naziv":"Neroli Air","preporukaTip":"popularity","score":90},
        {"parfemId":2,"naziv":"Lavender Veil","preporukaTip":"popularity","score":80},
        {"parfemId":1,"naziv":"Rose Absolue","preporukaTip":"popularity","score":70},
        {"parfemId":3,"naziv":"Bergamot Intense","preporukaTip":"popularity","score":60},
        {"parfemId":8,"naziv":"Iris Signature","preporukaTip":"popularity","score":50}
    ]',
    'hybrid',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 DAY)
);

-- #############################################################
-- PART 3: CLEANUP (DELETE ALL DATA FROM ALL TABLES)
-- #############################################################
-- NOTE: Ovaj deo obrisi podatke iz svih tabela.

SET FOREIGN_KEY_CHECKS = 0;

USE korisnici;
TRUNCATE TABLE users;

USE proizvodnja;
TRUNCATE TABLE biljka;

USE prerada;
TRUNCATE TABLE parfem;

USE skladista;
TRUNCATE TABLE ambalaza_parfem;
TRUNCATE TABLE ambalaza;
TRUNCATE TABLE skladiste;

USE prodaja;
TRUNCATE TABLE stavka_racuna;
TRUNCATE TABLE fiskalni_racun;

USE izvestaji_analize;
TRUNCATE TABLE trend_analyses;
TRUNCATE TABLE top_product_reports;
TRUNCATE TABLE sales_reports;
TRUNCATE TABLE fiscal_bills;
TRUNCATE TABLE izvestaj_analize;

USE izvestaji_performanse;
TRUNCATE TABLE izvestaj_performansi;

USE audit_logovi;
TRUNCATE TABLE audit_log;

USE vremenski_uslovi;
TRUNCATE TABLE vremenski_dan;

USE preporuke;
TRUNCATE TABLE user_recommendations;
TRUNCATE TABLE item_co_occurrence;

SET FOREIGN_KEY_CHECKS = 1;


-- #############################################################
-- PART 4: ANALYSIS-MICROSERVICE RESET + EDGE-CASE SEED
-- #############################################################
-- Ovaj deo je namenjen iskljucivo za testiranje analysis-microservice-a.
-- Resetuje podatke u bazi izvestaji_analize i ubacuje raznovrsne test primere.

USE izvestaji_analize;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE trend_analyses;
TRUNCATE TABLE top_product_reports;
TRUNCATE TABLE sales_reports;
TRUNCATE TABLE fiscal_bills;
TRUNCATE TABLE izvestaj_analize;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- fiscal_bills (edge-case primeri)
-- -------------------------------------------------------------
-- Pokriveno:
-- - granice dana: 00:00:00 i 23:59:59
-- - granice nedelje/meseca/godine
-- - prestupna godina
-- - mixed single/multi item racuni
-- - dupli productId unutar istog racuna
-- - null korisnik_id
-- - vrlo mali i veliki iznosi

INSERT INTO fiscal_bills (
    tip_prodaje,
    nacin_placanja,
    prodati_proizvodi,
    ukupan_iznos,
    datum_kreiranja,
    korisnik_id
) VALUES
(
    'retail',
    'cash',
    '[{"productId":101,"productName":"Edge Bloom 15ml","quantity":1,"price":999.99}]',
    999.99,
    '2024-02-29 12:00:00',
    3
),
(
    'wholesale',
    'bank_transfer',
    '[{"productId":102,"productName":"Noir Base 100ml","quantity":10,"price":4500.00},{"productId":103,"productName":"Amber Resin 100ml","quantity":5,"price":12000.00}]',
    105000.00,
    '2025-12-31 23:59:59',
    2
),
(
    'retail',
    'card',
    '[{"productId":101,"productName":"Edge Bloom 15ml","quantity":2,"price":999.99}]',
    1999.98,
    '2026-01-01 00:00:00',
    3
),
(
    'retail',
    'cash',
    '[{"productId":104,"productName":"Vanilla Dry","quantity":1,"price":15000.00}]',
    15000.00,
    '2026-01-15 11:22:00',
    4
),
(
    'wholesale',
    'bank_transfer',
    '[{"productId":105,"productName":"Citrus Peel","quantity":20,"price":2100.00}]',
    42000.00,
    '2026-01-26 08:00:00',
    2
),
(
    'retail',
    'card',
    '[{"productId":106,"productName":"Tonka Line","quantity":1,"price":8700.00},{"productId":107,"productName":"Tonka Line Refill","quantity":2,"price":4350.00}]',
    17400.00,
    '2026-01-31 23:59:59',
    5
),
(
    'retail',
    'cash',
    '[{"productId":108,"productName":"Marine Drop","quantity":3,"price":3200.00}]',
    9600.00,
    '2026-02-01 10:10:00',
    3
),
(
    'retail',
    'card',
    '[{"productId":109,"productName":"Blue Iris","quantity":1,"price":5600.00},{"productId":110,"productName":"Blue Iris Reserve","quantity":1,"price":5600.00}]',
    11200.00,
    '2026-02-02 00:00:00',
    4
),
(
    'retail',
    'cash',
    '[{"productId":109,"productName":"Blue Iris","quantity":1,"price":5600.00}]',
    5600.00,
    '2026-02-02 23:59:59',
    4
),
(
    'wholesale',
    'bank_transfer',
    '[{"productId":111,"productName":"Warehouse Mist","quantity":50,"price":790.00}]',
    39500.00,
    '2026-02-03 14:05:00',
    2
),
(
    'retail',
    'card',
    '[{"productId":112,"productName":"Gold Thread","quantity":1,"price":19990.00}]',
    19990.00,
    '2026-02-04 09:30:00',
    3
),
(
    'retail',
    'cash',
    '[{"productId":113,"productName":"Mini Sampler","quantity":4,"price":2500.00}]',
    10000.00,
    '2026-02-05 16:45:00',
    NULL
),
(
    'wholesale',
    'card',
    '[{"productId":114,"productName":"Spice Core","quantity":7,"price":3100.00},{"productId":115,"productName":"Spice Core Premium","quantity":3,"price":7000.00}]',
    42700.00,
    '2026-02-06 13:15:00',
    2
),
(
    'retail',
    'bank_transfer',
    '[{"productId":116,"productName":"Silk Air","quantity":2,"price":4300.00}]',
    8600.00,
    '2026-02-07 20:20:00',
    5
),
(
    'retail',
    'cash',
    '[{"productId":117,"productName":"Sunday Prime","quantity":1,"price":12900.00}]',
    12900.00,
    '2026-02-08 00:00:00',
    3
),
(
    'wholesale',
    'bank_transfer',
    '[{"productId":118,"productName":"Bulk Cedar","quantity":12,"price":1800.00},{"productId":118,"productName":"Bulk Cedar","quantity":8,"price":1800.00}]',
    36000.00,
    '2026-02-08 23:59:59',
    5
),
(
    'retail',
    'card',
    '[{"productId":119,"productName":"Test Unit","quantity":1,"price":1.00}]',
    1.00,
    '2026-02-08 12:00:00',
    4
),
(
    'wholesale',
    'cash',
    '[{"productId":120,"productName":"Load Test Barrel","quantity":1000,"price":99.99}]',
    99990.00,
    '2026-02-08 18:00:00',
    2
);

-- -------------------------------------------------------------
-- sales_reports (vec postojeci i edge reporti)
-- -------------------------------------------------------------
INSERT INTO sales_reports (
    tip_perioda,
    vrednost_perioda,
    ukupna_prodaja,
    broj_prodatih_jedinica,
    zarada,
    detalji,
    generisan_datum
) VALUES
(
    'daily',
    '2026-02-01',
    3.00,
    3,
    9600.00,
    '{"topProducts":[{"productId":108,"productName":"Marine Drop","unitsSold":3,"revenue":9600.00}],"averageSaleValue":3200.00}',
    '2026-02-01 23:59:59'
),
(
    'daily',
    '2026-02-02',
    3.00,
    3,
    16800.00,
    '{"topProducts":[{"productId":109,"productName":"Blue Iris","unitsSold":2,"revenue":11200.00},{"productId":110,"productName":"Blue Iris Reserve","unitsSold":1,"revenue":5600.00}],"averageSaleValue":5600.00}',
    '2026-02-02 23:59:59'
),
(
    'daily',
    '2026-02-03',
    50.00,
    50,
    39500.00,
    '{"topProducts":[{"productId":111,"productName":"Warehouse Mist","unitsSold":50,"revenue":39500.00}],"averageSaleValue":790.00}',
    '2026-02-03 23:59:59'
),
(
    'daily',
    '2026-02-04',
    1.00,
    1,
    19990.00,
    '{"topProducts":[{"productId":112,"productName":"Gold Thread","unitsSold":1,"revenue":19990.00}],"averageSaleValue":19990.00}',
    '2026-02-04 23:59:59'
),
(
    'daily',
    '2026-02-05',
    4.00,
    4,
    10000.00,
    '{"topProducts":[{"productId":113,"productName":"Mini Sampler","unitsSold":4,"revenue":10000.00}],"averageSaleValue":2500.00}',
    '2026-02-05 23:59:59'
),
(
    'daily',
    '2026-02-06',
    10.00,
    10,
    42700.00,
    '{"topProducts":[{"productId":114,"productName":"Spice Core","unitsSold":7,"revenue":21700.00},{"productId":115,"productName":"Spice Core Premium","unitsSold":3,"revenue":21000.00}],"averageSaleValue":4270.00}',
    '2026-02-06 23:59:59'
),
(
    'daily',
    '2026-02-07',
    2.00,
    2,
    8600.00,
    '{"topProducts":[{"productId":116,"productName":"Silk Air","unitsSold":2,"revenue":8600.00}],"averageSaleValue":4300.00}',
    '2026-02-07 23:59:59'
),
(
    'daily',
    '2026-02-08',
    1022.00,
    1022,
    148891.00,
    '{"topProducts":[{"productId":120,"productName":"Load Test Barrel","unitsSold":1000,"revenue":99990.00}],"averageSaleValue":145.69}',
    '2026-02-08 23:59:59'
),
(
    'weekly',
    '2026-W06',
    1092.00,
    1092,
    286481.00,
    '{"topProducts":[{"productId":120,"productName":"Load Test Barrel","unitsSold":1000,"revenue":99990.00},{"productId":111,"productName":"Warehouse Mist","unitsSold":50,"revenue":39500.00}],"averageSaleValue":262.35}',
    '2026-02-09 00:05:00'
),
(
    'monthly',
    '2026-02',
    1095.00,
    1095,
    296081.00,
    '{"topProducts":[{"productId":120,"productName":"Load Test Barrel","unitsSold":1000,"revenue":99990.00},{"productId":118,"productName":"Bulk Cedar","unitsSold":20,"revenue":36000.00}],"averageSaleValue":270.39}',
    '2026-03-01 09:00:00'
),
(
    'yearly',
    '2026',
    1121.00,
    1121,
    372480.98,
    '{"note":"Ukljucuje racune od 2026-01-01 do 2026-12-31.","averageSaleValue":332.28}',
    '2026-12-31 23:59:59'
),
(
    'total',
    'all',
    1137.00,
    1137,
    478480.97,
    '{"note":"Kumulativni izvestaj ukljucuje i istorijske racune iz 2024 i 2025.","averageSaleValue":420.83}',
    '2027-01-01 00:00:10'
);

-- -------------------------------------------------------------
-- top_product_reports (ukljucujuci prazan rezultat)
-- -------------------------------------------------------------
INSERT INTO top_product_reports (
    period,
    top_proizvodi,
    ukupna_zarada_od_top,
    generisan_datum
) VALUES
(
    '2026-02',
    '[{"productId":120,"productName":"Load Test Barrel","unitsSold":1000,"revenue":99990.00,"percentage":47.98},{"productId":111,"productName":"Warehouse Mist","unitsSold":50,"revenue":39500.00,"percentage":18.96},{"productId":118,"productName":"Bulk Cedar","unitsSold":20,"revenue":36000.00,"percentage":17.28},{"productId":112,"productName":"Gold Thread","unitsSold":1,"revenue":19990.00,"percentage":9.59},{"productId":117,"productName":"Sunday Prime","unitsSold":1,"revenue":12900.00,"percentage":6.19}]',
    208380.00,
    '2026-03-01 10:00:00'
),
(
    '2026-W06',
    '[{"productId":120,"productName":"Load Test Barrel","unitsSold":1000,"revenue":99990.00,"percentage":51.54},{"productId":111,"productName":"Warehouse Mist","unitsSold":50,"revenue":39500.00,"percentage":20.36},{"productId":118,"productName":"Bulk Cedar","unitsSold":20,"revenue":36000.00,"percentage":18.55}]',
    175490.00,
    '2026-02-09 10:00:00'
),
(
    '2099-01',
    '[]',
    0.00,
    '2099-02-01 08:00:00'
);

-- -------------------------------------------------------------
-- trend_analyses (razlicite vrste + prazan trend)
-- -------------------------------------------------------------
INSERT INTO trend_analyses (
    tip_analize,
    podaci,
    zakljucak,
    generisan_datum
) VALUES
(
    'monthly_trend',
    '[{"label":"2025-12","value":15},{"label":"2026-01","value":32},{"label":"2026-02","value":1095}]',
    'Rastuci trend prodaje uz nagli skok u februaru.',
    '2026-03-01 11:00:00'
),
(
    'product_trend',
    '[{"label":"Blue Iris","value":2,"productId":109},{"label":"Bulk Cedar","value":20,"productId":118},{"label":"Load Test Barrel","value":1000,"productId":120}]',
    'Dominacija jednog proizvoda ukazuje na neravnomernu traznju.',
    '2026-03-01 11:05:00'
),
(
    'category_trend',
    '[{"label":"retail","value":18},{"label":"wholesale","value":4}]',
    'Retail ima vise racuna, ali wholesale nosi veci prihod.',
    '2026-03-01 11:10:00'
),
(
    'monthly_trend',
    '[]',
    'Nema dovoljno podataka za analizu',
    '2026-03-01 11:15:00'
);

-- -------------------------------------------------------------
-- legacy izvestaj_analize (kompatibilnost)
-- -------------------------------------------------------------
INSERT INTO izvestaj_analize (
    naziv,
    tip_izvestaja,
    period_od,
    period_do,
    podaci,
    datum_kreiranja
) VALUES
(
    'Nedeljni edge-case pregled',
    'nedeljni',
    '2026-02-02',
    '2026-02-08',
    '{"ukupna_prodaja":1092,"ukupna_zarada":286481.00,"napomena":"Ukljuceni granicni timestamp-i."}',
    '2026-02-09 12:00:00'
),
(
    'Mesecni edge-case pregled',
    'mesecni',
    '2026-02-01',
    '2026-02-28',
    '{"ukupna_prodaja":1095,"ukupna_zarada":296081.00,"top":{"productId":120,"unitsSold":1000}}',
    '2026-03-01 12:00:00'
),
(
    'Trend anomalije i outlier-i',
    'trend',
    '2025-12-01',
    '2026-02-28',
    '{"zakljucak":"Detektovan outlier zbog proizvoda sa 1000 jedinica u jednom racunu."}',
    '2026-03-01 12:05:00'
);
