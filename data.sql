-- ============================================
-- SQL SKRIPTA ZA INFORMACIONI SISTEM PARFUMERIJE O'SINJEL DE OR
-- Osnove informacione bezbednosti 2025/2026
-- ============================================
-- Kompletna skripta - pokreće se jednom i kreira sve baze
-- ============================================

-- ============================================
-- BAZA PODATAKA: korisnici
-- Koriste je: Autentifikacioni servis i Korisnicki servis
-- ============================================

CREATE DATABASE IF NOT EXISTS korisnici
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE korisnici;

-- Tabela za korisnike sistema
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,                          -- Heširana lozinka (bcrypt)
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(100) NULL,                             -- Ime korisnika
    lastName VARCHAR(100) NULL,                              -- Prezime korisnika
    role ENUM('ADMIN', 'SALES_MANAGER', 'SELLER') NOT NULL DEFAULT 'SELLER',
    profileImage LONGTEXT NULL,                              -- Profilna slika u base64 formatu
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


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
    jacina_aromaticnih_ulja DECIMAL(2,1) NOT NULL,           -- Opseg od 1.0 do 5.0
    latinski_naziv VARCHAR(150) NOT NULL,
    zemlja_porekla VARCHAR(100) NOT NULL,
    stanje ENUM('posadjena', 'ubrana', 'preradjena') NOT NULL DEFAULT 'posadjena',
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Provera opsega jačine aromatičnih ulja
    CONSTRAINT chk_jacina_ulja CHECK (jacina_aromaticnih_ulja >= 1.0 AND jacina_aromaticnih_ulja <= 5.0)
);


-- ============================================
-- BAZA PODATAKA: prerada
-- Koristi je: Mikroservis za preradu sirovina
-- ============================================

CREATE DATABASE IF NOT EXISTS prerada
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prerada;

-- Tabela za parfeme
-- Tip: parfem ili kolonjska_voda
-- Neto količina: 150ml ili 250ml
-- Od 1 biljke se dobija 50ml parfema
CREATE TABLE IF NOT EXISTS parfem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    tip ENUM('parfem', 'kolonjska_voda') NOT NULL,
    neto_kolicina INT NOT NULL,                              -- U mililitrima (150 ili 250)
    serijski_broj VARCHAR(50) NOT NULL UNIQUE,               -- Format: PP-2025-ID_PARFEMA
    biljka_id INT NOT NULL,                                  -- ID biljke od koje je napravljen
    rok_trajanja DATE NOT NULL,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Provera neto količine (150ml ili 250ml)
    CONSTRAINT chk_neto_kolicina CHECK (neto_kolicina IN (150, 250))
);


-- ============================================
-- BAZA PODATAKA: skladista
-- Koristi je: Mikroservis za skladištenje
-- ============================================

CREATE DATABASE IF NOT EXISTS skladista
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE skladista;

-- Tabela za skladišta
CREATE TABLE IF NOT EXISTS skladiste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    lokacija VARCHAR(200) NOT NULL,
    maksimalni_kapacitet INT NOT NULL,                       -- Maksimalan broj ambalaža
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Kapacitet mora biti pozitivan broj
    CONSTRAINT chk_kapacitet CHECK (maksimalni_kapacitet > 0)
);

-- Tabela za ambalaže
-- Status: spakovana, poslata
CREATE TABLE IF NOT EXISTS ambalaza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    adresa_posiljaoca VARCHAR(200) NOT NULL,
    skladiste_id INT NULL,                                   -- Može biti NULL dok nije poslata
    status ENUM('spakovana', 'rezervisana', 'poslata', 'raspakovana') NOT NULL DEFAULT 'spakovana',
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (skladiste_id) REFERENCES skladiste(id) ON DELETE SET NULL
);

-- Spojna tabela za vezu ambalaža-parfemi
-- Jedan parfem može biti samo u jednoj ambalaži (UNIQUE constraint)
CREATE TABLE IF NOT EXISTS ambalaza_parfem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambalaza_id INT NOT NULL,
    parfem_id INT NOT NULL UNIQUE,                           -- UNIQUE osigurava da parfem bude samo u jednoj ambalaži
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

-- Tabela za fiskalne račune
-- Tip prodaje: maloprodaja, veleprodaja
-- Način plaćanja: gotovina, uplata_na_racun, karticno
CREATE TABLE IF NOT EXISTS fiskalni_racun (
    id INT AUTO_INCREMENT PRIMARY KEY,
    broj_racuna VARCHAR(50) NOT NULL UNIQUE,                 -- Format: FR-YYYY-ID
    tip_prodaje ENUM('maloprodaja', 'veleprodaja') NOT NULL,
    nacin_placanja ENUM('gotovina', 'uplata_na_racun', 'karticno') NOT NULL,
    ukupan_iznos DECIMAL(12,2) NOT NULL,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Iznos mora biti pozitivan
    CONSTRAINT chk_iznos CHECK (ukupan_iznos > 0)
);

-- Tabela za stavke računa (prodati parfemi)
CREATE TABLE IF NOT EXISTS stavka_racuna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiskalni_racun_id INT NOT NULL,
    parfem_id INT NOT NULL,
    naziv_parfema VARCHAR(100) NOT NULL,                     -- Čuvamo naziv za istoriju
    kolicina INT NOT NULL,
    cena_po_komadu DECIMAL(10,2) NOT NULL,
    ukupna_cena DECIMAL(12,2) NOT NULL,
    
    FOREIGN KEY (fiskalni_racun_id) REFERENCES fiskalni_racun(id) ON DELETE CASCADE,
    
    -- Količina mora biti pozitivna
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

-- Tabela za izveštaje analize prodaje
CREATE TABLE IF NOT EXISTS izvestaj_analize (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(200) NOT NULL,
    tip_izvestaja ENUM('mesecni', 'nedeljni', 'godisnji', 'ukupno', 'trend', 'top_parfemi') NOT NULL,
    period_od DATE NULL,
    period_do DATE NULL,
    podaci JSON NOT NULL,                                    -- JSON format za fleksibilnost podataka
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

-- Tabela za izveštaje performansi logističkih algoritama
-- Tip algoritma: distributivni_centar (3 ambalaže po slanju, 0.5s), magacinski_centar (1 ambalaža po slanju, 2.5s)
CREATE TABLE IF NOT EXISTS izvestaj_performansi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(200) NOT NULL,
    tip_algoritma ENUM('distributivni_centar', 'magacinski_centar') NOT NULL,
    broj_ambalaza_po_slanju INT NOT NULL,
    vreme_obrade_sekunde DECIMAL(5,2) NOT NULL,
    efikasnost_procenat DECIMAL(5,2) NOT NULL,
    brzina_obrade DECIMAL(10,2) NOT NULL,                    -- Ambalaža po sekundi
    podaci_simulacije JSON NOT NULL,                         -- Detaljni podaci simulacije
    zakljucci TEXT NULL,
    datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- BAZA PODATAKA: audit_logovi
-- Koristi je: Mikroservis za evidenciju događaja
-- ============================================

CREATE DATABASE IF NOT EXISTS audit_logovi
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE audit_logovi;

-- Tabela za evidenciju događaja
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tip_zapisa ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
    datum_vreme DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opis TEXT NOT NULL,
    mikroservis VARCHAR(100) NULL,                           -- Koji mikroservis je generisao log
    korisnik_id INT NULL,                                    -- ID korisnika koji je inicirao akciju (opciono)
    ip_adresa VARCHAR(45) NULL,                              -- IPv4 ili IPv6
    dodatni_podaci JSON NULL                                 -- Opcioni dodatni podaci
);

-- ============================================
-- TESTNI PODACI - BILJKE
-- ============================================

USE proizvodnja;

INSERT INTO biljka (opsti_naziv, jacina_aromaticnih_ulja, latinski_naziv, zemlja_porekla, stanje) VALUES
('Lavanda', 3.2, 'Lavandula angustifolia', 'Francuska', 'posadjena'),
('Ruža', 4.5, 'Rosa damascena', 'Bugarska', 'ubrana'),
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
-- TESTNI PODACI - SKLADIŠTA I AMBALAŽE
-- ============================================

USE skladista;

INSERT INTO skladiste (naziv, lokacija, maksimalni_kapacitet) VALUES
('Centralno skladište', 'Pariz, Ru de la Pe 45', 100),
('Severno skladište', 'Pariz, Avenio Foš 12', 75),
('Južno skladište', 'Pariz, Bul. Sen Žermen 89', 50);

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
(2, 4, 'Jasmin De Nui', 1, 5100.00, 5100.00),
(3, 2, 'Lavander Noir', 1, 8900.00, 8900.00);


-- ============================================
-- TESTNI PODACI - IZVEŠTAJI ANALIZE
-- ============================================

USE izvestaji_analize;

INSERT INTO izvestaj_analize (naziv, tip_izvestaja, period_od, period_do, podaci) VALUES
('Nedeljni izveštaj prodaje', 'nedeljni', '2025-10-14', '2025-10-20', 
 '{"ukupna_prodaja": 192, "ukupna_zarada": 2127400, "prosecno_dnevno": 27, "najbolji_dan": "subota"}'),
('Top 10 parfema - Oktobar', 'top_parfemi', '2025-10-01', '2025-10-31',
 '{"parfemi": [{"naziv": "Roza Mistika", "prodaja": 156, "prihod": 1950000}, {"naziv": "Lavander Noir", "prodaja": 234, "prihod": 2082600}]}');


-- ============================================
-- TESTNI PODACI - IZVEŠTAJI PERFORMANSI
-- ============================================

USE izvestaji_performanse;

INSERT INTO izvestaj_performansi (naziv, tip_algoritma, broj_ambalaza_po_slanju, vreme_obrade_sekunde, efikasnost_procenat, brzina_obrade, podaci_simulacije, zakljucci) VALUES
('Simulacija distributivnog centra', 'distributivni_centar', 3, 0.50, 93.00, 6.0,
 '{"iteracije": 100, "uspesno": 93, "neuspesno": 7}',
 'Distributivni centar je 15 puta brži od magacinskog centra za isti broj ambalaža.'),
('Simulacija magacinskog centra', 'magacinski_centar', 1, 2.50, 35.00, 0.4,
 '{"iteracije": 100, "uspesno": 35, "neuspesno": 65}',
 'Magacinski centar pogodan je samo za pojedinačne, sitne zahteve maloprodaje.');

-- =====================================================
-- Weather Microservice Database
-- Baza: vremenski_uslovi
-- =====================================================

CREATE DATABASE IF NOT EXISTS vremenski_uslovi;
USE vremenski_uslovi;
-- =====================================================
-- Tabela: vremenski_dan
-- =====================================================

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
  napomena TEXT,
  kreirao_korisnik_id INT,
  datum_kreiranja DATETIME DEFAULT CURRENT_TIMESTAMP,
  datum_azuriranja DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_datum (datum),
  INDEX idx_datum_mesec (datum_mesec)
);

-- =====================================================
-- Testni podaci
-- =====================================================

INSERT INTO vremenski_dan (datum, temperatura_c, vlaznost_pct, padavine_mm, stanje_temperature, stanje_vlaznosti, stanje_padavina, napomena)
VALUES
  ('2026-01-01', 2.5, 75, 15.0, 'COLD', 'HUMID', 'HEAVY', 'Novogodišnja oluja'),
  ('2026-01-02', -3.0, 80, 5.0, 'COLD', 'HUMID', 'LIGHT', 'Hladan dan sa slabim snegom'),
  ('2026-01-03', 5.0, 45, 0.0, 'COLD', 'OK', 'NONE', 'Sunčano ali hladno'),
  ('2026-01-10', 8.0, 55, 2.0, 'MODERATE', 'OK', 'LIGHT', 'Blaga kiša'),
  ('2026-01-15', 12.0, 50, 0.0, 'MODERATE', 'OK', 'NONE', 'Idealni uslovi za biljke');

ALTER TABLE fiskalni_racun
ADD COLUMN prodati_proizvodi JSON NOT NULL, 
ADD COLUMN korisnik_id INT NULL;
