import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { configuracionApartamento } from "../../../../shared/configuracionApartamento.mjs";
import { apartamentosPorRango } from "../../../../shared/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

export const apartamentosDisponiblesAdministracion = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida de la reserva"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })
        const configuracionesApartamento = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "disponible",
            zonaArray: ["global", "privada"]
        })
        const apartamentosIDV = configuracionesApartamento.map(c => c.apartamentoIDV)
        const apartamentosCribados = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDV: apartamentosIDV,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privado", "global"],
        });
        const apartamentosDisponibles = apartamentosCribados.apartamentosDisponibles

        const configuracionesAlojamiento = await configuracionApartamento(apartamentosDisponibles);
        const ok = {
            ok: apartamentosCribados,
            configuracionesAlojamiento: configuracionesAlojamiento.configuracionApartamento
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}