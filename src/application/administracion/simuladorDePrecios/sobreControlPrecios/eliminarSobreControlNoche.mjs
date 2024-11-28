import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../infraestructure/repository/simulacionDePrecios/sobreControlDePrecios/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { eliminarSobreControlApartamento } from "../../../../infraestructure/repository/simulacionDePrecios/sobreControlDePrecios/eliminarSobreControlApartamento.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import _ from 'lodash';
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"

export const eliminarSobreControlNoche = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })


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
        const sobreControlActualizado = await eliminarSobreControlApartamento({
            simulacionUID,
            apartamentoIDV,
            fechaNoche
        })

        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        const ok = {
           
                ok: "Sobre control eliminado, el precio base se ha restaurado",
                instantaneaNetoApartamento,
                simulacionUID,
                ...sobreControlActualizado,
                ...postProcesadoSimualacion
            
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}