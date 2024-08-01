import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../repositorio/simulacionDePrecios/sobreControlDePrecios/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { eliminarSobreControlApartamento } from "../../../../repositorio/simulacionDePrecios/sobreControlDePrecios/eliminarSobreControlApartamento.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import _ from 'lodash';
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"

export const eliminarSobreControlNoche = async (entrada) => {
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

        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const instantaneaNetoApartamento = await obtenerDetalleNochePorFechaNochePorApartamentoIDV({
            simulacionUID,
            apartamentoIDV,
            fechaNoche
        })
        //
        const sobreControlActualizado = await eliminarSobreControlApartamento({
            simulacionUID,
            apartamentoIDV,
            fechaNoche
        })
        const desgloseFinanciero = await procesador({
            entidades: {
                simulacion: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    simulacionUID,
                    capaOfertas: "si",
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