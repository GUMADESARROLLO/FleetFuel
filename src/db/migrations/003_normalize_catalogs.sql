CREATE TABLE IF NOT EXISTS vehiculos (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  placa VARCHAR(20) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tipos_combustible (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sub_proyectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

INSERT IGNORE INTO vehiculos (id, nombre, placa) VALUES
  ('1', 'Pickup Toyota Hilux', 'ABC-123'),
  ('2', 'Van Ford Transit', 'DEF-456');

INSERT IGNORE INTO tipos_combustible (nombre) VALUES
  ('Gasolina Regular'),
  ('Gasolina Premium'),
  ('Diesel'),
  ('GLP');

INSERT IGNORE INTO proveedores (nombre) VALUES
  ('PUMA Energy'),
  ('UNO'),
  ('ESSO'),
  ('Shell'),
  ('Petronic');

INSERT IGNORE INTO sub_proyectos (nombre) VALUES
  ('Proyecto Alpha'),
  ('Proyecto Beta'),
  ('Operaciones Generales');


