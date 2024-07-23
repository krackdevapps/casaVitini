import { listaZonasHorarias } from "../../../../componentes/zonasHorarias.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { actualizarParConfiguracion } from "../../../../repositorio/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const guardarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const zonaHoraria = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaHoraria,
            nombreCampo: "El campo del zonaHoraria",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (!listaZonasHorarias.includes(zonaHoraria)) {
            const error = "El codigo de la zona horaria no existe";
            throw new Error(error);
        }

        await actualizarParConfiguracion({
            zonaHoraria: zonaHoraria
        })
        const ok = {
            ok: "Se ha actualizado correctamente la configuracion"
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}