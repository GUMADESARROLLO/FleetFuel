# FleetFuel

**Control total de tu flota, en la palma de tu mano.**

FleetFuel es una PWA (Progressive Web App) mobile-first diseñada para registrar, controlar y monitorear el consumo de combustible de flotas vehiculares. Construida con Astro, React y Tailwind CSS, funciona offline con sincronización automática a MySQL cuando hay conexión.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro](https://astro.build) 6.3 (SSR) |
| UI | [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) v4 |
| Base de datos | MySQL 8.0 vía [mysql2](https://github.com/sidorares/node-mysql2) |
| Almacenamiento offline | IndexedDB |
| PWA | [@vite-pwa/astro](https://vite-pwa-org.netlify.app) (Workbox) |
| Fechas | [date-fns](https://date-fns.org) 4 + [react-datepicker](https://reactdatepicker.com) |
| Lenguaje | TypeScript |

## Funcionalidades

### Para conductores
- Registro de cargas de combustible con wizard guiado (4 pasos)
- Captura de fotos desde la cámara del dispositivo (odómetro antes/después, factura, voucher)
- Cálculo automático de litros vs importe
- Historial de reportes con búsqueda y filtros
- Sincronización offline → MySQL cuando hay conexión

### Para administradores
- Dashboard con métricas globales (registros, litros, importe, conductores activos)
- Filtros por rango de fechas y conductor
- Desglose por conductor
- Tabla completa de todos los registros
- **CRUD de usuarios**: crear, editar y eliminar conductores/administradores

## Tema visual

- **Dark industrial**: fondo `#0F1117`, superficies `#1A1D24`, texto `#E8E8E8`
- **Acentos**: morado `#2B013E`, naranja `#E87200`
- **Moneda**: Córdobas nicaragüenses (`C$`, locale `es-NI`, currency `NIO`)

## Estructura del proyecto

```
src/
├── components/      # Componentes React (LoginForm, AdminDashboard, etc.)
├── db/              # Migraciones SQL, seed, migrador
├── layouts/         # Layout Astro (AppLayout)
├── lib/             # Lógica compartida (auth, API client, storage, tipos)
├── pages/           # Rutas (páginas .astro y API endpoints)
│   └── api/         # Endpoints REST (/auth/login, /registros, /usuarios)
└── styles/          # CSS global y overrides
```

## Requisitos

- Node.js >= 22.12.0
- Docker y Docker Compose (para producción)
- MySQL 8.0 (para desarrollo local)

## Inicio rápido (desarrollo local)

```bash
# Instalar dependencias
npm install

# Inicializar base de datos (migraciones + seed de usuarios)
npm run db:init

# Iniciar servidor de desarrollo
npm run dev
```

## Producción con Docker

```bash
# Clonar y entrar al proyecto
git clone <repo> fleetfuel
cd fleetfuel

# Iniciar todos los servicios (app, db, phpmyadmin)
docker compose up -d

# La app estará disponible en http://localhost:8188
# phpMyAdmin en http://localhost:82

# Ver logs
docker compose logs -f app

# Detener servicios
docker compose down

# Detener y eliminar datos de la base de datos
docker compose down -v
```

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `app` | `8188` | FleetFuel (Astro SSR en producción) |
| `db` | `3307` | MySQL 8.0 |
| `phpmyadmin` | `82` | Administrador de base de datos |

La base de datos se inicializa automáticamente en el primer inicio (esquema + usuarios por defecto).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza build de producción |
| `npm run check` | Type-checking con Astro |
| `npm run db:migrate` | Ejecuta migraciones pendientes |
| `npm run db:seed` | Puebla usuarios iniciales |
| `npm run db:init` | Migra + seed |

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Autenticación de usuarios |
| GET | `/api/registros` | Lista registros (filtros: userId, desde, hasta) |
| POST | `/api/registros` | Crea un registro |
| PUT | `/api/registros` | Actualiza sincronización |
| GET | `/api/registros/[id]` | Detalle de un registro |
| GET | `/api/usuarios` | Lista todos los usuarios |
| POST | `/api/usuarios` | Crea un usuario |
| PUT | `/api/usuarios` | Actualiza un usuario |
| DELETE | `/api/usuarios` | Elimina un usuario |

## Usuarios por defecto (seed)

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin2024` | Administrador |
| `conductor1` | `flota2024` | Conductor |
| `conductor2` | `flota2024` | Conductor |

## Licencia

Privado — uso interno.
