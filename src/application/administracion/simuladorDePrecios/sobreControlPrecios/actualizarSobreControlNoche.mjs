import { utilidades } from "../../../../shared/utilidades.mjs"
import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../infraestructure/repository/simulacionDePrecios/sobreControlDePrecios/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { actualizarSobreControlDeLaNoche } from "../../../../infraestructure/repository/simulacionDePrecios/sobreControlDePrecios/actualizarSobreControlDeLaNoche.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"


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

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la reserva (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
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

        await obtenerSimulacionPorSimulacionUID(simulacionUID)

        const instantaneaNetoApartamento = await obtenerDetalleNochePorFechaNochePorApartamentoIDV({
            simulacionUID,
            apartamentoIDV,
            fechaNoche
        })
        const estructuraSobreControl = {
            operacion: tipoOperacion,
            valor: valorSobreControl
        }

        const sobreControlActualizado = await actualizarSobreControlDeLaNoche({
            simulacionUID,
            apartamentoIDV,
            fechaNoche,
            nuevoSobreControl: estructuraSobreControl
        })

        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        const ok = {
            ok: "Sobre control actualizado",
            instantaneaNetoApartamento,
            simulacionUID,
            ...sobreControlActualizado,
            ...postProcesadoSimualacion,


        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}