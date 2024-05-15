import { conexion } from "../../componentes/db.mjs";

export const actualizarParConfiguracion = async (data) => {
    try {
        for (const [configuracionIDV, valor] of Object.entries(data)) {
            const consulta = ` 
            UPDATE "configuracionGlobal"
            SET
                valor = $2
            WHERE
                "configuracionUID" = $1;
            `;

            const parametros = [
                configuracionIDV,
                valor
            ]
            const resuelve = await conexion.query(consulta, parametros);
            if (resuelve.rowCount === 0) {
                const error = "No se ha podido actualizar la configruacion con el idv: " + configuracionIDV;
                throw new Error(error)
            }
        }
    } catch (error) {
        throw error
    }
}
