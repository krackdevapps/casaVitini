import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { serviciosUI } from "../../../sharedMethodsAsUIComponents/serviciosUI.mjs"
import { sharedMethods } from "../sharedMethods.mjs"
import { sharedMethods_resumen } from "./sharedMethods.mjs"

export const shared = () => {   

    return {
        ...sharedMethods,
        ...sharedMethods_resumen,
        ...serviciosUI,
        ...contenedorFinanciero
    }
}

