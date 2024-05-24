import { DateTime } from "luxon";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../repositorio/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const guardarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const horaEntradaTZ = validadoresCompartidos.tipos.horas({
            hola: entrada.body.horaEntradaTZ,
            nombreCampo: "El campo de la hora de entrada"
        })
        const horaSalidaTZ = validadoresCompartidos.tipos.horas({
            hola: entrada.body.horaSalidaTZ,
            nombreCampo: "El campo de la hora de entrada"
        })

        // Parsear las cadenas de hora a objetos DateTime de Luxon
        const horaEntradaControl = DateTime.fromFormat(horaEntradaTZ, 'HH:mm');
        const horaSalidaControl = DateTime.fromFormat(horaSalidaTZ, 'HH:mm');
        // Comparar las horas
        if (horaSalidaControl >= horaEntradaControl) {
            const error = "La hora de entrada no puede ser anterior o igual a la hora de salida. Los pernoctantes primero salen del apartamento a su hora de salida y luego los nuevos pernoctantes entran en el apartamento a su hora de entrada. Por eso la hora de entrada tiene que ser mas tarde que al hora de salida. Por que primero salen del apartamento ocupado, el apartmento entonces pasa a estar libre y luego entran los nuevo pernoctantes al apartamento ahora libre de los anteriores pernoctantes.";
            throw new Error(error);
        }

        await campoDeTransaccion("iniciar")
        const dataActualizarConfiguracion = {
            "horaEntradaTZ": horaEntradaTZ,
            "horaSalidaTZ": horaSalidaTZ
        }
        await actualizarParConfiguracion(dataActualizarConfiguracion)
        await campoDeTransaccion("confiramr")
        const ok = {
            ok: "Se ha actualizado correctamente la configuracion"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    }

}