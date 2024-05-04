import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const detallesUsuario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const usuarioIDX = entrada.body.usuarioIDX;
        const filtroCadena = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtroCadena.test(usuarioIDX)) {
            const error = "el campo 'usuarioIDX' solo puede ser letras minúsculas, numeros y sin pesacios";
            throw new Error(error);
        }

        const ok = {
            ok: {}
        };
        const consultaRol = `
                            SELECT 
                            rol,
                            "estadoCuenta"
                            FROM 
                            usuarios
                            WHERE 
                            usuario = $1;`;
        const resolverUsuarioYRol = await conexion.query(consultaRol, [usuarioIDX]);
        const rol = resolverUsuarioYRol.rows[0].rol;
        const estadoCuenta = resolverUsuarioYRol.rows[0].estadoCuenta;
        ok.ok.usuarioIDX = usuarioIDX;
        ok.ok.rol = rol;
        ok.ok.estadoCuenta = estadoCuenta;

        const consultaDetallesUsuario = `
                            SELECT 
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email
                            FROM 
                            "datosDeUsuario"
                            WHERE 
                            "usuarioIDX" = $1;`;
        const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX]);
        let detallesCliente = resolverConsultaDetallesUsuario.rows[0];
        if (resolverConsultaDetallesUsuario.rowCount === 0) {
            const crearDatosUsuario = `
                                INSERT INTO "datosDeUsuario"
                                (
                                "usuarioIDX"
                                )
                                VALUES ($1) 
                                RETURNING
                                *
                                `;
            const resuelveCrearFicha = await conexion.query(crearDatosUsuario, [usuarioIDX]);
            detallesCliente = resuelveCrearFicha.rows[0];
        }
        for (const [dato, valor] of Object.entries(detallesCliente)) {
            ok.ok[dato] = valor;
        }

        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}