import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { insertarProtocoloAlojamiento } from "../../../../../infraestructure/repository/protocolos/alojamiento/inventario/insertarProtocoloAlojamiento.mjs";
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/inventario/obtenerProtocolosPorApartamentoIDV.mjs";

export const insertarInventarioEnProtocolo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const nuevoElemento = entrada.body
        const protocolVal = validarInventarioDelProtocolo({
            o: nuevoElemento,
            filtrosIDV: [
                "elementoUID",
                "apartamentoIDV",
                "cantidad_enAlojamiento"
            ]
        })

        const elementosDelInventario = await obtenerProtocolosPorApartamentoIDV(protocolVal.apartamentoIDV)
        const posicionSiguiente = elementosDelInventario.length + 1

        const elemento = await insertarProtocoloAlojamiento({
            elementoUID: protocolVal.elementoUID,
            apartamentoIDV: protocolVal.apartamentoIDV,
            cantidad_enAlojamiento: protocolVal.cantidad_enAlojamiento,
            posicion: posicionSiguiente
        })

        const ok = {
            ok: "Se ha insertado el elemento del inventario en el protocolo de alojamiento",
            elementoUID_enInventario: elemento.uid
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}