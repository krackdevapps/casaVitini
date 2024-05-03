import { conexion } from '../db.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';

export const resolverComportamientosDePrecio = async (fechaEntrada_ISO, fechaSalida_ISO) => {
    await validadoresCompartidos.fechas.validarFecha_ISO(fechaEntrada_ISO);
    await validadoresCompartidos.fechas.validarFecha_ISO(fechaSalida_ISO);

    const estructuraComportamientos = [];
    const soloComportamientosActivados = "activado";
    const buscarComportamientoPrecio = `
    SELECT
    uid,
    "nombreComportamiento",
    to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
    to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal"
    FROM "comportamientoPrecios" 
    WHERE "fechaInicio" <= $1::DATE AND "fechaFinal" >= $2::DATE AND estado = $3;`;
    const resuelveBuscarComportamientoPrecio = await conexion.query(buscarComportamientoPrecio, [fechaSalida_ISO, fechaEntrada_ISO, soloComportamientosActivados]);
    if (resuelveBuscarComportamientoPrecio.rowCount > 0) {
        const comportamientoEntonctrados = resuelveBuscarComportamientoPrecio.rows;
        for (const detallesComportamiento of comportamientoEntonctrados) {
            const uidComportamiento = detallesComportamiento.uid;
            const nombreComportamiento = detallesComportamiento.nombreComportamiento;
            const fechaInicioComportamiento = detallesComportamiento.fechaInicio;
            const fechaFinalComportamiento = detallesComportamiento.fechaFinal;
            const buscarApartamentosEnComportamiento = `
            SELECT 
            "apartamentoIDV",
            simbolo,
            cantidad
            FROM "comportamientoPreciosApartamentos" 
            WHERE "comportamientoUID" = $1;`;
            const resuelveBuscarApartamentosEnComortamiento = await conexion.query(buscarApartamentosEnComportamiento, [uidComportamiento]);
            if (resuelveBuscarApartamentosEnComortamiento.rowCount > 0) {
                const apartamentoEntonctradoEnComportamiento = resuelveBuscarApartamentosEnComortamiento.rows;
                for (const perfilComportamiento of apartamentoEntonctradoEnComportamiento) {
                    const simbolo = perfilComportamiento.simbolo;
                    const cantidad = perfilComportamiento.cantidad;
                    const apartamentoIDVComportamiento = perfilComportamiento.apartamentoIDV;
                    const constructorFaseUno = {
                        apartamentoIDV: apartamentoIDVComportamiento,
                        simbolo: simbolo,
                        nombreComportamiento: nombreComportamiento,
                        cantidad: cantidad,
                        fechaInicio: fechaInicioComportamiento,
                        fechaFinal: fechaFinalComportamiento,
                    };
                    estructuraComportamientos.push(constructorFaseUno);
                }
            }
        }
    }
    return estructuraComportamientos;
};
