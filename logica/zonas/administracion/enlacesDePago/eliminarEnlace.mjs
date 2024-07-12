import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { eliminarEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/eliminarEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";

export const eliminarEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        
        await obtenerEnlaceDePagoPorEnlaceUID(enlaceUID)
        await eliminarEnlaceDePagoPorEnlaceUID(enlaceUID)
        const ok = {
            ok: "Se ha eliminado el enlace correctamente"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}