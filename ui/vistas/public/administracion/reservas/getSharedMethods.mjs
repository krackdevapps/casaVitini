import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { selectorApartamentosEspecificosUI } from "../../../sharedMethodsAsUIComponents/selectorApartamentosEspecificosUI.mjs"
import { serviciosUI_grupoOpciones } from "../../../sharedMethodsAsUIComponents/serviciosUI.mjs"
import { sharedMethods } from "../gestion_de_ofertas/sharedMethods.mjs"
import { reservaComponentes } from "./sharedMethods.mjs"

export const shared = () => {

    return {
        ...reservaComponentes,
        ...contenedorFechasUI,
        ...contenedorFinanciero,
        ...serviciosUI_grupoOpciones,
        ofertas_componentesUI: sharedMethods,
        ...selectorApartamentosEspecificosUI
    }
}

