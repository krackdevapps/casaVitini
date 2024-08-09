import { utilidades } from "../../../../componentes/utilidades.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../repositorio/simulacionDePrecios/sobreControlDePrecios/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { actualizarSobreControlDeLaNoche } from "../../../../repositorio/simulacionDePrecios/sobreControlDePrecios/actualizarSobreControlDeLaNoche.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
//import _ from 'lodash';
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"


export const actualizarSobreControlNoche = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la reserva (simulacionUID)",
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
            const operacionesUI = utilidades.contructorComasEY({
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
        // Actualziar con un adaptador para que guarde el sobrecontrol
        const sobreControlActualizado = await actualizarSobreControlDeLaNoche({
            simulacionUID,
            apartamentoIDV,
            fechaNoche,
            nuevoSobreControl: estructuraSobreControl
        })
        const desgloseFinanciero = await procesador({
            entidades: {
                simulacion: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    simulacionUID: simulacionUID,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica"],
                    capaDescuentosPersonalizados: "no",
                    capaImpuestos: "si"

                }
            }
        })
        await actualizarDesgloseFinacieroPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })
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