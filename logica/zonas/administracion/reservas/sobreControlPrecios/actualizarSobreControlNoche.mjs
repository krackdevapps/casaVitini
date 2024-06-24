import { utilidades } from "../../../../componentes/utilidades.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { insertarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/insertarDesgloseFinacieroPorReservaUID.mjs"
import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { actualizarSobreControlDeLaNoche } from "../../../../repositorio/reservas/transacciones/sobreControl/actualizarSobreControlDeLaNoche.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"

export const actualizarSobreControlNoche = async (entrada) => {
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
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo de apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const fechaNoche = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaNoche,
            nombreCampo: "El campo fechaNoche"
        })

        const tipoOperacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoOperacion,
            nombreCampo: "El campo de tipoOperacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const valorSobreControl = validadoresCompartidos.tipos.cadena({
            string: entrada.body.valorSobreControl,
            nombreCampo: "El campo de valorSobreControl",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })

        const operacionIDV = [
            "aumentarPorPorcentaje",
            "reducirPorPorcentaje",
            "aumentarPorCantidadFija",
            "reducirPorCantidadFila",
            "establecerCantidad"
        ]

        if (!operacionIDV.includes(tipoOperacion)) {
            const operacionesUI = utilidades.contructorComasEY(operacionIDV)
            const error = `el campo tipoOperacion solo permite los siguientes identidficadores visuales de operacion ${operacionesUI}`
            throw new Error(error)
        }

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada, no se puede alterar los descuentos"
            throw new Error(error)
        }
        const instantaneaNetoApartamento = await obtenerDetalleNochePorFechaNochePorApartamentoIDV({
            reservaUID,
            apartamentoIDV,
            fechaNoche
        })
        const estructuraSobreControl = {
            operacion: tipoOperacion,
            valor: valorSobreControl
        }
        // Actualziar con un adaptador para que guarde el sobrecontrol
        const sobreControlActualizado = await actualizarSobreControlDeLaNoche({
            reservaUID,
            apartamentoIDV,
            fechaNoche,
            nuevoSobreControl: estructuraSobreControl
        })
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    reservaUID: reservaUID,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica"],
                    capaDescuentosPersonalizados: "no",
                    capaImpuestos: "si"

                }
            }
        })

        // // Cambiar esto por actualizas
        // await actualizarDesgloseFinacieroPorReservaUID({
        //     desgloseFinanciero,
        //     reservaUID
        // })
        const ok = {
            ok: {
                instantaneaNetoApartamento,
                ...sobreControlActualizado
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}