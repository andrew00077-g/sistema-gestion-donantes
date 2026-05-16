# Sistema Digital de Gestion de Donantes de Sangre

Este proyecto de grado representa una solucion tecnologica diseñada para el Banco de Sangre de Referencia Departamental de Cochabamba, orientada a la optimizacion de la gestion y captacion de donantes.

## Arquitectura del Sistema

El sistema implementa una Arquitectura Cliente-Servidor estructurada en tres capas independientes, lo que garantiza escalabilidad y facilidad de mantenimiento.

1. Capa de Presentacion: Desarrollada con React.js para el panel administrativo web, proporcionando una interfaz de usuario reactiva y eficiente.
2. Capa de Logica de Negocio: Implementada mediante una API RESTful utilizando Node.js y Express.js. Esta capa gestiona las peticiones del cliente, aplica las reglas de negocio y asegura la integridad de las transacciones.
3. Capa de Datos: Utiliza el sistema de gestion de bases de datos relacionales MySQL para el almacenamiento persistente y seguro de la informacion.

## Tecnologias y Herramientas

### Frontend
- Biblioteca principal: React.js
- Herramienta de construccion: Vite
- Estilos y Estructura: Bootstrap 5
- Iconografia tecnica: Lucide React

### Backend
- Entorno de ejecucion: Node.js
- Framework: Express.js
- Gestion de Base de Datos: MySQL2 con soporte de Pool de conexiones
- Seguridad y Variables: Bcrypt.js, JSON Web Token (JWT) y Dotenv

### Base de Datos
- Motor: MySQL 8.0

## Estructura del Repositorio

La carpeta raiz contiene los dos componentes principales del sistema:
- /backend-gestion-donantes: Codigo fuente de la API y configuraciones del servidor.
- /frontend-web-gestion: Codigo fuente de la interfaz administrativa web.

## Requisitos para Ejecucion en Desarrollo

### Configuracion del Backend
1. Acceder al directorio backend-gestion-donantes.
2. Ejecutar npm install para instalar dependencias.
3. Configurar el archivo .env con las credenciales de la base de datos.
4. Ejecutar node index.js para iniciar el servicio.

### Configuracion del Frontend
1. Acceder al directorio frontend-web-gestion.
2. Ejecutar npm install.
3. Ejecutar npm run dev para iniciar el servidor de desarrollo.
