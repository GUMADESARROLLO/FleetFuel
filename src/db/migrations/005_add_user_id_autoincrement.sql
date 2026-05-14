-- Migration 005: Add id AUTO_INCREMENT to usuarios and switch registros_combustible.user_id from VARCHAR(username) to INT(id)
-- Run manually if needed; already applied via _fix_migration_005.mjs

ALTER TABLE registros_combustible DROP FOREIGN KEY registros_combustible_ibfk_1;
ALTER TABLE registros_combustible DROP INDEX idx_registros_user_id;

SET @row_num = 0;
UPDATE usuarios SET id = (@row_num := @row_num + 1) ORDER BY username;

ALTER TABLE usuarios MODIFY COLUMN id INT NOT NULL;
ALTER TABLE usuarios DROP PRIMARY KEY;
ALTER TABLE usuarios MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE usuarios ADD UNIQUE INDEX idx_username (username);

ALTER TABLE registros_combustible ADD COLUMN user_id_int INT;
UPDATE registros_combustible r JOIN usuarios u ON r.user_id = u.username SET r.user_id_int = u.id;
ALTER TABLE registros_combustible DROP COLUMN user_id;
ALTER TABLE registros_combustible CHANGE COLUMN user_id_int user_id INT NOT NULL;
ALTER TABLE registros_combustible ADD INDEX idx_registros_user_id (user_id);
ALTER TABLE registros_combustible ADD CONSTRAINT fk_registros_user FOREIGN KEY (user_id) REFERENCES usuarios(id);
