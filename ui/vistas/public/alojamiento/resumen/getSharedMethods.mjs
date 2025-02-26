import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { serviciosUI_grupoOpciones } from "../../../sharedMethodsAsUIComponents/serviciosUI.mjs"
import { reservaComponentes } from "../../administracion/reservas/sharedMethods.mjs"
import { sharedMethods } from "../sharedMethods.mjs"

export const shared = () => {   

    return {
        ...sharedMethods,
        ...serviciosUI_grupoOpciones,
        ...contenedorFinanciero,
        servicioUI: reservaComponentes.detallesReservaUI.categoriasGlobales.servicios.componentesUI.servicioUI
    }
}

