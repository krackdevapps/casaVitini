import { conexion } from "../../componentes/db.mjs";

export const obtenerParConfiguracion = async (arrayDeConfiguracionesUID) => {
    try {
        const consulta = `          
                SELECT 
                "configuracionUID",
                valor
                WHERE
                "configuracionUID" = ANY($1)
            `;

        const resuelve = await conexion.query(consulta, [arrayDeConfiguracionesUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido obtener el valor de la configuracion desde el: " + configuracionUID;
            throw new Error(error)
        }

        return resuelve
    } catch (error) {
        throw error
    }
}
