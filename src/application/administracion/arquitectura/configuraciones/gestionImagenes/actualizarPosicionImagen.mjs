import { actualizarPosicionImagenPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/actualizarPosicionImagenPorApartamentoIDV.mjs";
import { actualizarRestoDePosicionesPorCoordenadas } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/actualizarRestoDePosicionesPorCoordenadas.mjs";
import { obtenerImagenPorImagenUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenPorImagenUIDPorApartamentoIDV.mjs";
import { obtenerNumeroDeTodasLasImagenesPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerNumeroDeTodasLasImagenesPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";

export const actualizarPosicionImagen = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
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
            devuelveUnTipoNumber: "si"
        })

        const nuevaPosicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaPosicion,
            nombreCampo: "El campo del nuevaPosicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"

        })

        await campoDeTransaccion("iniciar")

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        const numeroImg = await obtenerNumeroDeTodasLasImagenesPorApartamentoIDV(apartamentoIDV)
        const numeroTotal = numeroImg.totalImagenes

        if (numeroTotal < nuevaPosicion) {
            const m = "La posicion maxima pertidia es: " + numeroTotal
            throw new Error(m)
        }

        // Obtener la posición de la imagen que se va a mover
        const imagen = await obtenerImagenPorImagenUIDPorApartamentoIDV({
            apartamentoIDV,
            imagenUID
        })
        // Obtener la posicion final
        const posicionActualImagen = Number(imagen.posicion)
        const posicionFinalImagen = Number(nuevaPosicion)

        if (posicionFinalImagen === posicionActualImagen) {
            const m = "La imagen que quieres mover ya esta en la posicion: " + posicionActualImagen
            throw new Error(m)
        }

        await actualizarPosicionImagenPorApartamentoIDV({
            posicion: nuevaPosicion,
            apartamentoIDV,
            imagenUID
        })
        console.log("final", posicionFinalImagen, "actual", posicionActualImagen)
        if (posicionFinalImagen < posicionActualImagen) {
            console.log("1")
            await actualizarRestoDePosicionesPorCoordenadas({
                apartamentoIDV,
                imagenUID_enMovimiento: imagenUID,
                operacion: "+",
                posicionInicial: Number(posicionFinalImagen),
                posicionFinal: Number(posicionActualImagen)
            })
        } else {
            console.log("2")
            await actualizarRestoDePosicionesPorCoordenadas({
                apartamentoIDV,
                imagenUID_enMovimiento: imagenUID,
                posicionInicial: Number(posicionActualImagen),
                posicionFinal: Number(posicionFinalImagen),
                operacion: "-"
            })
        }
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la posicion de la imagen correctamente",
            posicion: String(nuevaPosicion)
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}