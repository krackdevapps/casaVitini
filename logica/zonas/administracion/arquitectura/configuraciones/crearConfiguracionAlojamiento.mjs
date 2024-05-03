import { conexion } from "../../../../componentes/db.mjs";

export const crearConfiguracionAlojamiento = async (entrada, salida) => {
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV) || apartamentoIDV.length > 50) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
            throw new Error(error);
        }
        const validarIDV = `
                                    SELECT 
                                    "apartamentoUI"
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `;
        const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
        if (resuelveValidarIDV.rowCount === 0) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
            throw new Error(error);
        }
        const validarUnicidadConfigurativa = `
                                    SELECT 
                                    *
                                    FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1
                                    `;
        const resuelveValidarUnicidadConfigurativa = await conexion.query(validarUnicidadConfigurativa, [apartamentoIDV]);
        if (resuelveValidarUnicidadConfigurativa.rowCount > 0) {
            const error = "Ya existe una configuracion para la entidad del apartamento por favor selecciona otro apartamento como entidad";
            throw new Error(error);
        }
        const estadoInicial = "nodisponible";
        const crearConfiguracion = `
                                    INSERT INTO "configuracionApartamento"
                                    (
                                    "apartamentoIDV",
                                    "estadoConfiguracion"
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2
                                    )
                                    RETURNING "apartamentoIDV"
                                    `;
        const resuelveCrearConfiguracion = await conexion.query(crearConfiguracion, [apartamentoIDV, estadoInicial]);
        if (resuelveCrearConfiguracion.rowCount === 0) {
            const error = "No se ha podido crear la nueva configuracion";
            throw new Error(error);
        }
        if (resuelveCrearConfiguracion.rowCount === 1) {
            const ok = {
                ok: "Se ha creado correctament la nuevo configuracion del apartamento",
                apartamentoIDV: resuelveCrearConfiguracion.rows[0].apartamentoIDV
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