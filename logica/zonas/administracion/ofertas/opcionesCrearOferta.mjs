import { obtenerTodosAplicacionSobreIDV } from "../../../repositorio/ofertas/obtenerTodosAplicacionSobreIDV.mjs";
import { obtenerTodosLosTipoOfertaIDV } from "../../../repositorio/ofertas/obtenerTodosLosTipoOfertaIDV.mjs";
import { obtenerTodosLosTiposDescuento } from "../../../repositorio/ofertas/obtenerTodosLosTiposDescuento.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const opcionesCrearOferta = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const opcionesCrearOferta = {
            aplicacionSobre:await obtenerTodosAplicacionSobreIDV(),
            tipoOfertas: await obtenerTodosLosTipoOfertaIDV(),
            tipoDescuento: await obtenerTodosLosTiposDescuento()
        };
        const ok = {
            ok: opcionesCrearOferta
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } 
}