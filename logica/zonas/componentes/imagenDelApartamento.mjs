export const imagenDelApartamento = async (entrada, salida) => {
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
            throw new Error(error);
        }
        const consultaApartamento = `
            SELECT imagen
            FROM "configuracionApartamento" 
            WHERE "apartamentoIDV" = $1;`;
        const resuelveApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
        if (resuelveApartamento.rowCount === 0) {
            const error = "No existe ningun apartamento con ese identificador visua, revisa el apartamentoIDV";
            throw new Error(error);
        }
        const ok = {
            ok: "Imagen de apartamento PNG en base64",
            imagen: resuelveApartamento.rows[0].imagen
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}