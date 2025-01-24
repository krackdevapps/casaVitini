import { sharedMethods } from "../sharedMethods.mjs"
import { sharedMethods_resumen } from "./sharedMethods.mjs"

export const shared = () => {   

    return {
        ...sharedMethods,
        ...sharedMethods_resumen
    }
}

