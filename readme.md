# Casa Vitini App


### Caracteristícas globales

- Muestra imagenes para el publico de las instalaciones;
- Permite hacer reservas a futuros clientes;
- Permite a clientes administrar sus reservas desde su VitiniID;
- Permite a administradores y empleados gestionar un sistema de reservas desde su VitiniID;
- Panel de administracion para administradores:

### Panel de administración

- Ver reservas hechas por clientes, aceptarlas o rechazarlas;
- Calendario global por capas;
- Crear reservas desde el panel de administracion;
- Modificar, eliminar reservas realizadas;
- Realizar checkin, checkout, gestion de pernoctantes en habitaciones;
- Gestion de bloqueos de apartamentos;
- Configuracion de la arquitectura del alojamiento;
- Buscador de reservas por texto o distintos tipos de rangos de fechas;
- Gestion de clientes: Buscador de clientes, editor de fichas de clientes;
- Gestion de usaurios: Buscador de usuarios, editor de cuentas de usuarios;
- Tres tipos de roles de cuentas de usuario: Administrador, Empleado y Cliente;
- Gestion de enlaces de pago;
- Gestion de precios: Establecer un precio neto, simulador de precio final y desglose de impuestos;
- Gestion de Impuestops: Establecer impuesto por tasa o portentaje;
- Gestion de Ofertas: Ofertas basadas en perfiles combinables: Por número de apartamentos, Por apartametnos específicos, por días de antelación, por días de reserva y por rango de fechas de la reserva ;
- Gestion de comportamiento de precios: Variaciones de los precios netos constantes en base a eventos o circunstancias determinadas; 
- Gestion de la zona horaria local;
- Gestion de calendarios importados para evitar overbooking: Calendarios ICAL compatibles con AirBnb;
- Gestion de la hora de entrada y salida;
- Gestion de los limistes de una reserva publica: Por ejemplo se puede determinar que una reserva hecah por un cliente con o sin VitiniID, no pueda ser anterio a X dias de antelacion. Que no pueda teenr un maximo de X dias de duracion y que no pueda empezar mas alla de X dia desde el dia de doy en el futuro.;
- Gestion de mensajes simple en portada;
- Gestion centralizada de interruptores para funciones de acceso rapido;

### Como implementar este proyecto

Si quieres probar la aplicacion, aqui tienes dos enfoques. Tambien tienes que rellenar el archivo de variables de entorno. Tiene un archivo sql con la estructura de la base de datos vacia con un usuario administrador llamado admin y clave tambien admin, para poder acceder al panel de administracion.

#### Con Docker
1. Instala docker y docker compose
2. Ejecuta el script de docker compose
3. `http://localhost:3000`

#### Con Visual Studio Code

1. Instala node y postgres
2. Abre el archivo .workspace con Visutal Studio Code
3. Dirigete a Scripts de NPM

#### Con node

1. Instala node y postgres
2. Ejecuta node `node casavitini.mjs`
3. `http://localhost:3000`


### Anotaciones sobre la idiosincracia del proyecto
#### Esto ha sido un proyecto profesional en el cual he trabajo como desarrolador con otros mienbros del equipo de Casa Vitini para realizar una aplicacion diseñada para la gestion de la actividad de la Empresa. Debido a que he tedio que desarrollar una arquitectura global para el proyecto, quiero indicar una serie de punto:

- Soy consciente que usar funciones flecha impide usar la palabra clave this, por que en este contexto, la funcion flecha no respeta el contexto de ejecucion y this, dentro de una funcion flecha hace referencia al contexto mas alto, al objeto global en vez de su contexto local de ejecucion. La razon por la que uso tanto este tipo de funcion es por que me parece muy declarativa y si necesito usar this dentro de una funcion dentro de un objeto, pues entonces uso una funcion anonima, sino prefiero usar la funcion flecha.

- A mi me gustan la jerarquia de objetos aninados. Por eso tanto en el Frontend como en el Backend hay dos objetos masivos. En mi forma de desarrolar, esto me ayuda a establecer una piramide logica. Entiendo que a otros desarrolladores esto les puede parecer mal. Entiendo que hubiese sido mejor usar un sistema basado en abstracion y archivos externos para declarar esta jerarquia con el sistema de archivos pero de momento el proyecto no es lo suficientemente grande. Aunque en el futuro si este proyecto se hace mas grande entiendo que usar ya objetos supermasivos ya es un poco locura.

- Cuando necesito un componente accesible desde cualquier parte, aqui si he usado la abstracion por que permite acceder al componentes desde cualquier contexto. Estoy mas acostumbrado a la abstracion basada en modulos ECMASCRIPT ESM en vez de modulos por interfaces que tambien tiene muchas cosas buenas. 

- En JS es una buena practiva usar constantes si los valores no cambian a los largo de la ejecucion y por hacer un codigo mas robusco entre otros aspectos. Segun el consenso no escrito, las constantes se escriben en mayuscula, pero prefiero escribirlas en camellcase por que me parecen mas legibles. Entiendo que tampoco es mucho problema por que en js las constantes tienen la palabra reservada const delante y son facilmente distingibles. Aparte en ciertos IDES las marcan con colores propios.

- Considero que el proyecto al no se tan grande no es necesario al menos de momento usar una arquitectura basada en capas, como patrones de arquitecturas limpias. Pero es algo en lo que soy consciente y si es necesario se aplicara en el futuro.