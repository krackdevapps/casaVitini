import { conexion } from "../../../componentes/db.mjs";
export const eliminarPerfilPrecioApartamento = async (entrada, salida) => {
    await mutex.acquire();
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        if (typeof apartamentoIDV !== "string") {
            const error = "El campo apartamentoIDV debe de ser una cadena";
            throw new Error(error);
        }
        const filtroCadena = /^[a-z0-9]+$/;
        if (!filtroCadena.test(apartamentoIDV)) {
            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
            throw new Error(error);
        }
        const validarApartamento = `
                            SELECT
                            "apartamentoIDV", 
                            "estadoConfiguracion"
                            FROM 
                            "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1
                            `;
        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
        if (resuelveValidarApartamento.rowCount === 0) {
            const error = "No existe el apartamenro";
            throw new Error(error);
        }
        if (resuelveValidarApartamento.rows[0].estadoConfiguracion === "disponible") {
            const error = "No se puede eliminar un perfil de precio de una configuracion de apartamento mientras esta configuracion esta disponible para su uso. Por favor primero ponga la configuracion en no disponible y luego realiza las modificaciones pertinentes.";
            throw new Error(error);
        }
        const eliminarPerfilPrecio = `
                            DELETE FROM "preciosApartamentos"
                            WHERE apartamento = $1;
                            `;
        const resuelveEliminarPerfilPrecio = await conexion.query(eliminarPerfilPrecio, [apartamentoIDV]);
        if (resuelveEliminarPerfilPrecio.rowCount === 0) {
            const error = "No hay ningun perfil de precio que elimintar de este apartamento";
            throw new Error(error);
        }
        const ok = {
            "ok": "Se ha eliminado correctamnte el perfil de apartamento"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }

}