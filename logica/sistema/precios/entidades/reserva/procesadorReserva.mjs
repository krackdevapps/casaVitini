import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { actualizarDesgloseFinanciero } from "./actualizarDesgloseFinanciero.mjs";
import { crearDesgloseFinanciero } from "./crearDesgloseFinanciero.mjs";

export const procesadorReserva = async (data) => {
    try {
        const tipoOperacion = data?.tipoOperacion
        if (tipoOperacion !== "crearDesglose" && tipoOperacion !== "actualizarDesglose") {
            const error = "El procesadorReserva mal configurado, necesita tipoOpercion en crearDesglose o actualizarDesglose"
            throw new Error(error)
        }

        if (tipoOperacion === "crearDesglose") {
            await crearDesgloseFinanciero(data)
        }

        if (tipoOperacion === "actualizarDesglose") {
            const reservaUID = validadoresCompartidos.tipos.cadena({
                string: data?.reservaUID,
                nombreCampo: "El campo de reservaUID dentro dle procesadorReserva",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            data.reservaUID = reservaUID,
                await actualizarDesgloseFinanciero(data)
        }
    } catch (error) {
        throw error
    }
}