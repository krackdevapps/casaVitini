
import { campoDeTransaccion } from "../../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validarTareaDelProtocolo } from "../../../../../../shared/protocolos/validarTareaDelProtocolo.mjs";
import { obtenerTareasDelProtocolosPorApartamentoIDV } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareasDelProtocolosPorApartamentoIDV.mjs";
import { actualizarTareaEnElementoPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarTareaEnElementoPorUID.mjs";
import { obtenerTareaPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorUID.mjs";
import { obtenerTareaPorApartamentoIDVPorPosicion } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorApartamentoIDVPorPosicion.mjs";

export const actualizarPosicionTarea = async (entrada, salida) => {
    try {


        const nuevoElemento = entrada.body

        const protocolVal = validarTareaDelProtocolo({
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

        const elementoACambiarPosicion = await obtenerTareaPorUID(uid)
        const apartamentoIDV = elementoACambiarPosicion.apartamentoIDV
        const posicionActualDelElementoSelecionado = elementoACambiarPosicion.posicion

        const elementosDelInventario = await obtenerTareasDelProtocolosPorApartamentoIDV(apartamentoIDV)
        const posicionLimite = elementosDelInventario.lenght

        if (nuevaPosicionNumero >= posicionLimite) {
            throw new Error(`La posicion maxima es ${posicionLimite}`)
        }

        if (Number(posicionActualDelElementoSelecionado) === Number(nuevaPosicion)) {
            const error = "El elemento ya esta en esta posición";
            throw new Error(error);
        }


        const elementoAfectado = await obtenerTareaPorApartamentoIDVPorPosicion({
            apartamentoIDV,
            posicion: nuevaPosicion
        })
        await campoDeTransaccion("iniciar")

        await actualizarTareaEnElementoPorUID({
            uid: elementoAfectado.uid,
            posicion: "0"
        })

        const elemento = await actualizarTareaEnElementoPorUID({
            uid: protocolVal.uid,
            posicion: nuevaPosicion
        })

        await actualizarTareaEnElementoPorUID({
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