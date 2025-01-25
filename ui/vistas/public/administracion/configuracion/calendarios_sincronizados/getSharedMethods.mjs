
import { sharedMethodsTemporalLocks } from "../../gestion_de_bloqueos_temporales/sharedMethods.mjs"
import { administrationComponents } from "../../sharedMethods.mjs"
import { sharedMethods } from "./sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
        ...administrationComponents,
        sharedMethodsTemporalLocks
    }
}

