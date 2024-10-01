import { conexion } from "../../globales/db.mjs";

export const actualizarParConfiguracion = async (data) => {
    try {
        const contenedorConfiguracionActualizada = {}
        for (const [configuracionUID, valor] of Object.entries(data)) {
            const consulta = ` 
            UPDATE "configuracionGlobal"
            SET
                valor = $2
            WHERE
                "configuracionUID" = $1
            RETURNING
            *;
            `;

            const parametros = [
                configuracionUID,
                valor
            ]
            const resuelve = await conexion.query(consulta, parametros);
            if (resuelve.rowCount === 0) {
                const error = `No se ha podido actualizar la configruacion con el configuracionUID: ${configuracionUID}, verifica que exista esta identificacion en la tabla`;
                throw new Error(error)
            }
            const objeto = resuelve.rows[0]
            const [llave, valor_] = Object.entries(objeto)[0]
            contenedorConfiguracionActualizada[llave] = valor_
        }
        return contenedorConfiguracionActualizada
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
