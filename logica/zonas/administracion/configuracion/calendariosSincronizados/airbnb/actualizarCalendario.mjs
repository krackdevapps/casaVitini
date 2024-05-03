import ICAL from 'ical.js';
import { conexion } from "../../../../../componentes/db.mjs";


export const actualizarCalendario = async (entrada, salida) => {
    try {
        const calendarioUID = entrada.body.calendarioUID;
        let nombre = entrada.body.nombre || null;
        const apartamentoIDV = entrada.body.apartamentoIDV || null;
        let url = entrada.body.url || null;
        const filtroCadenaNumeros = /^[0-9]+$/;
        const filtroCadena_m_ss_n = /^[a-z0-9]+$/;
        const filtroCadena_m_M_cs_n = /^[a-zA-Z0-9\s]+$/;
        const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;
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
            const error = "No existe el calendario que quieres actualizar, por favor revisa el identificado calendarioUID que has introducido.";
            throw new Error(error);
        }
        if (nombre) {
            nombre = nombre.trim();
            if (!filtroCadena_m_M_cs_n.test(nombre)) {
                const error = "Hay que definir la nombre, solo se admiten mayusculas, minusculas, numeros y espacios.";
                throw new Error(error);
            }
        }
        if (apartamentoIDV) {
            if (!filtroCadena_m_ss_n.test(apartamentoIDV)) {
                const error = "Hay que definir la nombre, solo se admiten minusculas y numeros.";
                throw new Error(error);
            }
            // Tambien hay que validar que exista el apartmentoIDV, que no esta hecho
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
        }
        let calendarioRaw = null;
        if (url) {
            if (!filtroURL.test(url)) {
                const error = "Hay que definir el url y que esta cumpla el formato de url";
                throw new Error(error);
            }
            const controlDominio = new URL(url);
            const dominiofinal = controlDominio.hostname;
            if (dominiofinal !== "www.airbnb.com" && dominiofinal !== "airbnb.com") {
                const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                throw new Error(error);
            }
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