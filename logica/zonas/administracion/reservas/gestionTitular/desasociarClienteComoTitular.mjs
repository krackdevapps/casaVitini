import { conexion } from "../../../../componentes/db.mjs";
export const desasociarClienteComoTitular = async (entrada, salida) => {
    try {
        const reservaUID = entrada.body.reservaUID;
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const consultaElimintarTitularPool = `
                                DELETE FROM 
                                    "poolTitularesReserva"
                                WHERE
                                    reserva = $1;
                            `;
        await conexion.query(consultaElimintarTitularPool, [reservaUID]);
        const consultaActualizarTitular = `
                                DELETE FROM
                                    "reservaTitulares"
                                WHERE 
                                    "reservaUID" = $1;`;
        const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, [reservaUID]);
        if (resuelveActualizarTitular.rowCount === 0) {
            const error = "No se ha podido actualizar el titular de la reserva";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha eliminado el titular de la reserva, la reserva ahora no tiene titular"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}