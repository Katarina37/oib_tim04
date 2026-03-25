-- =====================================================
-- Security Incident Microservice Database
-- Baza: bezbednosni_incidenti
-- =====================================================

CREATE DATABASE IF NOT EXISTS bezbednosni_incidenti;
USE bezbednosni_incidenti;

-- =====================================================
-- Tabela: security_incident
-- =====================================================

CREATE TABLE IF NOT EXISTS security_incident (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_type ENUM('BRUTE_FORCE_LOGIN', 'UNAUTHORIZED_ACCESS_PATTERN', 'ERROR_SPIKE') NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_POSITIVE') NOT NULL DEFAULT 'OPEN',
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  fingerprint VARCHAR(191) NOT NULL,
  source_microservice VARCHAR(100) NULL,
  detected_at DATETIME NOT NULL,
  last_matched_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  occurrence_count INT NOT NULL DEFAULT 1,
  evidence JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_incident_fingerprint_open (incident_type, fingerprint, status),
  INDEX idx_incident_detected_at (detected_at),
  INDEX idx_incident_status (status),
  INDEX idx_incident_severity (severity),
  INDEX idx_incident_source_microservice (source_microservice)
);
