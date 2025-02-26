import { ampliadorDeImagen } from "../../sharedMethodsAsUIComponents/ampliadorDeImagen.mjs";
import { otrosMetodos } from "./secondSharedMethods.mjs";
import { sharedMethods } from "./sharedMethods.mjs";

// Opcion uno, con spread operator, o sin el por si hay nombres de metodos repetidos

export const shared = () => {   
    return {
        ...sharedMethods,
        ...otrosMetodos,
        ...ampliadorDeImagen
    }
}

