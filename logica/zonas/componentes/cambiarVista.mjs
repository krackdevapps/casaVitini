import { cambiarVista as cambiarVista_ } from "../../sistema/cambiarVista.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const cambiarVista = async (entrada) => {
    try {


        const vista = validadoresCompartidos.tipos.cadena({
            string: entrada.body.vista,
            nombreCampo: "La url como vista",
            filtro: "url",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (!vista) {
            const error = "Tienes que definir 'Vista' con el nombre de la vista";
            throw new Error(error);
        }
        const transaccion = {
            vista: vista,
            usuario: entrada.session?.usuario,
            rol: entrada.session?.rol
        };
        const transaccionInterna = await cambiarVista_(transaccion);
        return transaccionInterna
    } catch (errorCapturado) {
        //  const error = new Error("noExisteLaVista")
        // const errorFinal = filtroError(error)
        throw errorCapturado
    }
}

