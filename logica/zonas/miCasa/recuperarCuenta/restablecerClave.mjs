export const restablecerClave = async (entrada, salida) => {
    try {
        const codigo = entrada.body.codigo;
        const clave = entrada.body.clave;
        const claveConfirmada = entrada.body.claveConfirmada;
        const filtroCadena = /^[a-z0-9]+$/;
        if (!codigo || !filtroCadena.test(codigo)) {
            const error = "Los codigo de recuperacion de cuentas solo pueden contener minuscular y numeros";
            throw new Error(error);
        }
        if (!clave || (clave !== claveConfirmada)) {
            const error = "Las claves no coinciden. Por favor escribe tu nueva clave dos veces.";
            throw new Error(error);
        }
        if (!clave) {
            const error = "Escribe tu contrasena, no has escrito tu contrasena";
            throw new Error(error);
        } else {
            validadoresCompartidos.claves.minimoRequisitos(clave);
        }
        const fechaActual_ISO = DateTime.utc().toISO();
        const eliminarEnlacesCaducados = `
            DELETE FROM "enlaceDeRecuperacionCuenta"
            WHERE "fechaCaducidad" < $1;
            `;
        await conexion.query(eliminarEnlacesCaducados, [fechaActual_ISO]);
        await conexion.query('BEGIN'); // Inicio de la transacción   
        const consultaValidarCodigo = `
                SELECT 
                usuario
                FROM "enlaceDeRecuperacionCuenta"
                WHERE codigo = $1;
                `;
        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [codigo]);
        if (resuelveValidarCodigo.rowCount === 0) {
            const error = "El código que has introducido no existe. Si estás intentando recuperar tu cuenta, recuerda que los códigos son de un solo uso y duran una hora. Si has generado varios códigos, solo es válido el más nuevo.";
            throw new Error(error);
        }
        if (resuelveValidarCodigo.rowCount === 1) {
            const usuario = resuelveValidarCodigo.rows[0].usuario;
            const crypto = {
                sentido: "cifrar",
                clavePlana: clave
            };
            const retorno = vitiniCrypto(crypto);
            const nuevaSal = retorno.nuevaSal;
            const hashCreado = retorno.hashCreado;
            const restablecerClave = `
                UPDATE 
                usuarios
                SET
                sal = $1,
                clave = $2
                WHERE
                usuario = $3;
                `;
            const datosRestablecimiento = [
                nuevaSal,
                hashCreado,
                usuario
            ];
            await conexion.query(restablecerClave, datosRestablecimiento);
            const eliminarEnlaceUsado = `
                DELETE FROM "enlaceDeRecuperacionCuenta"
                WHERE usuario = $1;
                `;
            await conexion.query(eliminarEnlaceUsado, [usuario]);
            await conexion.query('COMMIT'); // Confirmar la transacción
            const ok = {
                ok: "El enlace temporal sigue vigente",
                usuario: usuario
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.info(errorCapturado.message);
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}