
// Opcion uno, con spread operator, o sin el por si hay nombres de metodos repetidos

import { sharedMethods } from "../sharedMetods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
    }
}

