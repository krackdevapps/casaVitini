import { insertarDescuentoPorAdministrador } from "./insertarDescuentoPorAdministrador.mjs";
//import { crearDesgloseFinanciero } from "./crearDesgloseFinanciero.mjs";
import { eliminarDescuento } from "./eliminarDescuento.mjs";
import { insertarDescuentoCompatibleConSimulacion } from "./insertarDescuentoCompatibleConSimulacion.mjs";
import { actualizarDesgloseFinancieroDesdeInstantaneas } from "./actualizarDesgloseFinancieroDesdeInstantaneas.mjs";

export const procesadorSimulacion = async (data) => {
    try {
         const tipoOperacion = data?.tipoOperacion
        //if (tipoOperacion === "crearDesglose") {
           // await crearDesgloseFinanciero(data)
        //} else
        
    if (tipoOperacion === "actualizarDesgloseFinancieroDesdeInstantaneas") {
            await actualizarDesgloseFinancieroDesdeInstantaneas(data)
        } else if (tipoOperacion === "insertarDescuentoPorAdministrador") {
            await insertarDescuentoPorAdministrador(data)
        } else if (tipoOperacion === "insertarDescuentoCompatibleConSimulacion") {
            await insertarDescuentoCompatibleConSimulacion(data)
        } else if (tipoOperacion === "eliminarDescuento") {
            await eliminarDescuento(data)
        } else {
            const error = "El procesadorSimulacion mal configurado, no se reconoce el tipoOperacion"
            throw new Error(error)
        }
    } catch (error) {
        throw error
    }
}