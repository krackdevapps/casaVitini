import { actualizarInformacionImagenPorImagenUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/actualizarInformacionImagenPorImagenUIDPorApartamentoIDV.mjs";
import { obtenerImagenPorImagenUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenPorImagenUIDPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";

export const actualizarInformacionImagen = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
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
            devuelveUnTipoNumber: "si"
        })

        const titulo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.titulo,
            nombreCampo: "El campo del titulo",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const descripcion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.descripcion,
            nombreCampo: "El campo del descripcion",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        await campoDeTransaccion("iniciar")

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        await obtenerImagenPorImagenUIDPorApartamentoIDV({
            apartamentoIDV,
            imagenUID
        })

        await actualizarInformacionImagenPorImagenUIDPorApartamentoIDV({
            apartamentoIDV,
            imagenUID,
            titulo,
            descripcion
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado la informacion de la imagen correctamente",
            titulo,
            descripcion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}