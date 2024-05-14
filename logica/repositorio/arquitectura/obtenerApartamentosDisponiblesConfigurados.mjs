import { conexion } from "../../componentes/db.mjs";

export const obtenerApartamentosDisponiblesConfigurados = async () => {

    try {
        const consulta =  `
        SELECT 
        ca."apartamentoIDV",
        ea."estadoUI",
        a."apartamentoUI"
        FROM "configuracionApartamento" ca
        JOIN "estadoApartamentos" ea ON ca."estadoConfiguracion" = ea.estado
        JOIN apartamentos a ON ca."apartamentoIDV" = a.apartamento;            

        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}