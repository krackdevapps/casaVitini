import { reservaComponentes } from "../../administracion/reservas/sharedMethods.mjs"

export const shared = () => {   

    return {
        ...reservaComponentes
    }
}

