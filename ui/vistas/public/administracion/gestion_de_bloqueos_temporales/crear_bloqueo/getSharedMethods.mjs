
import { sharedMethodsTemporalLocks } from "../sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethodsTemporalLocks,
    }
}

