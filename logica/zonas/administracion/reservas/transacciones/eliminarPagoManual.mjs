import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { actualizarEstadoPago } from "../../../../sistema/precios/actualizarEstadoPago.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const eliminarPagoManual = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la la palabra eliminar para confirmar la eliminación y evitar falsos clicks";
            throw new Error(error);
        }
        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El campo pagoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        await conexion.query('BEGIN'); // Inicio de la transacción
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const consultaEliminarPago = `
                            DELETE FROM "reservaPagos"
                            WHERE "pagoUID" = $1 AND reserva = $2;
                            `;
        await conexion.query(consultaEliminarPago, [pagoUID, reservaUID]);
        // Importante esto al afinal
        await actualizarEstadoPago(reservaUID);
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha eliminado irreversiblemente el pago",
            pagoUID: pagoUID
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}