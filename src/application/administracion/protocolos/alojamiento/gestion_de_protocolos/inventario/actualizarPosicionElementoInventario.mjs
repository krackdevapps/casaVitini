
import { validarInventarioDelProtocolo } from "../../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { obtenerProtocoloPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocoloPorUID.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { obtenerProtocoloPorApartamentoUIDPorPosicion } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocoloPorApartamentoUIDPorPosicion.mjs";
import { campoDeTransaccion } from "../../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarPosicionEnElementoPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/actualizarPosicionEnElementoPorUID.mjs";

export const actualizarPosicionElementoInventario = async (entrada, salida) => {
    try {


        const nuevoElemento = entrada.body

        const protocolVal = validarInventarioDelProtocolo({
            o: nuevoElemento,
            filtrosIDV: [
                "uid",
                "posicion"
            ]
        })

        const nuevaPosicion = protocolVal.posicion
        const nuevaPosicionNumero = Number(protocolVal.posicion)
        const uid = protocolVal.uid

        if (nuevaPosicionNumero <= 0) {
            throw new Error("No se puede poner una posicion 0 o numeros negativos")
        }

        const elementoACambiarPosicion = await obtenerProtocoloPorUID(uid)
        const apartamentoIDV = elementoACambiarPosicion.apartamentoIDV
        const posicionActualDelElementoSelecionado = elementoACambiarPosicion.posicion

        const elementosDelInventario = await obtenerProtocolosPorApartamentoIDV(apartamentoIDV)
        const posicionLimite = elementosDelInventario.lenght

        if (nuevaPosicionNumero >= posicionLimite) {
            throw new Error(`La posicion maxima es ${posicionLimite}`)
        }

        if (Number(posicionActualDelElementoSelecionado) === Number(nuevaPosicion)) {
            const error = "El elemento ya esta en esta posición";
            throw new Error(error);
        }

        const elementoAfectado = await obtenerProtocoloPorApartamentoUIDPorPosicion({
            apartamentoIDV,
            posicion: nuevaPosicion
        })
        if (!elementoAfectado) {
            const error = "Ningún elemento tiene esa posición";
            throw new Error(error);
        }
        const posicionElementoAfectado = elementoAfectado.posicion


        await campoDeTransaccion("iniciar")

        await actualizarPosicionEnElementoPorUID({
            uid: elementoAfectado.uid,
            posicion: "0"
        })

        const elemento = await actualizarPosicionEnElementoPorUID({
            uid: protocolVal.uid,
            posicion: nuevaPosicion
        })


        await actualizarPosicionEnElementoPorUID({
            uid: elementoAfectado.uid,
            posicion: posicionActualDelElementoSelecionado
        })

        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la posición del elemento del inventario en el protocolo de alojamiento",
            elemento
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}