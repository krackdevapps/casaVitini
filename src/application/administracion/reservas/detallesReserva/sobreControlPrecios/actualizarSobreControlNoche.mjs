import { utilidades } from "../../../../../shared/utilidades.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { actualizarSobreControlDeLaNoche } from "../../../../../infraestructure/repository/reservas/transacciones/sobreControl/actualizarSobreControlDeLaNoche.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { procesador } from "../../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"



export const actualizarSobreControlNoche = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 5
        })

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
            devuelveUnTipoNumber: "no",
            impedirCero: "no"
        })

        const operacionIDV = [
            "aumentarPorPorcentaje",
            "reducirPorPorcentaje",
            "aumentarPorCantidadFija",
            "reducirPorCantidadFila",
            "establecerCantidad"
        ]

        if (!operacionIDV.includes(tipoOperacion)) {
            const operacionesUI = utilidades.constructorComasEY({
                array: operacionIDV,
                articulo: "el"
            })
            const error = `El campo tipoOperacion solo permite los siguientes identificadores visuales de operación ${operacionesUI}`
            throw new Error(error)
        }

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, no se pueden alterar los descuentos."
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

        const sobreControlActualizado = await actualizarSobreControlDeLaNoche({
            reservaUID,
            apartamentoIDV,
            fechaNoche,
            nuevoSobreControl: estructuraSobreControl
        })
        const desgloseFinanciero = await actualizadorIntegradoDesdeInstantaneas(reservaUID)

        const ok = {
            ok: {
                ...desgloseFinanciero,
                instantaneaNetoApartamento,
                ...sobreControlActualizado
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}