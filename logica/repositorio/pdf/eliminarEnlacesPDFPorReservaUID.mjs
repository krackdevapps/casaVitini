import { conexion } from '../../componentes/db.mjs'

export const eliminarEnlacesPDFPorReservaUID = async (reservaUID) => {
    const consulta = `
        DELETE FROM
        "enlacesPdf"
        WHERE
        "reservaUID" = $1;`;

    const resuelve = await conexion.query(consulta, [reservaUID]);
    return resuelve.rows;
}
