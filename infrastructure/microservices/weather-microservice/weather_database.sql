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
