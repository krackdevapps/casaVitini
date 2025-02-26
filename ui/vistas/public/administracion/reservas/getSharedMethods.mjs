import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { serviciosUI } from "../../../sharedMethodsAsUIComponents/serviciosUI.mjs"
import { sharedMethods_resumen } from "../../alojamiento/resumen/sharedMethods.mjs"
import { reservaComponentes } from "./sharedMethods.mjs"

export const shared = () => {   

    return {
        ...sharedMethods_resumen,
        ...reservaComponentes,
        ...contenedorFechasUI,
        ...contenedorFinanciero,
        ...serviciosUI
 
    }
}

