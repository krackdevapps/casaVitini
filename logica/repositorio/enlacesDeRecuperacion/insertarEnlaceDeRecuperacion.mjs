import { conexion } from "../../componentes/db.mjs";

export const insertarEnlaceDeRecuperacion = async (data) => {
    try {

        const usuarioIDX = data.usuarioIDX
        const codigoGenerado = data.codigoGenerado
        const fechaCaducidadUTC = data.fechaCaducidadUTC
        const consulta = `
        INSERT INTO "enlaceDeRecuperacionCuenta"
        (
        usuario,
        "codigoUPID",
        "fechaCaducidad"
        )
        VALUES
        ($1, $2, $3)
        RETURNING
        *
        `;
        const parametros = [
            usuarioIDX,
            codigoGenerado,
            fechaCaducidadUTC
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha creado el enlace de recuperación."
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

