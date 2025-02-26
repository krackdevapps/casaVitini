
import { sharedMethods } from "./sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
    }
}

