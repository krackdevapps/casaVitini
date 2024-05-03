import { conexion } from "../../../../../componentes/db.mjs";


export const exportarCalendario = async (entrada, salida) => {
    try {
        const calendarioUID = entrada.body.calendarioUID;
        const filtroCadenaNumeros = /^[0-9]+$/;
        if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
            const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
            throw new Error(error);
        }
        const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
        const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
        if (resuelveSelecionarCalendario.rowCount === 0) {
            const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
            throw new Error(error);
        }
        // Obtener las las reservas
        // Verificar que el apartmento este en esa reserva
        // añadirlo a una array
        // parsearlo en formato ical
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}