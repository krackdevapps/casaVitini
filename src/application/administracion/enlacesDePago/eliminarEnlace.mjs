import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";

export const eliminarEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
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