import { conexion } from "../../componentes/db.mjs";
export const obtenerTodasLasOfertas = async () => {
    try {
        const consulta = `
        SELECT
        "nombreOferta",
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
        "numero",
        "simboloNumero",
        "descuentoAplicadoA" ,
        "estadoOferta",
        "tipoOferta",
        "cantidad",
        "tipoDescuento"
        FROM 
        ofertas 
        ORDER BY 
        "fechaInicio" ASC;
        `;
        const resuelve = await conexion.query(consulta)
        if (resuelve.rowCount === 0) {
            const error = "No hay ofertas configuradas"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
