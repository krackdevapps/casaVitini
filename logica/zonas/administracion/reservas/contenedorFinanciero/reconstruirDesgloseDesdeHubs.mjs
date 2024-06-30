import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"

export const reconstruirDesgloseDesdeHubs = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
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
            const error = "Por favor escribe correctamente la palabra reconstruir en el campo de texto. Escribe la palabra reconstruir en minusculas y sin espacios internos. Esto está asi para evitar falsos clicks."
            throw new Error(error)   
        }

        mutex.acquire()
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada, no se puede alterar los descuentos"
            throw new Error(error)
        }
        await campoDeTransaccion("iniciar")

        const fechaEntrada = reserva.fechaEntrada
        const fechaSalida = reserva.fechaSalida
        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "crearDesglose",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    apartamentosArray: apartamentosArray,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica"],
                    capaDescuentosPersonalizados: "no",
                    capaImpuestos: "si"

                }
            },
        })
        await actualizarDesgloseFinacieroPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha reconstruido el desglose desde las instantaneas"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}