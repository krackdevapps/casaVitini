import { conexion } from "../../../componentes/db.mjs";

export const actualizarParConfiguracion = async (data) => {
    try {
        
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
                const error = "No se ha podido actualizar la configruacion con el configuracionUID: " + configuracionUID;
                throw new Error(error)
            }
             
        }
        return
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
