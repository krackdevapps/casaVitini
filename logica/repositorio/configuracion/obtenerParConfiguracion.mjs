import { conexion } from "../../componentes/db.mjs";

export const obtenerParConfiguracion = async (data) => {
    try {
        const paresDeConfiguracion = {}
        for (const configuracionIDV of data) {
            const consulta = `          
                SELECT 
                "configuracionUID",
                valor
                WHERE
                "configuracionUID" = $1
            `;

            const resuelve = await conexion.query(consulta, [configuracionIDV]);
            if (resuelve.rowCount === 0) {
                const error = "No se ha podido obtener el valor de la configuracion desde el: " + configuracionIDV;
                throw new Error(error)
            }
            const valorConf = resuelve.rows[0]
            paresDeConfiguracion[configuracionIDV] = valorConf
        }
        return paresDeConfiguracion
    } catch (error) {
        throw error
    }
}
