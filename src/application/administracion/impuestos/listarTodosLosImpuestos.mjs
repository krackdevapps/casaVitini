import { obtenerTodosLosImpuestos } from "../../../infraestructure/repository/impuestos/obtenerTodosLosImpuestos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

export const listarTodosLosImpuestos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

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