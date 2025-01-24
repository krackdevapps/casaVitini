
import { administrationComponents } from "../../sharedMethods.mjs"
import { sharedMethods } from "./sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
        ...administrationComponents
    }
}

