ALTER TABLE registros_combustible
  ADD COLUMN tipo_combustible_id INT DEFAULT NULL AFTER tipo_combustible,
  ADD COLUMN proveedor_id INT DEFAULT NULL AFTER proveedor,
  ADD COLUMN sub_proyecto_id INT DEFAULT NULL AFTER sub_proyecto;

UPDATE registros_combustible r
  LEFT JOIN tipos_combustible tc ON r.tipo_combustible = tc.nombre
  SET r.tipo_combustible_id = tc.id;

UPDATE registros_combustible r
  LEFT JOIN proveedores p ON r.proveedor = p.nombre
  SET r.proveedor_id = p.id;

UPDATE registros_combustible r
  LEFT JOIN sub_proyectos sp ON r.sub_proyecto = sp.nombre
  SET r.sub_proyecto_id = sp.id;

ALTER TABLE registros_combustible
  DROP COLUMN tipo_combustible,
  DROP COLUMN proveedor,
  DROP COLUMN sub_proyecto;


