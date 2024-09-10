import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReembolsoPorReembolsoUID } from "../../../../../repositorio/reservas/transacciones/reembolsos/obtenerReembolsoPorReembolsoUID.mjs";

export const detallesDelReembolso = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const reembolsoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reembolsoUID,
            nombreCampo: "El identificador universal (reembolsoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })


        const detallesDelReembolso = await obtenerReembolsoPorReembolsoUID(reembolsoUID)
        const pagoUID = detallesDelReembolso.pagoUID;
        const cantidad = detallesDelReembolso.cantidad;
        const plataformaDePag = detallesDelReembolso.plataformaDePag;
        const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
        const estado = detallesDelReembolso.estadoIDV;
        const fechaCreacion = detallesDelReembolso.fechaCreacion;
        const fechaActualizacion = detallesDelReembolso.fechaActualizacion;
        const ok = {
            ok: "Aquí tienes los detalles del reembolso.",
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