import { obtenerTodosLosImpuestos } from "../../../infraestructure/repository/impuestos/obtenerTodosLosImpuestos.mjs";


export const listarTodosLosImpuestos = async (entrada, salida) => {
    try {


        const impuestos = await obtenerTodosLosImpuestos()
        const ok = {
            ok: "Lista de los todos impuestos",
            impuestos: impuestos
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}