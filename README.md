# 🛍️ PrismaStore - E-commerce

Una aplicación e-commerce moderna desarrollada con **Next.js**, **TypeScript**, **Prisma** y **Tailwind CSS**. La aplicación incluye un panel de administración, gestión de productos, usuarios y pedidos.

---

## 📋 Tabla de Contenidos

- [Características Obligatorias Implementadas](#características-obligatorias-implementadas)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Entidades/Modelos](#entidadesmodelos)
- [APIs Desarrolladas](#apis-desarrolladas)
- [Instalación y Setup](#instalación-y-setup)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Rutas y Navegación](#rutas-y-navegación)

---

## ✅ Características Obligatorias Implementadas

### Frontend Personalizado
- Interfaz moderna con diseño responsivo usando **Tailwind CSS**
- Páginas dinámicas para cada sección de la aplicación
- Componentes reutilizables y bien estructurados
- Íconos profesionales con **Lucide React**

### Navbar/Sidebar
- Barra lateral de navegación con menú collapsible en móviles
- Navegación contextual (cambia según el rol del usuario)
- Botón de logout con cierre de sesión seguro
- Diseño responsivo que se adapta a diferentes pantallas

### Entidades/Modelos
- **User** - Gestión de usuarios y autenticación
- **Product** - Catálogo de productos
- **Order** - Pedidos de clientes
- Todas implementadas en Prisma con SQLite

### Relaciones entre Entidades
- **User ↔ Order** (1:N) - Un usuario puede tener múltiples pedidos
- **Product ↔ Order** (1:N) - Un producto puede estar en múltiples pedidos
- Cascada de eliminación configurada (onDelete: Cascade)

### APIs Desarrolladas
- **GET /api/products** - Obtener todos los productos
- **POST /api/products** - Crear nuevo producto (solo admin)
- **GET /api/orders** - Obtener pedidos (filtrados por usuario o todos si es admin)
- **POST /api/orders** - Crear nuevo pedido
- **GET /api/users** - Obtener usuarios (solo admin)
- **POST /api/register** - Registro de nuevos usuarios
- **POST /api/login** - Autenticación de usuarios

### API Dinámica con CRUD Completo
- **GET /api/orders/[id]** - Obtener pedido específico
- **PUT /api/orders/[id]** - Actualizar estado de pedido
- **DELETE /api/orders/[id]** - Eliminar pedido

## Estructura del Proyecto

```
ecommerce-app/
├── prisma/
│   ├── schema.prisma          # Esquema de la base de datos
│   ├── seed.js                # Script para poblar datos iniciales
│   └── migrations/            # Migraciones de BD
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout principal con Sidebar
│   │   ├── page.tsx           # Página de inicio
│   │   ├── api/
│   │   │   ├── auth/          # Rutas de autenticación
│   │   │   ├── products/      # CRUD de productos
│   │   │   ├── orders/        # CRUD de pedidos
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── login/         # Login
│   │   │   ├── logout/        # Logout
│   │   │   └── register/      # Registro
│   │   ├── products/
│   │   │   └── page.tsx       # Listado de productos
│   │   ├── orders/
│   │   │   ├── page.tsx       # Listado de pedidos
│   │   │   └── [id]/page.tsx  # Detalles de pedido
│   │   ├── users/
│   │   │   └── page.tsx       # Gestión de usuarios (admin)
│   │   ├── login/
│   │   │   └── page.tsx       # Página de login
│   │   └── register/
│   │       └── page.tsx       # Página de registro
│   │
│   ├── components/
│   │   ├── LogoutButton.tsx   # Botón de logout
│   │   ├── ProductCard.tsx    # Card de producto
│   │   ├── OrderActionsModal.tsx # Modal para acciones de pedido
│   │   └── Confirm.tsx        # Modal de confirmación
│   │
│   ├── hooks/
│   │   └── use-auth.ts        # Hook para autenticación
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Cliente de Prisma
│   │   ├── product-helpers.ts # Funciones auxiliares de productos
│   │   ├── fakestore-api.ts   # Integración con FakeStore API
│   │   └── auth/              # Funciones de autenticación
│   │
│   └── models/
│       └── auth.ts            # Tipos de autenticación
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── prisma.config.ts
```

## APIs Desarrolladas

### **Productos**

#### GET `/api/products` - Obtener todos los productos
- **Autenticación:** No requerida
- **Descripción:** Obtiene el listado de todos los productos. Si no hay productos, sincroniza automáticamente desde FakeStore API
- **Respuesta:**
  ```json
  [
    {
      "id": "cuid123",
      "name": "Producto 1",
      "description": "Descripción",
      "price": 99.99,
      "stock": 50,
      "imageUrl": "url",
      "createdAt": "2025-01-26T19:21:52Z"
    }
  ]
  ```

#### POST `/api/products` - Crear producto (SOLO ADMIN)
- **Autenticación:** JWT requerido (usuario debe ser ADMIN)
- **Body:**
  ```json
  {
    "name": "Nuevo Producto",
    "description": "Descripción",
    "price": 99.99,
    "stock": 50,
    "imageUrl": "url-opcional"
  }
  ```
- **Respuesta:** 201 Created con el producto creado

---

### **Pedidos**

#### GET `/api/orders` - Obtener pedidos
- **Autenticación:** JWT requerido
- **Descripción:** 
  - Si es ADMIN: obtiene todos los pedidos
  - Si es cliente: obtiene solo sus pedidos
- **Query params:** Ninguno
- **Respuesta:**
  ```json
  [
    {
      "id": "cuid123",
      "userId": "user-id",
      "productId": "product-id",
      "quantity": 2,
      "total": 199.98,
      "status": "PENDING",
      "createdAt": "2025-01-26T19:21:52Z",
      "user": { ... },
      "product": { ... }
    }
  ]
  ```

#### POST `/api/orders` - Crear pedido
- **Autenticación:** JWT requerido
- **Body:**
  ```json
  {
    "productId": "product-id",
    "quantity": 2
  }
  ```
- **Lógica:**
  - Valida que exista stock
  - Calcula el total (price × quantity)
  - Decrementa el stock del producto
  - Crea el pedido

#### **GET `/api/orders/[id]` - Obtener pedido específico** 🔄
- **Autenticación:** JWT requerido
- **Path params:** `id` - ID del pedido
- **Autorización:** El usuario solo puede ver sus propios pedidos (admins ven todos)
- **Respuesta:** Datos del pedido con relaciones incluidas

#### **PUT `/api/orders/[id]` - Actualizar pedido** 🔄
- **Autenticación:** JWT requerido
- **Path params:** `id` - ID del pedido
- **Body:**
  ```json
  {
    "quantity": 3,
    "status": "COMPLETED"
  }
  ```
- **Lógica:**
  - Solo ADMIN puede actualizar
  - Actualiza cantidad y/o estado
  - Recalcula el total si cambia la cantidad

#### **DELETE `/api/orders/[id]` - Eliminar pedido** 🔄
- **Autenticación:** JWT requerido
- **Path params:** `id` - ID del pedido
- **Autorización:** Usuario propietario o ADMIN
- **Lógica:**
  - Revierte el stock del producto
  - Elimina el pedido de la BD

---

### **Usuarios**

#### GET `/api/users` - Obtener usuarios (SOLO ADMIN)
- **Autenticación:** JWT requerido
- **Autorización:** Solo ADMIN
- **Respuesta:** Listado de todos los usuarios

#### POST `/api/register` - Registro de usuario
- **Autenticación:** No requerida
- **Body:**
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }
  ```
- **Lógica:**
  - Valida email único
  - Encripta contraseña con bcryptjs
  - Crea usuario con rol CUSTOMER por defecto

#### POST `/api/login` - Autenticación
- **Autenticación:** No requerida
- **Body:**
  ```json
  {
    "email": "usuario@example.com",
    "password": "password123"
  }
  ```
- **Respuesta:** JWT token en cookie segura
- **Lógica:**
  - Valida credenciales
  - Genera JWT token
  - Establece cookie de sesión

#### POST `/api/logout` - Cerrar sesión
- **Autenticación:** JWT requerido
- **Lógica:**
  - Elimina la cookie de sesión
  - Limpia datos de autenticación

#### GET `/api/auth/me` - Obtener usuario autenticado
- **Autenticación:** JWT requerido
- **Respuesta:** Datos del usuario actual

## Uso de la Aplicación

### **Credenciales de Prueba**

**Admin:**
```
Email: admin@example.com
Password: password123
```

**Cliente:**
```
Email: cliente@example.com
Password: password123
```

### **Flujo de Usuario**

#### **Cliente No Autenticado**
1. Accede a la página principal
2. Puede ver el catálogo de productos
3. Puede hacer clic en "Iniciar Sesión" o "Crear Cuenta"
4. Tras autenticarse, accede a:
   - Panel de mis pedidos
   - Carrito de compras
   - Perfil

#### **Cliente Autenticado**
1. Ver productos disponibles
2. Crear nuevo pedido (seleccionar producto y cantidad)
3. Ver mis pedidos
4. Ver detalles de pedido (estado, total, fecha)
5. Cancelar pedidos (si están en estado PENDING)

#### **Administrador**
1. Acceso completo a todas las secciones
2. Panel de usuarios:
   - Ver todos los usuarios registrados
   - Ver rol de cada usuario
   - Estadísticas de usuarios
3. Panel de productos:
   - Ver catálogo completo
   - Crear nuevos productos
   - Actualizar información
4. Panel de pedidos:
   - Ver todos los pedidos de todos los clientes
   - Actualizar estado de pedidos (PENDING → COMPLETED)
   - Eliminar pedidos

---

## 🗺️ Rutas y Navegación

### **Rutas Públicas**
- `/` - Página de inicio
- `/login` - Página de login
- `/register` - Página de registro
- `/products` - Catálogo de productos

### **Rutas Autenticadas (Cliente)**
- `/orders` - Mis pedidos
- `/orders/[id]` - Detalles de mi pedido
- `/api/auth/me` - Obtener datos actuales

### **Rutas Solo Admin**
- `/users` - Gestión de usuarios
- `/api/users` - Listar todos los usuarios

---

## Sistema de Autenticación

### **Flujo de Autenticación**
1. Usuario ingresa credenciales en `/login`
2. POST a `/api/login` con email y password
3. Servidor valida con bcryptjs
4. Si es válido, genera JWT token con jose
5. Token se guarda en cookie HttpOnly segura
6. Usuario es redirigido al dashboard

### **Protección de Rutas**
- Funciones `getCurrentUser()` y `isAdmin()` en middleware
- Validación de JWT en cada request
- Verificación de roles en APIs
- Redirecciones automáticas si no está autenticado

---

## 📊 Funcionalidades Adicionales

### **Sincronización de FakeStore API**
- Los productos se sincronizan automáticamente desde FakeStore API
- Solo ocurre si la BD está vacía
- Trae ~20 productos con sus descripciones e imágenes reales

### **Helpers de Productos**
El archivo `src/lib/product-helpers.ts` proporciona funciones auxiliares:
- Calcular totales con descuentos por cantidad
- Formatear precios con localización
- Filtrar y ordenar productos
- Estadísticas de carrito

### **Componentes Reutilizables**
- `ProductCard` - Card con información de producto
- `OrderActionsModal` - Modal para actualizar pedidos
- `LogoutButton` - Botón de logout seguro
- `Confirm` - Modal de confirmación
# Nextjs
# Nextjs
# Nextjs
# E-commerce-nextjs
