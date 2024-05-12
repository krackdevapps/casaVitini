import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const apartamentosDisponiblesConfigurados = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const apartamentosDisponiblesParaCrearOfertas = `
                            SELECT 
                            ca."apartamentoIDV",
                            ea."estadoUI",
                            a."apartamentoUI"
                            FROM "configuracionApartamento" ca
                            JOIN "estadoApartamentos" ea ON ca."estadoConfiguracion" = ea.estado
                            JOIN apartamentos a ON ca."apartamentoIDV" = a.apartamento;            
    
                            `;
        const resulveApartamentosDisponiblesParaCrearOfertas = await conexion.query(apartamentosDisponiblesParaCrearOfertas);
        if (resulveApartamentosDisponiblesParaCrearOfertas.rowCount === 0) {
            const error = "No hay ningun apartamento disponible configurado";
            throw new Error(error);
        }
        const apartamenosDisponiblesEcontrados = resulveApartamentosDisponiblesParaCrearOfertas.rows;
        const ok = {
            ok: apartamenosDisponiblesEcontrados
        };
        salida.json(ok);
    } catch (errorCatpurado) {
        const error = {
            error: errorCatpurado.message
        };
        salida.json(error)
    } 
}