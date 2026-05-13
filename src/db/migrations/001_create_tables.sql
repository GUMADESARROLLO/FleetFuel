CREATE TABLE IF NOT EXISTS _migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  username VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin', 'conductor') NOT NULL DEFAULT 'conductor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registros_combustible (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  fecha_creacion DATETIME NOT NULL,
  foto_odometro_antes LONGTEXT,
  foto_odometro_despues LONGTEXT,
  foto_factura LONGTEXT,
  foto_voucher LONGTEXT,
  vehiculo_id VARCHAR(50) NOT NULL,
  vehiculo_nombre VARCHAR(100) NOT NULL,
  vehiculo_placa VARCHAR(20) NOT NULL,
  tipo_combustible VARCHAR(50) NOT NULL,
  proveedor VARCHAR(100) NOT NULL,
  sub_proyecto VARCHAR(100) NOT NULL,
  kilometraje INT NOT NULL DEFAULT 0,
  fecha_factura DATE NOT NULL,
  numero_factura VARCHAR(100) NOT NULL,
  numero_voucher VARCHAR(100) NOT NULL DEFAULT '',
  gravadas DECIMAL(12,2) NOT NULL DEFAULT 0,
  isr DECIMAL(12,2) NOT NULL DEFAULT 0,
  excedentes DECIMAL(12,2) NOT NULL DEFAULT 0,
  litros DECIMAL(10,2) NOT NULL DEFAULT 0,
  importe_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  ruta_recorrida TEXT,
  sincronizado TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(username)
);

CREATE INDEX idx_registros_user_id ON registros_combustible(user_id);
CREATE INDEX idx_registros_fecha ON registros_combustible(fecha_creacion);
CREATE INDEX idx_registros_sincronizado ON registros_combustible(sincronizado);
