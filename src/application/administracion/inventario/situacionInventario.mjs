import { obtenerFaltaDeExistenciasIventario } from "../../../infraestructure/repository/inventario/obtenerFaltaDeExistenciasIventario.mjs";


export const situacionInventario = async () => {
    try {

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