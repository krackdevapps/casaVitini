import { controladorDelMovimiento } from "../../../inventario/controladorDeMovimiento.mjs"
import { reversionDeMovimiento } from "../../../inventario/reversionDeMovimiento.mjs"

export const sincronizarRegistros = async (data) => {
    try {
        const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio || {}
        const servicioExistenteAccesible = data.servicioExistenteAccesible
        const opcionesSeleccionadasPorValidar = opcionesSeleccionadasDelServicio.opcionesSeleccionadas || {}
        const gruposDeOpcionesDelServicio = servicioExistenteAccesible.contenedor.gruposDeOpciones

        const opcionesSel = servicioExistenteAccesible?.opcionesSel || {}

        for (const oS of Object.entries(opcionesSel)) {

            const contenedorGrupo = oS[1]
            for (const cG of contenedorGrupo) {
                const registroEnlazado = cG.registroEnlazado
                if (registroEnlazado) {
                    const registroUID = registroEnlazado.registroUID
                    await reversionDeMovimiento({
                        registroUID,
                    })
                }
            }
        }


        for (const [grupoIDV, grupoDeOpciones] of Object.entries(gruposDeOpcionesDelServicio)) {
            const opcionesGrupo = grupoDeOpciones.opcionesGrupo
            const grupoPorValidar = opcionesSeleccionadasPorValidar ?? {}

            for (const o of opcionesGrupo) {
                const opcionIDV = o.opcionIDV
                const elementoEnlazado = o?.elementoEnlazado

                const gpv = grupoPorValidar[grupoIDV]?.find(gPV => gPV.opcionIDV === opcionIDV)
                if (!gpv) {
                    continue
                }

                if (elementoEnlazado) {
                    const cantidad = gpv.cantidad
                    const elementoUID = elementoEnlazado.elementoUID
                    const cDM = await controladorDelMovimiento({
                        elementoUID,
                        operacionIDV: "elementoHaciaAReserva",
                        cantidadEnMovimiento: cantidad
                    })

                    const registroUID = cDM.nuevoRegistro.uid
                    gpv.registroEnlazado = {
                        registroUID: registroUID
                    }

                }
            }
        }

    } catch (error) {
        throw error
    }

}