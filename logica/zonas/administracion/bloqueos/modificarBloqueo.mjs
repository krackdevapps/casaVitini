import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
VitiniIDX

export const modificarBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const bloqueoUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de bloqueoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        const tipoBloqueo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueo,
            nombreCampo: "El tipoBloqueo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const motivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.motivo,
            nombreCampo: "El campo del motivo",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const zona = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zona,
            nombreCampo: "El zona",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const validarFechaInicioSuperiorFechaFinal = async (fechaInicio_ISO, fechaFin_ISO) => {
            const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
            const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
            if (fechaInicio_Objeto > fechaFin_Objeto) {
                const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo dia";
                throw new Error(error);
            }
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
            if (tiempoZH > fechaFin_TZ_Objeto) {
                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos.";
                throw new Error(error);
            }
        };
        await eliminarBloqueoCaducado();
        let fechaInicio_ISO = null;
        let fechaFin_ISO = null;
        const seleccionarBloqueo = await conexion.query(`SELECT uid FROM "bloqueosApartamentos" WHERE uid = $1`, [bloqueoUID]);
        if (seleccionarBloqueo.rowCount === 0) {
            const error = "No existe el bloqueo, revisa el bloqueoUID";
            throw new Error(error);
        }
        if (tipoBloqueo === "rangoTemporal") {
            const fechaInicio_Humano = entrada.body.fechaInicio;
            const fechaFin_Humano = entrada.body.fechaFin;
            const consultaFechasBloqueoActual = `
                                SELECT
                                to_char(entrada, 'DD/MM/YYYY') as "fechaInicioBloqueo_ISO", 
                                to_char(salida, 'DD/MM/YYYY') as "fechaFinBloqueo_ISO"
                                FROM 
                                "bloqueosApartamentos"
                                WHERE
                                uid = $1`;
            const validarFechaInicioExistente = await conexion.query(consultaFechasBloqueoActual, [bloqueoUID]);
            const fechaInicioBloqueo_ISO = validarFechaInicioExistente.rows[0].fechaInicioBloqueo_ISO;
            const fechaFinBloqueo_ISO = validarFechaInicioExistente.rows[0].fechaFinBloqueo_ISO;
            if (fechaInicio_Humano !== null) {
                fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio_Humano)).fecha_ISO;
                await validarFechaInicioSuperiorFechaFinal(fechaInicio_ISO, fechaFinBloqueo_ISO);
            }
            if (fechaFin_Humano !== null) {
                fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin_Humano)).fecha_ISO;
                await validarFechaInicioSuperiorFechaFinal(fechaInicioBloqueo_ISO, fechaFin_ISO);
            }
        }

        const modificarBloqueo = `
                            UPDATE "bloqueosApartamentos"
                            SET 
                            "tipoBloqueo" = COALESCE($1, "tipoBloqueo"),
                            entrada = COALESCE($2, entrada),
                            salida = COALESCE($3, salida),
                            motivo = COALESCE($4, motivo),
                            zona = COALESCE($5, zona)
                            WHERE uid = $6;
                            `;
        const datosParaActualizar = [
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zona,
            bloqueoUID
        ];
        const resuelveModificarBloqueo = await conexion.query(modificarBloqueo, datosParaActualizar);
        if (resuelveModificarBloqueo.rowCount === 0) {
            const error = "No se ha podido actualizar el bloqueo con los nuevo datos.";
            throw new Error(error);
        }
        if (resuelveModificarBloqueo.rowCount === 1) {
            const ok = {
                ok: "Se ha actualizado el bloqueo correctamente"
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}