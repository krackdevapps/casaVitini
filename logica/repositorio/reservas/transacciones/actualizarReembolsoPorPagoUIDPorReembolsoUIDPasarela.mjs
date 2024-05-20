import { conexion } from "../../../componentes/db.mjs"

export const actualizarReembolsoPorPagoUIDPorReembolsoUIDPasarela = async (data) => {
    try {

        const pagoUID = data.pagoUID
        const cantidad = data.cantidad
        const plataformaDePago = data.plataformaDePago
        const reembolsoUIDPasarela = data.reembolsoUIDPasarela
        const estadoReembolso = data.estadoReembolso
        const fechaCreacion = data.fechaCreacion
        const fechaActualizacion = data.fechaActualizacion

        const consulta =  `
        UPDATE
            "reservaReembolsos"
        SET 
            cantidad = $1,
            "plataformaDePago" = $2,
            "estadoIDV" = $3,
            "fechaCreacion" = $4,
            "fechaActualizacion" =
        WHERE 
        "pagoUID" = $6 
        AND 
        "reembolsoUIDPasarela" = $7;
        `;
        const parametros = [
            cantidad,
            plataformaDePago,
            estadoReembolso,
            fechaCreacion,
            fechaActualizacion,
            pagoUID,
            reembolsoUIDPasarela,
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el reembolso.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

