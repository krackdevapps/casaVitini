import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { grid } from "../../../sharedMethodsAsUIComponents/grid.mjs"
import { selectorApartamentosEspecificosUI } from "../../../sharedMethodsAsUIComponents/selectorApartamentosEspecificosUI.mjs"
import { sharedMethods_resumen } from "../../alojamiento/resumen/sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods_resumen,
        ...grid,
        ...contenedorFechasUI,
        ...selectorApartamentosEspecificosUI,
        ...contenedorFinanciero
    }
}

