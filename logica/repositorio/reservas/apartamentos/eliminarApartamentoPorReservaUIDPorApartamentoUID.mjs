import { conexion } from "../../../componentes/db.mjs"

export const eliminarApartamentoPorReservaUIDPorApartamentoUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const apartamentoUID = data.apartamentoUID

        const consulta = `
        DELETE 
        FROM 
            "reservaApartamentos"
        WHERE 
            "componenteUID" = $1 
        AND 
            "reservaUID" = $2;
        `;
        const parametros = [
            apartamentoUID,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido eliminar el apartamento de la reserva porque no se encuentra."
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

