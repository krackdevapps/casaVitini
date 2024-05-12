import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";


export const apartamentosDisponiblesAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const fechaEntrada = entrada.body.entrada;
        const fechaSalida = entrada.body.salida;
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
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
            salida.json(ok);
        }
        salida.end();
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}