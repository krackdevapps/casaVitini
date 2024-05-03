import { conexion } from "../../../../componentes/db.mjs";

export const eliminarConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
            throw new Error(error);
        }
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
                "ok": "Se ha eliminado correctamente la configuracion de apartamento",
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}