export const validarCodigo = async (entrada, salida) => {
    try {
        let codigo = entrada.body.codigo;
        const filtroCadena = /^[a-z0-9]+$/;
        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

        if (!codigo || !filtroCadena.test(codigo)) {
            const error = "Los codigo de recuperacion de cuentas solo pueden contener minuscular y numeros";
            throw new Error(error);
        }
        codigo = codigo.replace(filtroCadena, '');
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
            const ok = {
                ok: "El enlace temporal sigue vigente",
                usuario: usuario
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.info(errorCapturado.message);
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}