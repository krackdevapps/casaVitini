import { conexion } from "../globales/db.mjs";
export const eliminarSessionPorRolPorCaducidad = async () => {
    try {


        const consultaCuentaAntiguas = `
        DELETE FROM usuarios
        WHERE "ultimoLogin" < NOW() - interval '6 months' AND "rolIDV" <> $1;`;
        await conexion.query(consultaCuentaAntiguas, ["administrador"]);
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}