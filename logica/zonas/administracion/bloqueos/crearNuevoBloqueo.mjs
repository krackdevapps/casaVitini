import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../../sistema/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const crearNuevoBloqueo = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const apartamentoIDV = entrada.body.apartamentoIDV;
        let tipoBloqueo = entrada.body.tipoBloqueo;
        let motivo = entrada.body.motivo;
        let zonaUI = entrada.body.zonaUI;
        const filtroApartamentoIDV = /^[a-z0-9]+$/;
        if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroApartamentoIDV.test(apartamentoIDV)) {
            const error = "el campo 'apartmentoIDV' solo puede ser letras minúsculas y numeros. Sin pesacios en formato cadena";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado()
        const validarApartamenotIDV = `
                            SELECT
                            *
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;`;
        const resuelveValidarApartmento = await conexion.query(validarApartamenotIDV, [apartamentoIDV]);
        if (resuelveValidarApartmento.rowCount === 0) {
            const error = "No existe el identificador del apartamento";
            throw new Error(error);
        }
        if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal") {
            const error = "tipoBloqueo solo puede ser permanente o rangoTemporal";
            throw new Error(error);
        }
        if (zonaUI !== "global" && zonaUI !== "publico" && zonaUI !== "privado") {
            const error = "zona solo puede ser global, publico o privado";
            throw new Error(error);
        }
        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
        let fechaInicio_ISO = null;
        let fechaFin_ISO = null;
        if (tipoBloqueo === "rangoTemporal") {
            const fechaInicio = entrada.body.fechaInicio;
            const fechaFin = entrada.body.fechaFin;
            fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
            fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
            const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
            const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
            if (fechaInicio_Objeto > fechaFin_Objeto) {
                const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo día.";
                throw new Error(error);
            }
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
            if (tiempoZH > fechaFin_TZ_Objeto) {
                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos.";
                throw new Error(error);
            }
        }
        if (motivo) {
            if (!filtroTextoSimple.test(motivo)) {
                const error = "Por temas de seguridad ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y números. Mas adelante se aceptarán todos los caracteres.";
                throw new Error(error);
            }
        } else {
            motivo = null;
        }
        const insertarNuevoBloqueo = `
                                INSERT INTO "bloqueosApartamentos"
                                (
                                apartamento,
                                "tipoBloqueo",
                                entrada,
                                salida,
                                motivo,
                                zona
                                )
                                VALUES ($1, $2, $3, $4, $5, $6) RETURNING uid
                                `;
        const datosNuevoBloqueo = [
            apartamentoIDV,
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zonaUI
        ];
        const resuelveInsertarNuevoBloqueo = await conexion.query(insertarNuevoBloqueo, datosNuevoBloqueo);
        if (resuelveInsertarNuevoBloqueo.rowCount === 0) {
            const error = "No se ha podido insertar el nuevo bloqueo";
            throw new Error(error);
        }
        if (resuelveInsertarNuevoBloqueo.rowCount === 1) {
            const nuevoUIDBloqueo = resuelveInsertarNuevoBloqueo.rows[0].uid;
            const ok = {
                ok: "Se ha creado el bloqueo correctamente",
                nuevoBloqueoUID: nuevoUIDBloqueo,
                apartamentoIDV: apartamentoIDV
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