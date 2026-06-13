# 🚀 Proyecto Final - Programación Backend II

## 🧑‍💻 Autor

**Alejandro Pourcel**

---

## 📌 Descripción del Proyecto

Este proyecto corresponde a la entrega final de **Programación Backend II - Coderhouse**.

El objetivo fue profesionalizar el servidor ecommerce desarrollado durante el curso, incorporando autenticación, autorización por roles, patrón Repository, DAOs, DTOs, recuperación de contraseña por email, lógica de compra con tickets y una arquitectura más ordenada y escalable.

El proyecto utiliza **Node.js**, **Express**, **MongoDB Atlas**, **Mongoose**, **Passport**, **JWT**, **Nodemailer**, **Handlebars** y **Socket.io**.

---

## 🛠️ Tecnologías Utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Mongoose Paginate
- Passport
- Passport JWT
- JSON Web Token
- Bcrypt
- Nodemailer
- Cookie Parser
- Dotenv
- Express Handlebars
- Socket.io

---

## 📁 Estructura del Proyecto

```bash
src/
│
├── app.js
├── utils.js
│
├── config/
│   ├── mailer.config.js
│   └── passport.config.js
│
├── dao/
│   ├── Cart.dao.js
│   ├── Product.dao.js
│   ├── Ticket.dao.js
│   └── User.dao.js
│
├── dto/
│   └── UserCurrent.dto.js
│
├── managers/
│   ├── CartManager.js
│   └── ProductManager.js
│
├── middlewares/
│   └── authorization.middleware.js
│
├── models/
│   ├── Cart.model.js
│   ├── Product.model.js
│   ├── Ticket.model.js
│   └── User.model.js
│
├── repositories/
│   ├── Cart.repository.js
│   ├── Product.repository.js
│   ├── Ticket.repository.js
│   └── User.repository.js
│
├── routes/
│   ├── carts.router.js
│   ├── products.router.js
│   ├── sessions.router.js
│   └── views.router.js
│
├── public/
│   ├── css/
│   └── js/
│
└── views/
    ├── layouts/
    ├── cartDetail.handlebars
    ├── home.handlebars
    ├── productDetail.handlebars
    ├── products.handlebars
    └── realTimeProducts.handlebars
```

---

## 🧱 Arquitectura Aplicada

El proyecto fue organizado separando responsabilidades en distintas capas:

- **Models:** esquemas de MongoDB.
- **DAO:** acceso directo a la base de datos.
- **Repositories:** capa intermedia entre la lógica de negocio y la persistencia.
- **Managers:** lógica principal de productos y carritos.
- **DTO:** control de datos expuestos al cliente.
- **Middlewares:** control de autorización por roles.
- **Routes:** definición de endpoints.
- **Config:** configuración de Passport y Nodemailer.

---

## 📦 Patrón Repository

Se implementó el patrón Repository para desacoplar la lógica de negocio del acceso directo a MongoDB.

Repositories implementados:

- `ProductRepository`
- `CartRepository`
- `UserRepository`
- `TicketRepository`

DAOs implementados:

- `ProductDAO`
- `CartDAO`
- `UserDAO`
- `TicketDAO`

---

## 🔐 Autenticación y Sesiones

El sistema utiliza autenticación mediante **JWT** y **Passport JWT**.

Al iniciar sesión, el servidor genera un token JWT y lo guarda en una cookie llamada:

```txt
jwtCookieToken
```

La estrategia `current` valida al usuario autenticado mediante Passport.

---

## 👤 Modelo de Usuario

El modelo `User` incluye:

```js
first_name;
last_name;
email;
age;
password;
cart;
role;
```

La contraseña se almacena encriptada utilizando `bcrypt`.

El campo `role` tiene por defecto el valor:

```txt
user
```

---

## 📄 DTO en Current

La ruta:

```http
GET /api/sessions/current
```

devuelve un DTO para evitar exponer información sensible.

Respuesta esperada:

```json
{
  "status": "success",
  "payload": {
    "name": "Alejandro Pourcel",
    "email": "usuario@email.com",
    "age": 22,
    "role": "user",
    "cart": "cartId"
  }
}
```

No se expone la contraseña ni datos internos innecesarios.

---

## 🛡️ Autorización por Roles

Se implementó un middleware de autorización que limita el acceso según el rol del usuario.

### Rol admin

Puede:

- Crear productos
- Actualizar productos
- Eliminar productos

### Rol user

Puede:

- Agregar productos a su carrito
- Realizar compras

---

## 🔑 Recuperación de Contraseña

Se implementó un sistema de recuperación de contraseña con **Nodemailer**.

Flujo:

1. El usuario solicita recuperación de contraseña.
2. El servidor genera un token JWT temporal.
3. Se envía un correo con un enlace de recuperación.
4. El enlace expira luego de 1 hora.
5. El usuario puede establecer una nueva contraseña.
6. El sistema impide reutilizar la contraseña anterior.

Endpoints utilizados:

```http
POST /api/sessions/forgot-password
POST /api/sessions/reset-password/:token
```

---

## 🎟️ Sistema de Tickets

Se creó el modelo `Ticket` con los siguientes campos:

```js
code;
purchase_datetime;
amount;
purchaser;
```

El ticket se genera al finalizar una compra correctamente.

---

## 🛒 Lógica de Compra

Endpoint:

```http
POST /api/carts/:cid/purchase
```

Funcionamiento:

- Recorre los productos del carrito.
- Verifica stock disponible.
- Compra solo los productos con stock suficiente.
- Descuenta stock automáticamente.
- Genera un ticket con el monto total.
- Mantiene en el carrito los productos que no pudieron comprarse.

---

## 📦 Productos

El sistema permite consultar productos con paginación, filtros y ordenamiento.

### Endpoints

```http
GET    /api/products
GET    /api/products/:pid
POST   /api/products
PUT    /api/products/:pid
DELETE /api/products/:pid
```

### Query Params

```txt
limit
page
sort=asc | desc
query
```

Ejemplo:

```http
GET /api/products?limit=10&page=1&sort=asc&query=cerveza
```

---

## 🛒 Carritos

### Endpoints

```http
POST   /api/carts
GET    /api/carts/:cid
POST   /api/carts/:cid/product/:pid
PUT    /api/carts/:cid
PUT    /api/carts/:cid/products/:pid
DELETE /api/carts/:cid/products/:pid
DELETE /api/carts/:cid
POST   /api/carts/:cid/purchase
```

El carrito utiliza `populate` para mostrar la información completa de los productos asociados.

---

## 🔐 Sessions

### Endpoints

```http
POST /api/sessions/register
POST /api/sessions/login
GET  /api/sessions/current
POST /api/sessions/forgot-password
POST /api/sessions/reset-password/:token
```

---

## 🖥️ Vistas

El proyecto conserva vistas con Handlebars:

```http
GET /
GET /realtimeproducts
GET /products
GET /products/:pid
GET /carts/:cid
```

Incluye:

- listado de productos
- vista en tiempo real
- detalle de producto
- detalle de carrito
- botón para agregar producto al carrito

---

## ⚡ WebSockets

Se utiliza Socket.io para actualizar productos en tiempo real.

Funcionalidades:

- Crear productos desde la vista realtime.
- Eliminar productos desde la vista realtime.
- Actualizar automáticamente el listado en pantalla.

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
MONGO_URL=tu_uri_de_mongodb_atlas
JWT_SECRET=tu_clave_secreta_jwt
GMAIL_USER=tu_correo_gmail
GMAIL_PASS=tu_contraseña_de_aplicacion_gmail
FRONT_URL=http://localhost:8080
```

> Importante: no se deben compartir credenciales reales públicamente.

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/ale1417/Trabajo-final-backend2-POURCEL-ALEJANDRO.git
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear el archivo `.env` con las variables indicadas anteriormente.

### 4. Ejecutar el servidor

```bash
npm run dev
```

Servidor disponible en:

```txt
http://localhost:8080
```

---

## ✅ Funcionalidades Implementadas

- CRUD de productos
- CRUD de carritos
- MongoDB Atlas
- Mongoose
- Paginación de productos
- Filtros y ordenamiento
- Autenticación con JWT
- Passport JWT
- DTO para `/current`
- Bcrypt para contraseñas
- Roles `admin` y `user`
- Middleware de autorización
- DAO
- Repository Pattern
- Recuperación de contraseña por email
- Token de recuperación con expiración de 1 hora
- Validación para no reutilizar la contraseña anterior
- Modelo Ticket
- Endpoint de compra
- Verificación de stock
- Descuento automático de stock
- Compra parcial
- WebSockets
- Vistas con Handlebars

---

## 🧪 Pruebas Realizadas

Se probaron los siguientes flujos principales:

- Registro de usuario
- Login
- Current con DTO
- Creación de productos como admin
- Bloqueo de creación de productos para user
- Agregado de productos al carrito como user
- Compra de carrito
- Generación de ticket
- Descuento de stock
- Recuperación de contraseña por email
- Reset de contraseña
- Bloqueo de reutilización de contraseña anterior

---

## 🎯 Conclusión

Este proyecto integra los principales conceptos vistos en Programación Backend II, aplicando una arquitectura más profesional, autenticación segura, autorización por roles, patrón Repository, DTOs, recuperación de contraseña por correo electrónico y lógica de compra con generación de tickets.

---

## 🙌 Autor

**Alejandro Pourcel**

Proyecto Final - Programación Backend II
Coderhouse
