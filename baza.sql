-- ============================================
-- SQL SKRIPTA ZA INFORMACIONI SISTEM PARFUMERIJE O'SINJEL DE OR
-- Osnove informacione bezbednosti 2025/2026
-- ============================================

-- ============================================
-- BAZA PODATAKA: korisnici
-- Koriste je: Autentifikacioni servis i Korisnicki servis
-- ============================================

CREATE DATABASE IF NOT EXISTS korisnici
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;




CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'SELLER') NOT NULL DEFAULT 'SELLER',
    profileImage LONGTEXT,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
USE korisnici;
SELECT * FROM users;


ALTER TABLE users 
ADD COLUMN lastName VARCHAR(100) NULL AFTER firstName;

-- ============================================
-- BAZA PODATAKA: proizvodnja
-- Koristi je: Mikroservis proizvodnje
-- ============================================

CREATE DATABASE IF NOT EXISTS proizvodnja
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE proizvodnja;

-- Tabela za biljke
CREATE TABLE IF NOT EXISTS biljka (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opsti_naziv VARCHAR(100) NOT NULL,
    jacina_aromaticnih_ulja DECIMAL(2,1) NOT NULL,    -- Opseg od 1.0 do 5.0
    latinski_naziv VARCHAR(150) NOT NULL,
    zemlja_porekla VARCHAR(100) NOT NULL,
    stanje ENUM('posadjena', 'ubrana', 'preradjena') NOT NULL DEFAULT 'posadjena',
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Provera opsega jacine aromaticnih ulja
    CONSTRAINT chk_jacina_ulja CHECK (jacina_aromaticnih_ulja >= 1.0 AND jacina_aromaticnih_ulja <= 5.0)
);


-- ============================================
-- BAZA PODATAKA: prerada
-- Koristi je: Mikroservis za preradu siroovina
-- ============================================

CREATE DATABASE IF NOT EXISTS prerada
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prerada;

-- Tabela za parfeme
CREATE TABLE IF NOT EXISTS parfem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    tip ENUM('parfem', 'kolonjska_voda') NOT NULL,
    neto_kolicina INT NOT NULL,                        -- U mililitrima (150 ili 250)
    serijski_broj VARCHAR(50) NOT NULL UNIQUE,         -- Format: PP-2025-ID_PARFEMA
    biljka_id INT NOT NULL,                            -- ID biljke od koje je napravljen
    rok_trajanja DATE NOT NULL,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Provera neto kolicine (150ml ili 250ml)
    CONSTRAINT chk_neto_kolicina CHECK (neto_kolicina IN (150, 250))
);


-- ============================================
-- BAZA PODATAKA: skladista
-- Koristi je: Mikroservis za skladistenje
-- ============================================

CREATE DATABASE IF NOT EXISTS skladista
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE skladista;

-- Tabela za skladista
CREATE TABLE IF NOT EXISTS skladiste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    lokacija VARCHAR(200) NOT NULL,
    maksimalni_kapacitet INT NOT NULL,                -- Maksimalan broj ambalaza
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Kapacitet mora biti pozitivan broj
    CONSTRAINT chk_kapacitet CHECK (maksimalni_kapacitet > 0)
);

-- Tabela za ambalaze
CREATE TABLE IF NOT EXISTS ambalaza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    adresa_posiljaoca VARCHAR(200) NOT NULL,
    skladiste_id INT,                                  -- Moze biti NULL dok nije poslata
    status ENUM('spakovana', 'poslata') NOT NULL DEFAULT 'spakovana',
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (skladiste_id) REFERENCES skladiste(id) ON DELETE SET NULL
);

-- Spojva tabela za vezu ambalaza-parfemi (jedan parfem moze biti samo u jednoj ambalazi)
CREATE TABLE IF NOT EXISTS ambalaza_parfem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambalaza_id INT NOT NULL,
    parfem_id INT NOT NULL UNIQUE,                     -- UNIQUE osigurava da parfem bude samo u jednoj ambalazi
    datum_dodavanja DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ambalaza_id) REFERENCES ambalaza(id) ON DELETE CASCADE
);


-- ============================================
-- BAZA PODATAKA: prodaja
-- Koristi je: Mikroservis za prodaju
-- ============================================

CREATE DATABASE IF NOT EXISTS prodaja
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prodaja;

-- Tabela za fiskalne racune
CREATE TABLE IF NOT EXISTS fiskalni_racun (
    id INT AUTO_INCREMENT PRIMARY KEY,
    broj_racuna VARCHAR(50) NOT NULL UNIQUE,           -- Format: FR-YYYY-ID
    tip_prodaje ENUM('maloprodaja', 'veleprodaja') NOT NULL,
    nacin_placanja ENUM('gotovina', 'uplata_na_racun', 'karticno') NOT NULL,
    ukupan_iznos DECIMAL(12,2) NOT NULL,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Iznos mora biti pozitivan
    CONSTRAINT chk_iznos CHECK (ukupan_iznos > 0)
);

-- Tabela za stavke racuna (prodati parfemi)
CREATE TABLE IF NOT EXISTS stavka_racuna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiskalni_racun_id INT NOT NULL,
    parfem_id INT NOT NULL,
    naziv_parfema VARCHAR(100) NOT NULL,               -- Cuvamo naziv za istoriju
    kolicina INT NOT NULL,
    cena_po_komadu DECIMAL(10,2) NOT NULL,
    ukupna_cena DECIMAL(12,2) NOT NULL,
    
    FOREIGN KEY (fiskalni_racun_id) REFERENCES fiskalni_racun(id) ON DELETE CASCADE,
    
    -- Kolicina mora biti pozitivna
    CONSTRAINT chk_kolicina CHECK (kolicina > 0)
);


-- ============================================
-- BAZA PODATAKA: izvestaji_analize
-- Koristi je: Mikroservis za analizu podataka
-- ============================================

CREATE DATABASE IF NOT EXISTS izvestaji_analize
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE izvestaji_analize;

-- Tabela za izvestaje analize prodaje
CREATE TABLE IF NOT EXISTS izvestaj_analize (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(200) NOT NULL,
    tip_izvestaja ENUM('mesecni', 'nedeljni', 'godisnji', 'ukupno', 'trend', 'top_parfemi') NOT NULL,
    period_od DATE,
    period_do DATE,
    podaci JSON NOT NULL,                              -- JSON format za fleksibilnost podataka
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- BAZA PODATAKA: izvestaji_performanse
-- Koristi je: Mikroservis za analizu performansi
-- ============================================

CREATE DATABASE IF NOT EXISTS izvestaji_performanse
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE izvestaji_performanse;

-- Tabela za izvestaje performansi logistickih algoritama
CREATE TABLE IF NOT EXISTS izvestaj_performansi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(200) NOT NULL,
    tip_algoritma ENUM('distributivni_centar', 'magacinski_centar') NOT NULL,
    broj_ambalaza_po_slanju INT NOT NULL,
    vreme_obrade_sekunde DECIMAL(5,2) NOT NULL,
    efikasnost_procenat DECIMAL(5,2) NOT NULL,
    brzina_obrade DECIMAL(10,2) NOT NULL,              -- Ambalaza po sekundi
    podaci_simulacije JSON NOT NULL,                   -- Detaljni podaci simulacije
    zakljucci TEXT,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- BAZA PODATAKA: audit_logovi
-- Koristi je: Mikroservis za evidenciju dogadjaja
-- ============================================

CREATE DATABASE IF NOT EXISTS audit_logovi
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE audit_logovi;

-- Tabela za evidenciju dogadjaja
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_zapisa ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
    datum_vreme DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opis TEXT NOT NULL,
    mikroservis VARCHAR(100),                          -- Koji mikroservis je generisao log
    korisnik_id INT,                                   -- ID korisnika koji je inicirao akciju (opciono)
    ip_adresa VARCHAR(45),                             -- IPv4 ili IPv6
    dodatni_podaci JSON                                -- Opcioni dodatni podaci
);


-- ============================================
-- TESTNI PODACI - KORISNICI
-- ============================================

USE korisnici;

-- Lozinke su hesirane (primer: 'lozinka123' hesirana bcryptom)
-- U pravoj aplikaciji koristiti pravi bcrypt hes
INSERT INTO korisnik (korisnicko_ime, lozinka, email, ime, prezime, uloga) VALUES
('admin', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 'admin@parfumerija.com', 'Marko', 'Markovic', 'administrator'),
('menadzer1', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 'menadzer@parfumerija.com', 'Jelena', 'Jovanovic', 'menadzer_prodaje'),
('prodavac1', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 'prodavac1@parfumerija.com', 'Petar', 'Petrovic', 'prodavac'),
('prodavac2', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 'prodavac2@parfumerija.com', 'Ana', 'Anic', 'prodavac');


-- ============================================
-- TESTNI PODACI - BILJKE
-- ============================================

USE proizvodnja;

INSERT INTO biljka (opsti_naziv, jacina_aromaticnih_ulja, latinski_naziv, zemlja_porekla, stanje) VALUES
('Lavanda', 3.2, 'Lavandula angustifolia', 'Francuska', 'posadjena'),
('Ruza', 4.5, 'Rosa damascena', 'Bugarska', 'ubrana'),
('Bergamot', 2.8, 'Citrus bergamia', 'Italija', 'preradjena'),
('Jasmin', 3.9, 'Jasminum officinale', 'Egipat', 'ubrana'),
('Sandalovina', 4.1, 'Santalum album', 'Indija', 'posadjena'),
('Vetiver', 3.5, 'Chrysopogon zizanioides', 'Haiti', 'posadjena'),
('Pačuli', 2.9, 'Pogostemon cablin', 'Indonezija', 'ubrana'),
('Iris', 4.3, 'Iris pallida', 'Italija', 'posadjena'),
('Tuberoza', 3.7, 'Polianthes tuberosa', 'Indija', 'preradjena'),
('Neroli', 4.0, 'Citrus aurantium', 'Tunis', 'ubrana');


-- ============================================
-- TESTNI PODACI - PARFEMI
-- ============================================

USE prerada;

INSERT INTO parfem (naziv, tip, neto_kolicina, serijski_broj, biljka_id, rok_trajanja) VALUES
('Roza Mistika', 'parfem', 250, 'PP-2025-001', 2, '2027-10-22'),
('Lavander Noir', 'kolonjska_voda', 150, 'PP-2025-002', 1, '2027-09-15'),
('Bergamot Esens', 'parfem', 250, 'PP-2025-003', 3, '2027-11-30'),
('Jasmin De Nui', 'kolonjska_voda', 150, 'PP-2025-004', 4, '2027-08-20'),
('Santal Royal', 'parfem', 250, 'PP-2025-005', 5, '2028-01-15'),
('Vetiver Vert', 'kolonjska_voda', 150, 'PP-2025-006', 6, '2027-07-10'),
('Pačuli Noir', 'parfem', 150, 'PP-2025-007', 7, '2027-12-05'),
('Iris D\'Or', 'parfem', 250, 'PP-2025-008', 8, '2028-02-28');


-- ============================================
-- TESTNI PODACI - SKLADISTA I AMBALAZE
-- ============================================

USE skladista;

INSERT INTO skladiste (naziv, lokacija, maksimalni_kapacitet) VALUES
('Centralno skladiste', 'Pariz, Ru de la Pe 45', 100),
('Severno skladiste', 'Pariz, Avenio Fos 12', 75),
('Juzno skladiste', 'Pariz, Bul. Sen Zermen 89', 50);

INSERT INTO ambalaza (naziv, adresa_posiljaoca, skladiste_id, status) VALUES
('Centar za pakovanje 1', 'Pariz, Fabrika parfema 1', 1, 'spakovana'),
('Centar za pakovanje 1', 'Pariz, Fabrika parfema 1', 1, 'poslata'),
('Centar za pakovanje 2', 'Pariz, Fabrika parfema 2', 2, 'spakovana'),
('Centar za pakovanje 2', 'Pariz, Fabrika parfema 2', 2, 'spakovana'),
('Centar za pakovanje 3', 'Pariz, Fabrika parfema 3', 3, 'poslata');

INSERT INTO ambalaza_parfem (ambalaza_id, parfem_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5),
(3, 6), (3, 7),
(4, 8);


-- ============================================
-- TESTNI PODACI - PRODAJA
-- ============================================

USE prodaja;

INSERT INTO fiskalni_racun (broj_racuna, tip_prodaje, nacin_placanja, ukupan_iznos, datum_kreiranja) VALUES
('FR-2025-001', 'maloprodaja', 'karticno', 12500.00, '2025-10-22 10:30:00'),
('FR-2025-002', 'veleprodaja', 'uplata_na_racun', 45000.00, '2025-10-22 14:15:00'),
('FR-2025-003', 'maloprodaja', 'gotovina', 8900.00, '2025-10-21 16:45:00');

INSERT INTO stavka_racuna (fiskalni_racun_id, parfem_id, naziv_parfema, kolicina, cena_po_komadu, ukupna_cena) VALUES
(1, 1, 'Roza Mistika', 1, 12500.00, 12500.00),
(2, 2, 'Lavander Noir', 3, 8900.00, 26700.00),
(2, 3, 'Bergamot Esens', 1, 13200.00, 13200.00),
(2, 4, 'Jasmin De Nui', 1, 9500.00, 5100.00),
(3, 2, 'Lavander Noir', 1, 8900.00, 8900.00);


-- ============================================
-- TESTNI PODACI - IZVESTAJI ANALIZE
-- ============================================

USE izvestaji_analize;

INSERT INTO izvestaj_analize (naziv, tip_izvestaja, period_od, period_do, podaci) VALUES
('Nedeljni izvestaj prodaje', 'nedeljni', '2025-10-14', '2025-10-20', 
 '{"ukupna_prodaja": 192, "ukupna_zarada": 2127400, "prosecno_dnevno": 27, "najbolji_dan": "subota"}'),
('Top 10 parfema - Oktobar', 'top_parfemi', '2025-10-01', '2025-10-31',
 '{"parfemi": [{"naziv": "Roza Mistika", "prodaja": 156, "prihod": 1950000}, {"naziv": "Lavander Noir", "prodaja": 234, "prihod": 2082600}]}');


-- ============================================
-- TESTNI PODACI - IZVESTAJI PERFORMANSI
-- ============================================

USE izvestaji_performanse;

INSERT INTO izvestaj_performansi (naziv, tip_algoritma, broj_ambalaza_po_slanju, vreme_obrade_sekunde, efikasnost_procenat, brzina_obrade, podaci_simulacije, zakljucci) VALUES
('Simulacija distributivnog centra', 'distributivni_centar', 3, 0.50, 93.00, 6.0,
 '{"iteracije": 100, "uspesno": 93, "neuspesno": 7}',
 'Distributivni centar je 15 puta brzi od magacinskog centra za isti broj ambalaza.'),
('Simulacija magacinskog centra', 'magacinski_centar', 1, 2.50, 35.00, 0.4,
 '{"iteracije": 100, "uspesno": 35, "neuspesno": 65}',
 'Magacinski centar pogodjen je samo za pojedinacne, sitne zahteve maloprodaje.');


-- ============================================
-- TESTNI PODACI - AUDIT LOGOVI
-- ============================================

USE audit_logovi;

INSERT INTO audit_log (tip_zapisa, opis, mikroservis, korisnik_id, ip_adresa) VALUES
('INFO', 'Uspesna prijava korisnika na sistem', 'autentifikacija', 2, '192.168.1.100'),
('INFO', 'Zasadjena biljka: Lavanda', 'proizvodnja', 2, '192.168.1.100'),
('INFO', 'Prerada zavrsena: 5 bocica parfema', 'prerada', 2, '192.168.1.100'),
('WARNING', 'Upozorenje: Jacina ulja prelazi 4.0', 'prerada', 2, '192.168.1.100'),
('INFO', 'Ambalaza poslata u skladiste', 'skladistenje', 3, '192.168.1.101'),
('INFO', 'Kreiran fiskalni racun FR-2025-001', 'prodaja', 3, '192.168.1.101'),
('ERROR', 'Greska pri povezivanju na bazu podataka', 'proizvodnja', NULL, '192.168.1.100');

USE korisnici;

DROP TABLE IF EXISTS korisnik;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'SELLER') NOT NULL DEFAULT 'SELLER',
    profileImage LONGTEXT,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Testni podaci
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 'admin@parfumerija.com', 'ADMIN'),
('prodavac1', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 'prodavac1@parfumerija.com', 'SELLER');