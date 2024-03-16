import { conexion } from '../db.mjs';
const resolverApartamentoUI = async (apartamentoIDV) => {
    try {
        const resolucionNombreApartamento = await conexion.query(`SELECT "apartamentoUI" FROM apartamentos WHERE apartamento = $1`, [apartamentoIDV])
        if (resolucionNombreApartamento.rowCount === 0) {
            const error = "No existe el identificador del apartamentoIDV"
            throw new Error(error)
        }
        return resolucionNombreApartamento.rows[0].apartamentoUI
    } catch (error) {
        throw error;
    }

}
export {
    resolverApartamentoUI
}