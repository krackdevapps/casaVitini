import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const opcionesCrearOferta = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const opcionesCrearOferta = {};
        const listaAplicacionOferta = `
                            SELECT
                            "aplicacionIDV", "aplicacionUI"
                            FROM 
                            "ofertasAplicacion";`;
        const resuelveListaAplicacionOferta = await conexion.query(listaAplicacionOferta);
        opcionesCrearOferta.aplicacionSobre = resuelveListaAplicacionOferta.rows;
        const listaTipoOfertas = `
                            SELECT
                            "tipoOfertaIDV", "tipoOfertaUI"
                            FROM 
                            "ofertasTipo";`;
        const resuelveListaTipoOfertas = await conexion.query(listaTipoOfertas);
        opcionesCrearOferta.tipoOfertas = resuelveListaTipoOfertas.rows;
        const listaTipoDescuento = `
                            SELECT
                            "tipoDescuentoIDV", "tipoDescuentoUI"
                            FROM 
                            "ofertasTipoDescuento";`;
        const resuelveListaTipoDescuento = await conexion.query(listaTipoDescuento);
        opcionesCrearOferta.tipoDescuento = resuelveListaTipoDescuento.rows;
        const ok = {
            ok: opcionesCrearOferta
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } 
}