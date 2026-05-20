--BD AgroStore - Esquema de base de datos sql para PostgreSQL

CREATE TABLE usuario (
  id_usuario    SERIAL        PRIMARY KEY,
  -- SERIAL = autoincremento en PostgreSQL (equivale a AUTO_INCREMENT de MySQL)
  nombre        VARCHAR(100)  NOT NULL,
  telefono      VARCHAR(20)   NOT NULL UNIQUE,
  -- UNIQUE: no pueden existir dos usuarios con el mismo teléfono
  tipo          VARCHAR(20)   NOT NULL
                CHECK (tipo IN ('Productor', 'Comprador', 'Administrador')),
  -- CHECK: solo acepta estos tres valores exactos
  contrasena    VARCHAR(255)  NOT NULL,
  -- Almacena el HASH de bcrypt, NUNCA la contraseña en texto plano
  ubicacion     VARCHAR(150),
  calificacion  DECIMAL(2,1)  DEFAULT 5.0,
  activo        BOOLEAN       DEFAULT TRUE,
  creado_en     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Tabla producto con las categorías requeridas
CREATE TABLE producto (
  id_producto         SERIAL        PRIMARY KEY,
  nombre              VARCHAR(100)  NOT NULL,
  descripcion         TEXT,
  cantidad_disponible INT           NOT NULL CHECK (cantidad_disponible >= 0),
  precio              DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  -- DECIMAL(10,2): hasta 99999999.99 quetzales, 2 decimales
  estado    VARCHAR(20)  DEFAULT 'Disponible'
            CHECK (estado IN ('Disponible', 'Reservado', 'Cerrado')),
  categoria VARCHAR(50)  NOT NULL
            CHECK (categoria IN ('Hortalizas','Granos Basicos','Frutas','Hierbas','Otros')),
  -- Las 5 categorías del sistema. El CHECK fuerza que solo se usen estas.
  punto_entrega  VARCHAR(150),
  id_productor   INT  NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  -- REFERENCES: llave foránea hacia usuario
  -- ON DELETE CASCADE: si se borra el usuario, se borran sus productos también
  creado_en      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido (
  id_pedido          SERIAL      PRIMARY KEY,
  fecha              DATE        NOT NULL DEFAULT CURRENT_DATE,
  estado             VARCHAR(20) DEFAULT 'Pendiente'
                     CHECK (estado IN ('Pendiente','Aceptado','Rechazado','Cancelado','Finalizado')),
  motivo_cancelacion TEXT,
  -- Se llena cuando estado = Rechazado o Cancelado
  id_comprador  INT  NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE detalle_pedido (
  id_detalle      SERIAL        PRIMARY KEY,
  id_pedido       INT  NOT NULL REFERENCES pedido(id_pedido)    ON DELETE CASCADE,
  id_producto     INT  NOT NULL REFERENCES producto(id_producto) ON DELETE RESTRICT,
  -- RESTRICT: no puedes borrar un producto que tiene pedidos asociados
  cantidad        INT           NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL
  -- Guardamos el precio al momento del pedido, porque puede cambiar después
);

CREATE TABLE entrega (
  id_entrega    SERIAL      PRIMARY KEY,
  fecha_entrega DATE,
  estado        VARCHAR(30) DEFAULT 'Pendiente'
                CHECK (estado IN ('Pendiente','Confirmado_Productor','Finalizado')),
  lugar         VARCHAR(150) NOT NULL,
  observaciones TEXT,
  id_pedido     INT NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE
);

CREATE TABLE pago (
  id_pago    SERIAL        PRIMARY KEY,
  monto      DECIMAL(10,2) NOT NULL,
  fecha_pago DATE,
  estado     VARCHAR(20)   DEFAULT 'Pendiente'
             CHECK (estado IN ('Pendiente','Pagado')),
  metodo     VARCHAR(50)   DEFAULT 'Contra entrega',
  id_pedido  INT NOT NULL  REFERENCES pedido(id_pedido) ON DELETE CASCADE
);

CREATE TABLE incumplimiento (
  id_incumplimiento SERIAL  PRIMARY KEY,
  descripcion       TEXT    NOT NULL,
  fecha             DATE    NOT NULL DEFAULT CURRENT_DATE,
  validado          BOOLEAN DEFAULT FALSE,
  -- FALSE = pendiente de revisión por el administrador
  id_usuario  INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_pedido   INT NOT NULL REFERENCES pedido(id_pedido)   ON DELETE CASCADE
);

CREATE TABLE notificacion (
  id_notificacion SERIAL    PRIMARY KEY,
  mensaje         TEXT      NOT NULL,
  leida           BOOLEAN   DEFAULT FALSE,
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario  INT NOT NULL  REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE reporte (
  id_reporte       SERIAL       PRIMARY KEY,
  tipo             VARCHAR(100) NOT NULL,
  fecha_generacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  id_admin  INT NOT NULL  REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Usuario administrador por defecto
-- Teléfono: 00000000 | Contraseña: admin123
INSERT INTO usuario (nombre, telefono, tipo, contrasena, ubicacion)
VALUES (
  'Administrador AgroStore',
  '00000000',
  'Administrador',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'La Esperanza'
);