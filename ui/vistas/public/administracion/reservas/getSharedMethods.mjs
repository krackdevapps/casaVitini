import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { serviciosUI_grupoOpciones } from "../../../sharedMethodsAsUIComponents/serviciosUI.mjs"
import { reservaComponentes } from "./sharedMethods.mjs"

export const shared = () => {   

    return {
        ...reservaComponentes,
        ...contenedorFechasUI,
        ...contenedorFinanciero,
        ...serviciosUI_grupoOpciones
 
    }
}

