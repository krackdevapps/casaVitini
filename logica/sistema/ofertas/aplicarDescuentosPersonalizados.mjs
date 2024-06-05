import { obtenerOfertasPorArrayUID } from "../../repositorio/ofertas/perfiles/obtenerOfertasPorArrayUID.mjs"
import { aplicarDescuento } from "./aplicarDescuento.mjs"

export const aplicarDescuentosPersonalizados = async (data) => {

    const totalesBase = data.totalesBase
    const descuentosArray = data.descuentosArray
    const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
    const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
    const ofertasSeleccionadas = await obtenerOfertasPorArrayUID(descuentosArray)
    //
    const ofertaAnalizadasPorCondiciones = []
    for (const oferta of ofertasSeleccionadas) {
        const ofertaEstructura = {
            oferta
        }
        ofertaAnalizadasPorCondiciones.push(ofertaEstructura)
    }
    await aplicarDescuento({
        ofertarParaAplicarDescuentos: ofertaAnalizadasPorCondiciones,
        totalesBase: totalesBase,
        fechaEntradaReserva_ISO,
        fechaSalidaReserva_ISO
    })



}