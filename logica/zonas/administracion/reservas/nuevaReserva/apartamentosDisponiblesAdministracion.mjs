import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { configuracionApartamento } from "../../../../sistema/configuracionApartamento.mjs";
import { apartamentosPorRango } from "../../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const apartamentosDisponiblesAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const fechaEntrada_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada_ISO,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        const fechaSalida_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida_ISO,
            nombreCampo: "La fecha de salida de la reserva"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            tipoVector: "diferente"
        })
        const apartamentosCribados = await apartamentosPorRango({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
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