import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"

export const reconstruirDesgloseDesdeHubs = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra reconstruir",
            filtro: "strictoSinEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        if (palabra !== "reconstruir") {
            const error = "Por favor, escribe correctamente la palabra, reconstruir en el campo de texto. Escribe la palabra, reconstruir en minúsculas y sin espacios internos. Esto está así para evitar falsos clics."
            throw new Error(error)
        }

        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)

        const nombre = simulacion.nombre
        const fechaCreacion = simulacion.fechaCreacion
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const apartamentosArray = simulacion.apartamentosIDVARRAY

        try {
            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }
        } catch (error) {
            const m = "No se puede reconstruir este desglose financiero de esta reserva desde los hubs de precios, porque hay apartamentos que ya no existen como configuración de alojamiento en el hub de configuraciones de alojamiento."
            throw new Error(m)
        }
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "crearDesglose",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaCreacion: fechaCreacion,
                    apartamentosArray: apartamentosArray,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica", "privada"],
                    descuentosParaRechazar: [],
                    capaDescuentosPersonalizados: "no",
                    descuentosArray: [],
                    capaImpuestos: "si",
                }
            },
        })
        await actualizarDesgloseFinacieroPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha reconstruido el desglose desde las instantáneas"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}