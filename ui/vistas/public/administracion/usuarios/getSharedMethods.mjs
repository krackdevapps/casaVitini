
import { grid } from "../../../sharedMethodsAsUIComponents/grid.mjs"
import { sharedMethods } from "./sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethods,
        ...grid
    }
}

