import { insertarDescuentoPorAdministrador } from "./insertarDescuentoPorAdministrador.mjs";
import { crearDesgloseFinanciero } from "./crearDesgloseFinanciero.mjs";
import { eliminarDescuento } from "./eliminarDescuento.mjs";
import { insertarDescuentoCompatibleConReserva } from "./insertarDescuentoCompatibleConReserva.mjs";
import { actualizarDesgloseFinancieroDesdeInstantaneas } from "./actualizarDesgloseFinancieroDesdeInstantaneas.mjs";

export const procesadorReserva = async (data) => {
    try {
        const tipoOperacion = data?.tipoOperacion
        if (tipoOperacion === "crearDesglose") {
            await crearDesgloseFinanciero(data)
        } else if (tipoOperacion === "actualizarDesgloseFinancieroDesdeInstantaneas") {
            await actualizarDesgloseFinancieroDesdeInstantaneas(data)
        } else if (tipoOperacion === "insertarDescuentoPorAdministrador") {
            await insertarDescuentoPorAdministrador(data)
        } else if (tipoOperacion === "insertarDescuentoCompatibleConReserva") {
            await insertarDescuentoCompatibleConReserva(data)
        } else if (tipoOperacion === "eliminarDescuento") {
            await eliminarDescuento(data)
        } else {
            const error = "El procesadorReserva mal configurado, no se reconoce el tipoOperacion"
            throw new Error(error)
        }
    } catch (error) {
        throw error
    }
}