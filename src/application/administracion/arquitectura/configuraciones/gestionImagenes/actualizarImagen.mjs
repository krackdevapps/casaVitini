import { actualizarImagenPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/actualizarImagenPorApartamentoIDV.mjs";
import { obtenerImagenPorImagenUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenPorImagenUIDPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

import { utilidades } from "../../../../../shared/utilidades.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";


export const actualizarImagen = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
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

        const contenidoArchivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.contenidoArchivo,
            nombreCampo: "El campo del contenidoArchivo",
            filtro: "cadenaBase64",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        utilidades.filtroBase64Imagenes(contenidoArchivo)
        await campoDeTransaccion("iniciar")

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        await obtenerImagenPorImagenUIDPorApartamentoIDV({
            apartamentoIDV,
            imagenUID
        })

        await actualizarImagenPorApartamentoIDV({
            apartamentoIDV,
            imagenUID,
            imagenBase64: contenidoArchivo
        })



        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la imagen correctamente",
            imagen: String(contenidoArchivo)
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}