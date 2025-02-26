
import { sharedMethodsPricesBehavior } from "../comportamiento_de_precios/sharedMethods.mjs"
import { sharedMethods } from "../usuarios/sharedMethods.mjs"
import { sharedMethodsCalendar } from "./sharedMethods.mjs"

export const shared = () => {
    const userSharedMethods = sharedMethods
    return {
        ...userSharedMethods,
        ...sharedMethodsCalendar,
        ...sharedMethodsPricesBehavior
    }
}

