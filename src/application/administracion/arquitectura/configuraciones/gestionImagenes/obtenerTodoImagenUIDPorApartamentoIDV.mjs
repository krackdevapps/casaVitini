import { obtenerTodasLasImagenesUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerTodasLasImagenesUIDPorApartamentoIDV.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const obtenerTodoImagenUIDPorApartamentoIDV = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI
        const imagenes = await obtenerTodasLasImagenesUIDPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Aquí tienes los UID de todas las imagenes del apartamento",
            apartamentoIDV,
            apartamentoUI,
            imagenes
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}