import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";

export const obtenerDetallesElemento = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const elementoValidado = validarElemento({
            o: entrada.body,
            filtrosIDV: [
                "elementoUID"
            ]
        })

        const elemento = await obtenerElementoPorElementoUID(elementoValidado.elementoUID)
        const ok = {
            ok: elemento
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}