
import { conexion } from "../../../../componentes/db.mjs";
export const eliminarImagenConfiguracionApartamento = async (entrada, salida) => {
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios";
            throw new Error(error);
        }
        const validarIDV = `
                                    SELECT 
                                    "estadoConfiguracion"
                                    FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1
                                    `;
        const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
        if (resuelveValidarIDV.rowCount === 0) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
            throw new Error(error);
        }
        if (resuelveValidarIDV.rows[0].estadoConfiguracion === "disponible") {
            const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero";
            throw new Error(error);
        }
        const actualizarImagenConfiguracion = `
                                UPDATE "configuracionApartamento"
                                SET imagen = NULL
                                WHERE "apartamentoIDV" = $1;
                                `;
        const resuelveActualizarImagenConfiguracion = await conexion.query(actualizarImagenConfiguracion, [apartamentoIDV]);
        if (resuelveActualizarImagenConfiguracion.rowCount === 0) {
            const error = "No se ha podido borrar la imagen del apartmento reintentalo";
            throw new Error(error);
        }
        if (resuelveActualizarImagenConfiguracion.rowCount === 1) {
            const ok = {
                ok: "Se ha borrado imagen correctamnte"
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