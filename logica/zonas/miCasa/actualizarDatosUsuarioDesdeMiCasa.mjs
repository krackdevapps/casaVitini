export const actualizarDatosUsuarioDesdeMiCas = async (entrada, salida) => {

    try {
        const usuarioIDX = entrada.session.usuario;
        let nombre = entrada.body.nombre;
        let primerApellido = entrada.body.primerApellido;
        let segundoApellido = entrada.body.segundoApellido;
        let pasaporte = entrada.body.pasaporte;
        let telefono = entrada.body.telefono;
        let email = entrada.body.email;
        const filtro_minúsculas_Mayusculas_numeros_espacios = /^[a-zA-Z0-9\s]+$/;
        const filtroNumeros = /^[0-9]+$/;
        const filtroCadena = /^[a-zA-Z0-9\s]+$/;
        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

        if (!usuarioIDX) {
            const error = "Identificate para actualizar los datos personales de tu cuenta";
            throw new Error(error);
        }
        if (nombre?.length > 0) {
            nombre = nombre
                .trim()
                .replace(/\s+/g, ' ')
                .toUpperCase()
                .replace(filtroCadena_v2, '');
            if (!filtroCadena.test(nombre)) {
                const error = "el campo 'nombre' solo puede ser letras minúsculas, masculas.";
                throw new Error(error);
            }
        }
        if (primerApellido?.length > 0) {
            primerApellido = primerApellido
                .trim()
                .replace(/\s+/g, ' ')
                .toUpperCase()
                .replace(filtroCadena_v2, '');
            if (!filtroCadena.test(primerApellido)) {
                const error = "el campo 'primerApellido' solo puede ser letras minúsculas, masculas.";
                throw new Error(error);
            }
        }
        if (segundoApellido?.length > 0) {
            segundoApellido = segundoApellido
                .trim()
                .replace(/\s+/g, ' ')
                .toUpperCase()
                .replace(filtroCadena_v2, '');
            if (!filtroCadena.test(segundoApellido)) {
                const error = "el campo 'segundoApellido' solo puede ser letras minúsculas, masculas.";
                throw new Error(error);
            }
        }
        if (pasaporte?.length > 0) {
            pasaporte = pasaporte
                .trim()
                .replace(/\s+/g, ' ')
                .toUpperCase()
                .replace(filtroCadena_v2, '');
            const filtroPasaporte = /^[a-zA-Z0-9]+$/;
            if (!filtroPasaporte.test(pasaporte)) {
                const error = "el campo 'pasaporte' solo puede ser letras minúsculas, masculas y numeros.";
                throw new Error(error);
            }
        }
        if (telefono) {
            telefono = telefono
                .trim()
                .replace(/\s+/g, '')
                .replace(filtroCadena_v2, '');
            const filtroTelefono = /^\d+$/;
            if (!filtroTelefono.test(telefono)) {
                const error = "el campo 'telefono' solo puede una cadena con un numero, entero y positivo. Si estas escribiendo un numero internacional, sustituya el signo mas del incio por dos ceros";
                throw new Error(error);
            }
        }
        if (email) {
            email = email
                .toLowerCase()
                .replace(/\s+/g, '')
                .trim()
                .replace(filtroCadena_v2, '');
            const filtroEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!filtroEmail.test(email)) {
                const error = "El campo email no tiene le formato correcto, por ejemplo usuario@servidor.zona";
                throw new Error(error);
            }
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const controlCorreo = `
                SELECT 
                    email
                FROM 
                    "datosDeUsuario" 
                WHERE 
                    email = $1 AND "usuarioIDX" <> $2`;
        const resolverObtenerDatosUsuario = await conexion.query(controlCorreo, [email, usuarioIDX]);
        if (resolverObtenerDatosUsuario.rowCount > 0) {
            const error = "Ya existe una cuenta con ese correo electroníco. Escoge otro correo. Si ese es tu unico correo puedes recuperar tu cuenta de usuario con ese correo.";
            throw new Error(error);
        }
        const controlNuevoCorreoPorVerifical = `
                SELECT 
                    email
                FROM 
                    "datosDeUsuario" 
                WHERE 
                    "usuarioIDX" = $1 
                    AND
                    email = $2`;
        const resuelveNuevoCorreoPorVerifical = await conexion.query(controlNuevoCorreoPorVerifical, [usuarioIDX, email]);
        const actualizarDatosUsuario = `
                UPDATE "datosDeUsuario"
                SET 
                  "nombre" = COALESCE(NULLIF($1, ''), "nombre"),
                  "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
                  "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
                  "pasaporte" = COALESCE(NULLIF($4, ''), "pasaporte"),
                  "telefono" = COALESCE(NULLIF($5, ''), "telefono"),
                  "email" = COALESCE(NULLIF($6, ''), "email")
                WHERE "usuarioIDX" = $7
                RETURNING 
                  "nombre",
                  "primerApellido",
                  "segundoApellido",
                  "pasaporte",
                  "telefono",
                  "email";            
                `;
        const datos = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            email,
            usuarioIDX,
        ];
        const resuelveActualizarDatosUsuario = await conexion.query(actualizarDatosUsuario, datos);
        if (resuelveNuevoCorreoPorVerifical.rowCount === 0 && email.length > 0) {
            const fechaActualUTC = DateTime.utc();
            const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({ minutes: 30 });

            const volverAVerificarCuenta = `
                    UPDATE 
                        usuarios
                    SET 
                        "cuentaVerificada" = $1,
                        "fechaCaducidadCuentaNoVerificada" =$2
                    WHERE 
                        usuario = $3;`;
            await conexion.query(volverAVerificarCuenta, ["no", fechaCaducidadCuentaNoVerificada, usuarioIDX]);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        if (resuelveActualizarDatosUsuario.rowCount === 1) {
            const ok = {
                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                datosActualizados: resuelveActualizarDatosUsuario.rows
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}
