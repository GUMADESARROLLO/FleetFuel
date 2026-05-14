UPDATE registros_combustible SET
  foto_odometro_antes = NULL,
  foto_odometro_despues = NULL,
  foto_factura = NULL,
  foto_voucher = NULL
WHERE LENGTH(COALESCE(foto_odometro_antes, '')) > 500
   OR LENGTH(COALESCE(foto_odometro_despues, '')) > 500
   OR LENGTH(COALESCE(foto_factura, '')) > 500
   OR LENGTH(COALESCE(foto_voucher, '')) > 500;

ALTER TABLE registros_combustible
  MODIFY COLUMN foto_odometro_antes VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN foto_odometro_despues VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN foto_factura VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN foto_voucher VARCHAR(500) DEFAULT NULL;
