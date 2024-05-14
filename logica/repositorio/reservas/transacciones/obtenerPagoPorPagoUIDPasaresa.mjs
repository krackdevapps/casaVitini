import { conexion } from "../../../componentes/db.mjs"

export const obtenerPagoPorPagoUIDPasaresa = async (data) => {
    try {

        const pagoUIDPasarela = data.pagoUIDPasarela
        const reservaUID = data.reservaUID
  
        const consulta = `
        SELECT 
        "pagoUIDPasarela"
        FROM 
        "reservaPagos"
        WHERE "pagoUIDPasarela" = $1 AND reserva = $2;`;
        const parametros = [
            pagoUIDPasarela,
            reservaUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

