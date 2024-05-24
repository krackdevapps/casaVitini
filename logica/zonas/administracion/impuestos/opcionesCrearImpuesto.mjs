// import { obtenerTodaMoneda } from "../../../repositorio/impuestos/obtenerTodaMoneda.mjs";
// import { obtenerTodoAplicacacionSobre } from "../../../repositorio/impuestos/obtenerTodoAplicacacionSobre.mjs";
// import { obtenerTodoTipoValor } from "../../../repositorio/impuestos/obtenerTodoTipoValor.mjs";
// import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


// export const opcionesCrearImpuesto = async (entrada, salida) => {
//     try {

//         const session = entrada.session
//         const IDX = new VitiniIDX(session, salida)
//         IDX.administradores()
//         IDX.control()

//         const opcionesTipoValor = await obtenerTodoTipoValor()
//         const opcionesAplicacionSobre = await obtenerTodoAplicacacionSobre()
//         const opcionesMonedas = await obtenerTodaMoneda()
//         const detallesImpuesto = {
//             tipoValor: opcionesTipoValor,
//             aplicacionSobre: opcionesAplicacionSobre,
//             moneda: opcionesMonedas
//         };
//         const ok = {
//             ok: detallesImpuesto
//         };
//         return ok
//     } catch (errorCapturado) {
//         throw errorCapturado
//     }

// }