import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const detallesCliente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const cliente = validadoresCompartidos.tipos.numero({
            number: entrada.body.cliente,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const consultaDetallesCliente = `
                            SELECT 
                            uid, 
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email,
                            notas 
                            FROM 
                            clientes 
                            WHERE 
                            uid = $1`;
        const resolverConsultaDetallesCliente = await conexion.query(consultaDetallesCliente, [cliente]);
        if (resolverConsultaDetallesCliente.rowCount === 0) {
            const error = "No existe ningun clinete con ese UID";
            throw new Error(error);
        }
        const detallesCliente = resolverConsultaDetallesCliente.rows[0];
        const ok = {
            ok: detallesCliente
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}