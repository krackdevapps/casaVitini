export const verificarCuenta = async (entrada, salida) => {
    try {
        let codigo = entrada.body.codigo;
        const filtroCadena = /^[a-z0-9]+$/;
        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

        if (!codigo || !filtroCadena.test(codigo)) {
            const error = "Los codigo de verificacion de cuentas solo pueden contener minuscular y numeros";
            throw new Error(error);
        }
        codigo = codigo.replace(filtroCadena_v2, '');

        await componentes.eliminarCuentasNoVerificadas();
        await conexion.query('BEGIN'); // Inicio de la transacción   
        const estadoVerificado = "si";
        const consultaValidarCodigo = `
            UPDATE 
            usuarios
            SET
            "cuentaVerificada" = $1,
            "codigoVerificacion" = NULL,
            "fechaCaducidadCuentaNoVerificada" = NULL
            WHERE
            "codigoVerificacion" = $2
            RETURNING
            usuario
            `;
        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [estadoVerificado, codigo]);
        if (resuelveValidarCodigo.rowCount === 0) {
            const error = "El codigo que has introducino no existe";
            throw new Error(error);
        }
        if (resuelveValidarCodigo.rowCount === 1) {
            const usuario = resuelveValidarCodigo.rows[0].usuario;
            const ok = {
                ok: "Cuenta verificada",
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