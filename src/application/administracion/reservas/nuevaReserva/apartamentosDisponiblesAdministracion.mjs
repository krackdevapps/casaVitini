import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";

import { configuracionApartamento } from "../../../../shared/configuracionApartamento.mjs";
import { apartamentosPorRango } from "../../../../shared/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

export const apartamentosDisponiblesAdministracion = async (entrada) => {
    try {



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
            estadoIDV: "activado",
            zonaArray: ["global", "privada"]
        })
        const apartamentosIDV = configuracionesApartamento.map(c => c.apartamentoIDV)

        const res = {
            ok: {
                apartamentosDisponibles: [],
                apartamentosNoDisponibles: []
            },
            configuracionesAlojamiento: {}
        }

        if (apartamentosIDV.length > 0) {
            const apartamentosCribados = await apartamentosPorRango({
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                apartamentosIDV: apartamentosIDV,
                zonaConfiguracionAlojamientoArray: ["privada", "global"],
                zonaBloqueo_array: ["privada", "global"],
            });
            const apartamentosDisponibles = apartamentosCribados.apartamentosDisponibles
            const configuracionesAlojamiento = await configuracionApartamento(apartamentosDisponibles);

            res.ok.apartamentosDisponibles.push(...apartamentosDisponibles)
            res.configuracionesAlojamiento = configuracionesAlojamiento.configuracionApartamento

            const apartamentosNoDisponibles = apartamentosCribados.apartamentosNoDisponibles
            res.ok.apartamentosNoDisponibles.push(...apartamentosNoDisponibles)

        }

        return res
    } catch (errorCapturado) {
        throw errorCapturado
    }
}