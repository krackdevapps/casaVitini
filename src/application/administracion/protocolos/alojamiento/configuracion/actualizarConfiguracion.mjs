
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validarConfiguracion } from "../../../../../shared/protocolos/validarConfiguracion.mjs";
import { actualizaConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/actualizaConfiguracionDeProtocolos.mjs";


export const actualizarConfiguracion = async (entrada) => {
    try {


        const data = entrada.body

        const protocolVal = await validarConfiguracion({
            o: data,
            filtrosIDV: [
                "diasCaducidadRevision",
                "diasAntelacionPorReserva"
            ]
        })

        const diasCaducidadRevision = protocolVal.diasCaducidadRevision
        const diasAntelacionPorReserva = protocolVal.diasAntelacionPorReserva

        await campoDeTransaccion("iniciar")

        const reposicionParaActualizar = await actualizaConfiguracionDeProtocolos({
            diasCaducidadRevision,
            diasAntelacionPorReserva
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la configuración de los protocolos de alojamiento",
            reposicionParaActualizar
        }

        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}