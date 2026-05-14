CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (id, nombre) VALUES (1, 'admin'), (2, 'conductor');

ALTER TABLE usuarios ADD COLUMN role_id INT;
UPDATE usuarios SET role_id = (SELECT id FROM roles WHERE roles.nombre = usuarios.role);
ALTER TABLE usuarios MODIFY COLUMN role_id INT NOT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_role FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE usuarios DROP COLUMN role;
