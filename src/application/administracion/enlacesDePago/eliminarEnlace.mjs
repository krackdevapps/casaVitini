
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";

export const eliminarEnlace = async (entrada, salida) => {
    try {

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
            devuelveUnTipoBigInt: "no"
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