import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { detallesReserva as detallesReserva_ } from "../../../sistema/sistemaDeReservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const detallesReserva = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
        console.log("test12")

        const reservaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const solo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.solo,
            nombreCampo: "EL campo de solo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (solo) {
            if (solo !== "detallesAlojamiento" &&
                solo !== "desgloseTotal" &&
                solo !== "informacionGlobal" &&
                solo !== "globalYFinanciera" &&
                solo !== "pernoctantes") {
                const error = "el campo 'zona' solo puede ser detallesAlojamiento, desgloseTotal, informacionGlobal o pernoctantes.";
                throw new Error(error);
            }
        }
        const metadatos = {
            reservaUID: reservaUID,
            solo: solo
        };
        const resuelveDetallesReserva = await detallesReserva_(metadatos);
        salida.json(resuelveDetallesReserva);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}