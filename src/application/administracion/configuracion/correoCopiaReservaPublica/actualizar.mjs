import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const actualizar = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const correoCopiaReservaPublica = validadoresCompartidos.tipos.correoElectronico({
            mail: entrada.body.correoCopiaReservaPublica,
            nombreCampo: "El campo del correoCopiaReservaPublica",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })


        await campoDeTransaccion("iniciar")
        await actualizarParConfiguracion({
            "correoCopiaReservaPublica": correoCopiaReservaPublica,
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la configuración",
            correoCopiaReservaPublica
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}