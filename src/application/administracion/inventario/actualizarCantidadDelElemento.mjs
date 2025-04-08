import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { controladorDelMovimiento } from "../../../shared/inventario/controladorDeMovimiento.mjs";


export const actualizarCantidadDelElemento = async (entrada, salida) => {
    try {

        const actualizarElemento = entrada.body
        const elementoValidado = validarElemento({
            o: actualizarElemento,
            filtrosIDV: [
                "cantidad",
                "elementoUID",
                "operacionIDV"
            ]
        })

        const elementoUID = elementoValidado?.elementoUID
        if (!elementoUID) {
            throw new Error("Falta la llave elementoUID con una cadena con numeros enteros")
        }
        const elemento = await obtenerElementoPorElementoUID({
            elementoUID,
            errorSi: "noExiste"
        })
        const cantidadEntrada = elementoValidado.cantidad
        const operacionIDV = elementoValidado.operacionIDV

        await campoDeTransaccion("iniciar")
        await controladorDelMovimiento({
            elementoUID,
            cantidadEnMovimiento: cantidadEntrada,
            operacionIDV: operacionIDV
        })

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizaro la cantidad del elemento en el inventario",
            elementoUID: elemento.UID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}