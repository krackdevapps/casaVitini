import { conexion } from "../../componentes/db.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";
import { controlCaducidad } from "./controlCaducidad.mjs";

export const crearEnlacePDF = async (reservaUID) => {
    try {
        await campoDeTransaccion("iniciar")
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        await controlCaducidad();
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };
        const fechaActual = DateTime.utc();
        const fechaFutura = fechaActual.plus({ days: 2 });
        const fechaCaducidad = fechaFutura.toISO();
        // Ver si existe el enlace se borra
        const consultaCaducidadEnlaces = `
        DELETE FROM "enlacesPdf"
        WHERE "reservaUID" = $1;`;
        await conexion.query(consultaCaducidadEnlaces, [reservaUID]);
        const consultaCrearEnlace = `
        INSERT INTO
        "enlacesPdf"
        (
        "reservaUID",
        enlace,
        caducidad
        )
        VALUES 
        ($1, $2, $3)
        RETURNING
        enlace;`;
        const datosEnlace = [
            reservaUID,
            generarCadenaAleatoria(100),
            fechaCaducidad
        ];
        const reseulveEnlaces = await conexion.query(consultaCrearEnlace, datosEnlace);
        const enlacePDF = reseulveEnlaces.rows[0].enlace;
        await campoDeTransaccion("confirmar")
        return enlacePDF;
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error;
    }
}