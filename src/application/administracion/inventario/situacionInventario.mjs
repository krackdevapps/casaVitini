import { obtenerFaltaDeExistenciasIventario } from "../../../infraestructure/repository/inventario/obtenerFaltaDeExistenciasIventario.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

export const situacionInventario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const existencias = await obtenerFaltaDeExistenciasIventario()

        const ok = {
            ok: "Aqui tiene la situación de las existencias",
            existencias
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}