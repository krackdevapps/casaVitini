# Casa Vitini App

Aplicación de gestión de reservas

### Características globales

- Muestra imágenes para el público de las instalaciones;
- Permite hacer reservas a futuros clientes;
- Permite a clientes administrar sus reservas desde su VitiniID;
- Permite a administradores y empleados gestionar un sistema de reservas desde su VitiniID;
- Panel de administración para administradores:

### Panel de administración

- Ver reservas hechas por clientes, aceptarlas o rechazarlas;
- Calendario global por capas;
- Crear reservas desde el panel de administración;
- Modificar, eliminar reservas realizadas;
- Realizar checkin, checkout, gestión de pernoctantes en habitaciones;
- Gestión de bloqueos de apartamentos;
- Configuración de la arquitectura del alojamiento;
- Buscador de reservas por texto o distintos tipos de rangos de fechas;
- Gestión de clientes: Buscador de clientes, editor de fichas de clientes;
- Gestión de usuarios: Buscador de usuarios, editor de cuentas de usuarios;
- Tres tipos de roles de cuentas de usuario: Administrador, Empleado y Cliente;
- Gestión de enlaces de pago;
- Gestión de precios: Establecer un precio neto, simulador de precio final y desglose de impuestos;
- Gestión de Impuestos: Establecer impuesto por tasa o porcentaje;
- Gestión de Ofertas: Ofertas basadas en perfiles combinables: Por número de apartamentos, Por apartamentos específicos, por días de antelación, por días de reserva y por rango de fechas de la reserva;
- Gestión de comportamiento de precios: Variaciones de los precios netos constantes en base a eventos o circunstancias determinadas;
- Gestión de la zona horaria local;
- Gestión de calendarios importados para evitar overbooking: Calendarios ICAL compatibles con Airbnb;
- Gestión de la hora de entrada y salida;
- Gestión de los limistes de una reserva publica: Por ejemplo, se puede determinar que una reserva hecha por un cliente con o sin VitiniID, no pueda ser anterior a X días de antelación. Que no pueda tener un máximo de X días de duración y que no pueda empezar mas allá de X día desde el día de doy en el futuro.;
- Gestión de mensajes simple en portada;
- Gestión centralizada de interruptores para funciones de acceso rápido;

### Implementación en local para desarrollo

Si quieres probar la aplicación rellena el archivo de variables de entorno. Tiene un archivo SQL con la estructura de la base de datos vacía con un usuario administrador llamado `admin` y clave es `admin`, para poder acceder al panel de administración.

1. Instala node y postgres en tu sistema.
2. Importa la base de datos vacía de ejemplo en tu servidor postgres, el archivo está en ejemplos/basededatosvacia.sql
3. Configura la conexión con la base de datos en: src/infraestructure/repository/globales/db.mjs 
4. Escribe los datos de conexión en el archivo de variables de entorno de ejemplo, define también el entorno en el archivo de variables de entorno, el entorno puede ser `nativo` o `docker`. En el archivo db.mjs tengo dos configuraciones para producción y dev. El Docker lo uso en producción y el dev en local.
5. `node casavitini.mjs` o abre el archivo .workspace con Visual Studio Code y desde ejecutalo desde los scripts de NPM

