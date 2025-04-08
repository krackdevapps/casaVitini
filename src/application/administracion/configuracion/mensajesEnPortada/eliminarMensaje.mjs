
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerMensajePorMensajeUID } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { eliminarMensajeEnPortada } from "../../../../infraestructure/repository/configuracion/mensajesPortada/elminarMensajeEnPortada.mjs";
import { actualizaOrdenDePosiciones } from "../../../../infraestructure/repository/configuracion/mensajesPortada/actualizarOrdenDePosiciones.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";


export const eliminarMensaje = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        await campoDeTransaccion("iniciar")
        const mensajeEnPortada = await obtenerMensajePorMensajeUID(mensajeUID)
        const posicion = mensajeEnPortada.posicion;
        await eliminarMensajeEnPortada(mensajeUID)
        await actualizaOrdenDePosiciones(posicion)

        await campoDeTransaccion("confirmar")

        return {
            ok: "Se ha eliminado correctamente el mensaje de portada",
            mensajeUID: mensajeUID
        };

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}