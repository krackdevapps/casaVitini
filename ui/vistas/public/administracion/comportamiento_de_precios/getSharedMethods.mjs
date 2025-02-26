
import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { selectorApartamentosEspecificosUI } from "../../../sharedMethodsAsUIComponents/selectorApartamentosEspecificosUI.mjs"
import { sharedMethodsPricesBehavior } from "./sharedMethods.mjs"

export const shared = () => {
    return {
        ...sharedMethodsPricesBehavior,
        ...contenedorFechasUI,
        ...selectorApartamentosEspecificosUI
    }
}

