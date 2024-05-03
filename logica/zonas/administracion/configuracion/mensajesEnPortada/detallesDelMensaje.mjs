export const detallesDelMensaje = async (entrada, salida) => {
                    try {
                        const mensajeUID = entrada.body.mensajeUID;
                        const filtroIDV = /^[0-9]+$/;
                        if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
                            const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
                            throw new Error(error);
                        }
                        const consulta = `
                                SELECT 
                                    uid,
                                    mensaje,
                                    estado,
                                    posicion
                                FROM 
                                    "mensajesEnPortada"
                                WHERE
                                    uid = $1;
                               `;
                        const resuelveMensajes = await conexion.query(consulta, [mensajeUID]);
                        const detallesDelMensaje = resuelveMensajes.rows[0];


                        const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
                        detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
                        const ok = {
                            ok: detallesDelMensaje
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error);
                    }

                }