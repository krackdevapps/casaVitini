export const obtenerRoles = async (entrada, salida) => {
                try {
                    const consultaRoles = `
                            SELECT 
                            rol, 
                            "rolUI"
                            FROM 
                            "usuariosRoles";`;
                    const resolverConsultaRoles = await conexion.query(consultaRoles);
                    if (resolverConsultaRoles.rowCount === 0) {
                        const error = "No existe ningún rol";
                        throw new Error(error);
                    }
                    const roles = resolverConsultaRoles.rows;
                    const ok = {
                        ok: roles
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }