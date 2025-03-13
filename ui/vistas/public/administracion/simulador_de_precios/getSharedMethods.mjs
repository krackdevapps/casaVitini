import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { grid } from "../../../sharedMethodsAsUIComponents/grid.mjs"
import { selectorApartamentosEspecificosUI } from "../../../sharedMethodsAsUIComponents/selectorApartamentosEspecificosUI.mjs"
import { serviciosUI_grupoOpciones } from "../../../sharedMethodsAsUIComponents/serviciosUI.mjs"
import { reservaComponentes } from "../reservas/sharedMethods.mjs"
import { sharedMethods } from "../gestion_de_ofertas/sharedMethods.mjs"

export const shared = () => {
    return {
        ...grid,
        ...contenedorFechasUI,
        ...selectorApartamentosEspecificosUI,
        ...contenedorFinanciero,
        ...serviciosUI_grupoOpciones,
        servicioUI: reservaComponentes.detallesReservaUI.categoriasGlobales.servicios.componentesUI.servicioUI,
        ofertas_componentesUI: sharedMethods

    }
}

