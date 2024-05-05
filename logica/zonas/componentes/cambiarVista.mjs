import { cambiarVista as cambiarVista_ } from "../../sistema/cambiarVista.mjs";

export const cambiarVista = async (entrada, salida) => {
    try {
        let vista = entrada.body.vista;
        
        if (!vista) {
            const error = "Tienes que definir 'Vista' con el nombre de la vista";
           throw new Error(error);
        }
        vista = vista.replace(/[^A-Za-z0-9_\-/=:]/g, '');
        const transaccion = {
            vista: vista,
            usuario: entrada.session?.usuario,
            rol: entrada.session?.rol
        };
        const transaccionInterna = await cambiarVista_(transaccion);
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const error = {};
        if (errorCapturado.message === "noExisteLaVista") {
            error.error = "noExisteLaVista";
        } else {
            error.error = "noExisteLaVista";
        }
        salida.json(error);
    }
}

