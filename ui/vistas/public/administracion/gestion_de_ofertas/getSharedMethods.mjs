
import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { selectorApartamentosEspecificosUI } from "../../../sharedMethodsAsUIComponents/selectorApartamentosEspecificosUI.mjs"
import { sharedMethods } from "./sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
        ...contenedorFinanciero,
        ...selectorApartamentosEspecificosUI,
        ...contenedorFechasUI
    }
}

