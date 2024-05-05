import { conexion } from "../../componentes/db.mjs";
export const borrarCuentasCaducadas = async () => {
    try {
        // recuerda las cuentas de administracion no caducan
        // El resto a los seis meses desde el ultimo login
        const consultaCuentaAntiguas = `
        DELETE FROM usuarios
        WHERE "ultimoLogin" < NOW() - interval '6 months' AND rol <> $1;`;
        await conexion.query(consultaCuentaAntiguas, ["administrador"]);
    } catch (error) {
        throw error;
    }
}