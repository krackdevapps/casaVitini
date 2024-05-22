import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const apartamentosDisponiblesAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const fechaEntrada_ISO = entrada.body.fechaEntrada_ISO;
        const fechaSalida_ISO = entrada.body.fechaEntrad_ISO;
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada_ISO,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida_ISO,
            nombreCampo: "La fecha de salida de la reserva"
        })
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "administracion"
        };
        const transactor = await apartamentosPorRango(configuracionApartamentosPorRango);
        if (transactor) {
            const ok = {
                ok: transactor
            };
            return ok
        }
        salida.end();
    } catch (errorCapturado) {
        throw errorCapturado
    }
}