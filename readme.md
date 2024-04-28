# Casa Vitini App 
 
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
  

#### Implementación rápida en local para desarrollo 
Si quieres probar la aplicación, aquí tienes dos enfoques. También tienes que rellenar el archivo de variables de entorno. Tiene un archivo SQL con la estructura de la base de datos vacía con un usuario administrador llamado adminy clave también admin, para poder acceder al panel de administración. 

1. Instala node y postgres en tu sistema.
2. Importa la base de datos vacía de ejemplo en tu servidor postgres, el archivo está en ejemplos/basededatosvacia.sql 
3. Configura la conexión con la base de datos en: componentes/db.mjs 
4. Escribe los datos de conexión en el archivo de variables de entorno de ejemplo, define también el entorno en el archivo de variables de entorno. En el archivo db.mjs tengo dos configuraciones para producción y dev. El Docker lo uso en producción y el dev en local. 
5. `node casavitini.mjs` o abre el archivo .workspace con Visual Studio Code y desde scripts de NPM` 

 
### Anotaciones sobre la idiosincrasia del proyecto 
#### Esto ha sido un proyecto profesional en el cual he trabajo como desarrollador con otros miembros del equipo de Casa Vitini para realizar una aplicación diseñada para la gestión de la actividad de la Empresa. Debido a que he tedio que desarrollar una arquitectura global para el proyecto, quiero indicar una serie de punto: 
 
- Soy consciente que usar funciones flecha impide usar la palabra clave this, porque en este contexto, la función flecha no respeta el contexto de ejecución y this, dentro de una función flecha hace referencia al contexto más alto, al objeto global en vez de su contexto local de ejecución. La razón por la que uso tanto este tipo de función es porque me parece muy declarativa y si necesito usar this dentro de una función dentro de un objeto, pues entonces uso una función anónima, sino prefiero usar la función flecha. 
 
- A mí me gustan la jerarquía de objetos aninados. Por eso tanto en el Frontend como en el Backend hay dos objetos masivos. En mi forma de desarrollar, esto me ayuda a establecer una pirámide lógica. Entiendo que a otros desarrolladores esto les puede parecer mal. Entiendo que hubiese sido mejor usar un sistema basado en abstracción y archivos externos para declarar esta jerarquía con el sistema de archivos, pero de momento el proyecto no es lo suficientemente grande. Aunque en el futuro si este proyecto se hace más grande entiendo que usar ya objetos supermasivos ya es un poco locura. 
 
- Cuando necesito un componente accesible desde cualquier parte, aquí sí he usado la abstracción por que permite acceder a los componentes desde cualquier contexto. Estoy más acostumbrado a la abstracción basada en módulos ECMASCRIPT ESM en vez de módulos por interfaces que también tiene muchas cosas buenas.  
 
- En JS es una buena práctica usar constantes si los valores no cambian a lo largo de la ejecución y por hacer un código más robusto entre otros aspectos. Según el consenso no escrito, las constantes se escriben en mayúscula, pero prefiero escribirlas en camellcase porque me parecen más legibles. Entiendo que tampoco es mucho problema porque en js las constantes tienen la palabra reservada const delante y son fácilmente distinguibles. Aparte en ciertos IDES las marcan con colores propios. 
 
- Considero que el proyecto al no ser tan grande no es necesario al menos de momento usar una arquitectura basada en capas, como patrones de arquitecturas limpias. Pero es algo en lo que soy consciente y si es necesario se aplicara en el futuro. 
 