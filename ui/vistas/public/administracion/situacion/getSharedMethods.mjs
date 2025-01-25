import { sharedMethodsCalendar } from "../calendario/sharedMethods.mjs"

export const shared = () => {   
    return {
        ...sharedMethodsCalendar
    }
}

