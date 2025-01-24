
import { sharedMethods } from "../usuarios/sharedMethods.mjs"

export const shared = () => {   
    const userSharedMethods = sharedMethods
    return {
        ...userSharedMethods
    }
}

