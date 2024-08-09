import { DateTime } from "luxon";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../repositorio/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const guardarConfiguracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        const horaEntradaTZ = validadoresCompartidos.tipos.horas({
            hora: entrada.body.horaEntradaTZ,
            nombreCampo: "El campo de la hora de entrada"
        })
        const horaSalidaTZ = validadoresCompartidos.tipos.horas({
            hora: entrada.body.horaSalidaTZ,
            nombreCampo: "El campo de la hora de entrada"
        })

        // Parsear las cadenas de hora a objetos DateTime de Luxon
        const horaEntradaControl = DateTime.fromFormat(horaEntradaTZ, 'HH:mm');
        const horaSalidaControl = DateTime.fromFormat(horaSalidaTZ, 'HH:mm');
        // Comparar las horas
        if (horaSalidaControl >= horaEntradaControl) {
            const error = "La hora de entrada no puede ser anterior o igual a la hora de salida. Los pernoctantes primero salen del apartamento a su hora de salida y luego los nuevos pernoctantes entran en el apartamento a su hora de entrada. Por eso la hora de entrada tiene que ser más tarde que la hora de salida. Primero, los pernoctantes actuales salen del apartamento ocupado, el apartamento entonces pasa a estar libre y luego entran los nuevos pernoctantes al apartamento ahora libre de los anteriores pernoctantes.";
            throw new Error(error);
        }

        await campoDeTransaccion("iniciar")
        const dataActualizarConfiguracion = {
            "horaEntradaTZ": horaEntradaTZ,
            "horaSalidaTZ": horaSalidaTZ
        }
        await actualizarParConfiguracion(dataActualizarConfiguracion)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la configuración"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}