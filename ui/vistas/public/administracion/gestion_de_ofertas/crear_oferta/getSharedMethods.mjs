
import { contenedorFechasUI } from "../../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { selectorApartamentosEspecificosUI } from "../../../../sharedMethodsAsUIComponents/selectorApartamentosEspecificosUI.mjs"
import { sharedMethods } from "../sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
        ...selectorApartamentosEspecificosUI,
        ...contenedorFechasUI
    }
}

