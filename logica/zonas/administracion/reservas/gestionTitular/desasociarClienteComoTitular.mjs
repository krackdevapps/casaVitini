import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const desasociarClienteComoTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
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
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}