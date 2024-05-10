import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";



export const eliminarConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const validarApartamentoUID = `
                                    SELECT 
                                    *
                                    FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1
                                    `;
        const resuelveValidarApartamentoUID = await conexion.query(validarApartamentoUID, [apartamentoIDV]);
        if (resuelveValidarApartamentoUID.rowCount === 0) {
            const error = "No existe el perfil de configuracion del apartamento";
            throw new Error(error);
        }
        const eliminarConfiguracionDeApartamento = `
                                    DELETE FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1
                                    `;
        const resuelveEliminarApartamento = await conexion.query(eliminarConfiguracionDeApartamento, [apartamentoIDV]);
        if (resuelveEliminarApartamento.rowCount === 0) {
            const error = "No se ha eliminado la configuracion del apartamenro por que no se ha encontrado el registro en la base de datos";
            throw new Error(error);
        }
        if (resuelveEliminarApartamento.rowCount > 0) {
            const ok = {
                ok: "Se ha eliminado correctamente la configuracion de apartamento",
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}