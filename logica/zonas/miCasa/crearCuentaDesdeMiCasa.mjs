
export const crearCuentaDesdeMiCasa = async (entrada, salida) => {
    try {
        let usuarioIDX = entrada.body.usuarioIDX;
        let email = entrada.body.email;
        const claveNueva = entrada.body.claveNueva;
        const claveConfirmada = entrada.body.claveConfirmada;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        const filtroCadena = /['"\\;\r\n<>\t\b]/g;

        if (!usuarioIDX) {
            const error = "Escribe un nombre de usuario";
            throw new Error(error);
        }
        usuarioIDX = usuarioIDX
            .trim()
            .toLowerCase()
            .replace(filtroCadena, '');

        if (!filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros y nada mas";
            throw new Error(error);
        }
        const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
        email = email
            .toLowerCase()
            .trim()
            .replace(filtroCadena, '');

        if (!email || !filtroCorreoElectronico.test(email)) {
            const error = "El campo de correo electrónico no cumple con el formato esperado";
            throw new Error(error);
        }
        if (!claveNueva) {
            const error = "Escribe tu contrasena, no has escrito tu contrasena";
            throw new Error(error);
        } else {
            validadoresCompartidos.claves.minimoRequisitos(claveNueva);
        }
        if (!claveConfirmada) {
            const error = "Vuelve a escribir tu contrasena de nuevo";
            throw new Error(error);
        }
        if (claveNueva.trim() !== claveConfirmada) {
            const error = "La contrasenas no coinciden, revisa la contrasenas escritas";
            throw new Error(error);
        }
        if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
            const error = "El nombre de usuario no esta disponbile, escoge otro";
            throw new Error(error);
        }

        if (claveNueva === usuarioIDX) {
            const error = "El nombre de usuario y la contrasena no pueden ser iguales por seguridad";
            throw new Error(error);
        }
        await componentes.eliminarCuentasNoVerificadas();
        await componentes.borrarCuentasCaducadas();
        await conexion.query('BEGIN'); // Inicio de la transacción
        const validarNuevoUsuario = `
                SELECT 
                usuario
                FROM usuarios
                WHERE usuario = $1
                `;
        const resuelveValidarNuevoUsaurio = await conexion.query(validarNuevoUsuario, [usuarioIDX]);
        if (resuelveValidarNuevoUsaurio.rowCount > 0) {
            const error = "El nombre de usuario no esta disponible, escoge otro";
            throw new Error(error);
        }
        const validarEmail = `
            SELECT 
            email
            FROM "datosDeUsuario"
            WHERE email = $1
            `;
        const resuelveValidarEmail = await conexion.query(validarEmail, [email]);
        if (resuelveValidarEmail.rowCount > 0) {
            const error = "El correo electronico ya existe, recupera tu cuenta de usuarios o escoge otro correo electronico";
            throw new Error(error);
        }
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: claveNueva
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };
        const validarCodigo = async (codigoAleatorio) => {
            const validarCodigoAleatorio = `
                SELECT
                "codigoVerificacion"
                FROM usuarios
                WHERE "codigoVerificacion" = $1;`;
            const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
            if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                return true;
            }
        };
        const controlCodigo = async () => {
            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
            let codigoGenerado;
            let codigoExiste;
            do {
                codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                codigoExiste = await validarCodigo(codigoGenerado);
            } while (codigoExiste);
            // En este punto, tenemos un código único que no existe en la base de datos
            return codigoGenerado;
        };
        const codigoAleatorioUnico = await controlCodigo();
        const fechaActualUTC = DateTime.utc();
        const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({ minutes: 30 });
        const estadoCuenta = "activado";
        const cuentaVerificada = "no";
        const rol = "cliente";
        const crearNuevoUsuario = `
                INSERT INTO usuarios
                (
                usuario,
                rol,
                "estadoCuenta",
                "cuentaVerificada",
                "codigoVerificacion",
                "fechaCaducidadCuentaNoVerificada",
                sal,
                clave
                )
                VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING
                usuario
                `;
        const datosNuevoUsuario = [
            usuarioIDX,
            rol,
            estadoCuenta,
            cuentaVerificada,
            codigoAleatorioUnico,
            fechaCaducidadCuentaNoVerificada,
            nuevaSal,
            hashCreado
        ];
        const resuelveCrearNuevoUsuario = await conexion.query(crearNuevoUsuario, datosNuevoUsuario);
        if (resuelveCrearNuevoUsuario.rowCount === 0) {
            const error = "No se ha insertado el nuevo usuario en la base de datos";
            throw new Error(error);
        }
        const crearNuevosDatosUsuario = `
                INSERT INTO "datosDeUsuario"
                (
                "usuarioIDX",
                email
                )
                VALUES 
                ($1, $2)
                `;
        const resuelveCrearNuevosDatosUsuario = await conexion.query(crearNuevosDatosUsuario, [usuarioIDX, email]);
        if (resuelveCrearNuevosDatosUsuario.rowCount === 0) {
            const error = "No se ha insertado los datos del nuevo usuario";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: resuelveCrearNuevoUsuario.rows[0].usuario
        };
        salida.json(ok);
        await conexion.query('COMMIT');
        const datosVerificacion = {
            email: email,
            codigoVerificacion: codigoAleatorioUnico
        };
        enviarEmailAlCrearCuentaNueva(datosVerificacion);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}