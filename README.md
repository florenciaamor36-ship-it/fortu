# 🎰 La Clave Argentina Casinos - Plataforma Oficial & Guía de Despliegue Autónomo

Plataforma integral de casino online argentino con arquitectura Full-Stack (**React 19 + TypeScript + Vite + Express + Tailwind CSS**), Red Maestra de Sub-Páneles de Cajeros con URL propia, Sistema de Recupero de Fichas en Tiempo Real y Soporte Dual Database.

Este documento está optimizado para ser leído por **agentes de despliegue autónomo**, sistemas CI/CD y administradores de sistemas.

---

## 🏛️ 1. Arquitectura de Enrutamiento y Separación de Paneles

Para garantizar máxima seguridad y privacidad, la plataforma opera con **estricta separación de accesos**:

1. **Plataforma del Jugador (`https://tu-casino.com/`)**:
   - Acceso exclusivo al lobby del casino, tragamonedas (Slots), ruletas europeas, blackjack, baccarat y gestión de perfil personal.
   - **Cero exposición**: Los jugadores **nunca** visualizan botones de administración ni accesos a cajeros a menos que ingresen por el enlace específico de su agencia.

2. **Panel General de Administración (`https://tu-casino.com/?panel=admin`)**:
   - Panel maestro para el Super Administrador (Bóveda Central).
   - Control total de emisión de fichas, creación de cajeros, fondeo ilimitado, RTP de juegos y métricas globales. Requiere autenticación de Administrador.

3. **Sub-Páneles Dedicados de Cajeros (`https://tu-casino.com/?cajero=slug_agencia`)**:
   - Cada cajero/agencia posee su enlace único generado automáticamente (ej. `/?cajero=agencia-norte`).
   - Muestra el banner oficial del punto de carga con los datos del operador, alias de cobro (MP/CBU) y acceso exclusivo al sub-panel de cargas, retiros con recupero y alta de jugadores.

---

## ⚡ 2. Estrategia para Maximizar el Rendimiento Gratuito (Costo $0 Inicial)

Diseñado para exprimir al máximo las capas gratuitas (Render, Railway, Cloud Run, Fly.io, Vercel/Netlify con backend externo o Firebase Spark) antes de migrar a una VPS 4x4:
- **Caché en Memoria de Alta Velocidad**: El servidor backend almacena en memoria los estados de usuarios y saldos para responder en `<2ms` sin saturar la base de datos externa.
- **Renderizado del Lado del Cliente (Client-Side Rendering)**: Las animaciones de slots, ruletas y efectos de audio se ejecutan en el navegador del jugador, descargando totalmente el procesador del servidor backend.
- **Doble Persistencia (Dual Database Ready)**: Conecta tus bases gratuitas de Firebase o Supabase mediante `.env` para respaldar transacciones financieras críticas.

---

## 🎮 3. Guía para Crear y Agregar Nuevos Juegos (Estructura, Assets y Librerías)

Para crear o añadir nuevos juegos de casino en el repositorio de manera modular:

### Estructura de Carpetas recomendada:
```text
/src/
  ├── components/
  │     └── games/
  │           ├── GatesOfOlympus.tsx
  │           ├── RuletaEuropea.tsx
  │           └── TuNuevoJuego.tsx
  └── data/
        └── games.ts  <-- Registro maestro de juegos, RTP y volatilidad
```

### Bibliotecas y Herramientas Autorizadas para Juegos:
- **Iconos e Interfaz**: `lucide-react` para botones, fichas, menús y controles.
- **Gráficos y Animaciones**: `motion/react` para transiciones fluidas, giros de rodillos y efectos de victoria.
- **Sonidos y Efectos (Audio)**: Utilizar la API nativa de JavaScript **Web Audio API** (sintetizadores de tonos para giros, monedas y premios) para evitar dependencias pesadas o archivos externos rotos.
- **Generador de Números Aleatorios (RNG)**: Usar `crypto.getRandomValues()` en el cliente y servidor para garantizar imparcialidad y certificación de RTP.

---

## 🗄️ 4. Arquitectura de Backend, Bases de Datos y Matriz de Concurrencia

### Tipos de Concurrencia Soportados por Infraestructura:

| Nivel de Infraestructura | Bases de Datos & Backend | Jugadores Simultáneos | Cajeros Activos | Apuestas por Segundo | Costo Mensual Aprox. |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fase 1: Capa Gratuita ($0)** | Node.js Monolito + Archivo Local / Firebase Spark Free | **1,500 - 3,000** | **50 - 100** | **200 - 400 req/s** | **$0 USD** |
| **Fase 2: VPS Mediana ($10)** | 1 VPS 2vCPU/4GB RAM + PostgreSQL / Supabase | **10,000 - 25,000** | **500 - 1,000** | **2,000 req/s** | **$10 - $15 USD** |
| **Fase 3: VPS 4x4 & Cluster ($50)** | VPS 4vCPU/4GB RAM + Redis Local Cache + Postgres Réplicas | **100,000 - 250,000** | **5,000+** | **15,000 req/s** | **$40 - $60 USD** |
| **Fase 4: Enterprise (1M+ Jugadores)** | Kubernetes Cluster (10+ Nodos App) + Redis Cluster + Postgres Sharded | **1,000,000+** | **50,000+** | **100,000+ req/s** | **$500+ USD** |

---

## 🎨 4. Universal Game Studio & AI Asset Forge (Multijuego)

La plataforma incluye un **Estudio de Creación y Procesamiento Universal** accesible desde el Panel de Administración (`/?panel=admin` -> pestaña `🎨 Game Studio & AI Forge`), compatible con **todos los juegos de casino** (Slots, Ruleta, Blackjack, Crash, Baccarat, Dados y Plinko):

1. **Recortador y Extractor de Fondos (Imágenes y Símbolos)**:
   - Permite ajustar el área de recorte (ancho, alto, offset) y remover fondos sólidos con umbrales de tolerancia configurables.
   - Adaptación automática de símbolos, cartas, fichas o elementos visuales al motor del juego seleccionado.
2. **Trimmer y Transcodificador de Videos y Animaciones**:
   - Recorte por marcas de tiempo (inicio y fin en segundos) de animaciones de victoria o eventos especiales generados por IA.
   - Conversión a WebM con canal alfa transparente o Sprite Sheets para garantizar 60 FPS sin fondos negros.
3. **Trimmer de Audio y Sintetizador (Web Audio API)**:
   - Recorte temporal de efectos de sonido (giro, reparto de cartas, caída de fichas, fanfarrias de premios) y control de volumen y bucles.
4. **Sandbox Multijuego en Vivo (Demo Testbed)**:
   - Simuladores interactivos específicos para cada categoría de juego (Tragamonedas, Ruleta, Blackjack, Crash Aviator) para probar los assets en tiempo real con saldo demo antes de desplegarlos.

---

## 🚀 5. Instrucciones de Despliegue para Agentes Autónomos y CI/CD

### Prerrequisitos del Sistema
- **Node.js**: v18.0.0 o superior (Recomendado v20+ LTS)
- **npm**: v9 o superior (o pnpm / yarn)
- **Git**

### Pasos de Instalación y Ejecución Local / Producción

```bash
# 1. Clonar repositorio
git clone https://github.com/TU-USUARIO/la-clave-argentina-casinos.git
cd la-clave-argentina-casinos

# 2. Instalar dependencias del monorepo
npm install

# 3. Configurar entorno
cp .env.example .env

# 4. Compilar aplicación (Frontend + Backend Bundled CJS)
npm run build

# 5. Iniciar servidor en producción
npm start
```

### Comandos de Scripts en `package.json` para el Agente:
- `npm run dev`: Inicia el servidor backend y Vite en modo desarrollo (`server.ts` con `tsx` en puerto 3000).
- `npm run build`: Ejecuta `vite build` y empaqueta el servidor backend en `dist/server.cjs` usando `esbuild`.
- `npm start`: Inicia el servidor compilado (`node dist/server.cjs`).

---

## 🔑 6. Cuentas demo

Las credenciales se deben configurar únicamente en un entorno local o de prueba. No usar estas cuentas en producción ni guardar contraseñas en el repositorio.

## 📈 7. Plan de Escalabilidad Futura: Migración a VPS 4x4

Cuando el casino genere ingresos y deba soportar alta concurrencia masiva:
1. **Infraestructura Sugerida**: VPS 4 vCPU / 4 GB RAM (Hetzner, DigitalOcean, Contabo o AWS EC2 t4g.xlarge).
2. **Dockerización**: El repositorio incluye un `Dockerfile` optimizado para contenedores Alpine.
   ```bash
   docker build -t casino-argentina .
   docker run -p 3000:3000 --env-file .env casino-argentina
   ```
3. **Escalado Horizontal y Redis**: Para más de 50.000 jugadores concurrentes, desacoplar la sesión con **Redis Cluster** y balancear múltiples instancias con **Nginx / HAProxy**.



