import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReembolsoPorReembolsoUID } from "../../../../repositorio/reservas/transacciones/obtenerReembolsoPorReembolsoUID.mjs";

export const detallesDelReembolso = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reembolsoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reembolsoUID,
            nombreCampo: "El identificador universal de reembolsoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const detallesDelReembolso = await obtenerReembolsoPorReembolsoUID(reembolsoUID)
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
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}