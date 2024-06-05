import { conexion } from "../../../componentes/db.mjs";

export const obtenerParConfiguracion = async (arrayDeConfiguracionesUID) => {
    try {
        const consulta = `          
                SELECT 
                "configuracionUID",
                valor
                FROM 
                "configuracionGlobal"
                WHERE
                "configuracionUID" = ANY($1)
            `;

        const resuelve = await conexion.query(consulta, [arrayDeConfiguracionesUID]);

        const parConfiguracion = {}
        resuelve.rows.forEach((parConf) => {
            const configuracionUID = parConf.configuracionUID
            const valor = parConf.valor
            parConfiguracion[configuracionUID] = valor
        })


        return parConfiguracion
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
