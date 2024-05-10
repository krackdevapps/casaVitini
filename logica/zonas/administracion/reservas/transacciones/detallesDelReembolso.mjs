import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const detallesDelReembolso = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reembolsoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reembolsoUID,
            nombreCampo: "El identificador universal de reembolsoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        // const actualizarReembolso = await componentes.administracion.reservas.transacciones.actualizarSOLOreembolsoDesdeSquare(reembolsoUID)
        // if (actualizarReembolso.error) {
        //     throw new Error(actualizarReembolso.error)
        // }
        const validarReembolso = `
                            SELECT
                                "pagoUID",
                                cantidad,
                                "plataformaDePago",
                                "reembolsoUIDPasarela",
                                "estado",
                                "fechaCreacion"::text AS "fechaCreacion",
                                "fechaActualizacion"::text AS "fechaActualizacion"
                            FROM 
                                "reservaReembolsos"
                            WHERE 
                                "reembolsoUID" = $1;`;
        const reseulveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID]);
        if (reseulveValidarReembolso.rowCount === 0) {
            const error = "No existe ningún reembolso con ese reembolsoUID";
            throw new Error(error);
        }
        if (reseulveValidarReembolso.rowCount === 1) {
            const detallesDelReembolso = reseulveValidarReembolso.rows[0];
            const pagoUID = detallesDelReembolso.pagoUID;
            const cantidad = detallesDelReembolso.cantidad;
            const plataformaDePag = detallesDelReembolso.plataformaDePag;
            const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
            const estado = detallesDelReembolso.estado;
            const fechaCreacion = detallesDelReembolso.fechaCreacion;
            const fechaActualizacion = detallesDelReembolso.fechaActualizacion;
            const ok = {
                ok: "Aqui tienes los detalles del reembolso",
                pagoUID: pagoUID,
                cantidad: cantidad,
                plataformaDePag: plataformaDePag,
                reembolsoUIDPasarela: reembolsoUIDPasarela,
                estado: estado,
                fechaCreacion: fechaCreacion,
                fechaActualizacion: fechaActualizacion,
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}