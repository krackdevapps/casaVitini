import { conexion } from "../../../../componentes/db.mjs";

export const obtenerTotalesPorApartamentoPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        "apartamentoIDV",
        "apartamentoUI",
        "totalNetoRango",
        "precioMedioNocheRango"
        FROM 
        "reservaTotalesPorApartamento" 
        WHERE
        "reservaUID" = $1`
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

