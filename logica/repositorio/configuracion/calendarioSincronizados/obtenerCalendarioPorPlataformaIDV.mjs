import { conexion } from "../../../componentes/db.mjs"

export const obtenerCalendarioPorPlataformaIDV = async (plataformaIDV) => {
    try {
        const consulta =`
        SELECT 
        uid,
        nombre,
        url,
        "apartamentoIDV",
        "plataformaOrigen",
        "uidPublico"
        FROM 
        "calendariosSincronizados"
        WHERE
        "plataformaOrigen" = $1
        `;
  
        const resuelve = await conexion.query(consulta, [plataformaIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun calendario con ese identificador visual plataformaIDV";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
