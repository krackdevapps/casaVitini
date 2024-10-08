import { conexion } from "../globales/db.mjs";

export const insertarUsuario = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const rolIDV = data.rolIDV
    const estadoCuenta = data.estadoCuenta
    const nuevaSal = data.nuevaSal
    const hashCreado = data.hashCreado
    const cuentaVerificada = data.cuentaVerificada
    const codigoAleatorioUnico = data.codigoAleatorioUnico
    const fechaCaducidadCuentaNoVerificada = data.fechaCaducidadCuentaNoVerificada
    const testingVI = data.testingVI

    try {
        const consulta = `
        INSERT INTO usuarios
        (
        usuario,
        "rolIDV",
        "estadoCuentaIDV",
        sal,
        clave,
        "cuentaVerificadaIDV",
        "codigoVerificacion",
        "fechaCaducidadCuentaNoVerificada",
        "testingVI"
        )
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
        *
        `;
        const parametros = [
            usuarioIDX,
            rolIDV,
            estadoCuenta,
            nuevaSal,
            hashCreado,
            cuentaVerificada,
            codigoAleatorioUnico,
            fechaCaducidadCuentaNoVerificada,
            testingVI
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el nuevo usuario en la base de datos.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
