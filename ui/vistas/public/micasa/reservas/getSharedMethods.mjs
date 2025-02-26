import { contenedorFechasUI } from "../../../sharedMethodsAsUIComponents/contenedorFechasUI.mjs"
import { contenedorFinanciero } from "../../../sharedMethodsAsUIComponents/contenedorFinanciero.mjs"
import { grid } from "../../../sharedMethodsAsUIComponents/grid.mjs"
import { reservaComponentes } from "../../administracion/reservas/sharedMethods.mjs"

export const shared = () => {   

    return {
        ...reservaComponentes,
        ...contenedorFechasUI,
        ...grid,
        ...contenedorFinanciero
    }
}

