import ICAL from 'ical.js';
import { conexion } from "../../../../../componentes/db.mjs";
import { VitiniIDX } from '../../../../../sistema/VitiniIDX/control.mjs';
import { validadoresCompartidos } from '../../../../../sistema/validadores/validadoresCompartidos.mjs';

export const actualizarCalendario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const url = validadoresCompartidos.tipos.url({
            url: entrada.body.url,
            nombreCampo: "El campo de la url del calendario",
            arrayDeDominiosPermitidos: [
                "www.airbnb.com",
                "airbnb.com"
            ]
        })


        const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
        const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
        if (resuelveSelecionarCalendario.rowCount === 0) {
            const error = "No existe el calendario que quieres actualizar, por favor revisa el identificado calendarioUID que has introducido.";
            throw new Error(error);
        }

        const validarApartamentoIDV = `
                                            SELECT
                                            "apartamentoIDV"
                                            FROM 
                                            "configuracionApartamento"
                                            WHERE
                                            "apartamentoIDV" = $1`;
        const resuelveValidarCliente = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el identificador de apartamento, verifica el apartamentoIDV";
            throw new Error(error);
        }

        let calendarioRaw = null;
        if (url) {         
            const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb";
            try {
                const calendarioData = await axios.get(url);
                calendarioRaw = calendarioData.data;
                const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                const jcal = new ICAL.Component(jcalData); // Crea un componente jCal


                // Verifica si el componente es un calendario (VCALENDAR)
                if (jcal?.name.toLowerCase() !== 'vcalendar') {
                    throw new Error(errorDeFormado);
                }
            } catch (errorCapturado) {
                throw new Error(errorDeFormado);
            }
        }
        const actualizarCliente = `
                                    UPDATE "calendariosSincronizados"
                                    SET 
                                    nombre = COALESCE($1, nombre),
                                    url = COALESCE($2, url),
                                    "apartamentoIDV" = COALESCE($3, "apartamentoIDV"),
                                    "dataIcal" = COALESCE($4, "dataIcal")
                                    WHERE uid = $5;
                                    `;
        const datosParaActualizar = [
            nombre,
            url,
            apartamentoIDV,
            calendarioRaw,
            calendarioUID
        ];
        const resuelveActualizarCliente = await conexion.query(actualizarCliente, datosParaActualizar);
        if (resuelveActualizarCliente.rowCount === 0) {
            const error = "Los datos se han enviado a la base de datos pero el servido de base de datos infomra que no se ha actualizado el calendario vuelve a intentarlo mas tarde. Discule las molestias";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha actualizado correctamente el calendario"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}