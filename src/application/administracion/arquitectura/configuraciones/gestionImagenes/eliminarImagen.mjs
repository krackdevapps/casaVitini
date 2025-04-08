import { actualizarPosicionesPorEliminacion } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/actualizarPosicionesPorEliminacion.mjs";
import { eliminarImagenPorImagenUID } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/eliminarImagenPorImagenUID.mjs";
import { obtenerImagenPorImagenUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenPorImagenUIDPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";


export const eliminarImagen = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const imagenUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.imagenUID,
            nombreCampo: "El campo del imagenUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        await campoDeTransaccion("iniciar")

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const imagen = await obtenerImagenPorImagenUIDPorApartamentoIDV({
            apartamentoIDV,
            imagenUID
        })
        await eliminarImagenPorImagenUID({
            apartamentoIDV,
            imagenUID
        })
        const posicion = Number(imagen.posicion)
        await actualizarPosicionesPorEliminacion({
            apartamentoIDV,
            posicionInicial: Number(posicion)
        })

        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha elinado la imagen correctamente"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}