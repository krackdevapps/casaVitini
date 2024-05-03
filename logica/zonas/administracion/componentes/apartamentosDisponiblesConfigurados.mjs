export const apartamentosDisponiblesConfigurados = async (entrada, salida) => {
                try {
                    const apartamentosDisponiblesParaCrearOfertas = `
                            SELECT 
                            ca."apartamentoIDV",
                            ea."estadoUI",
                            a."apartamentoUI"
                            FROM "configuracionApartamento" ca
                            JOIN "estadoApartamentos" ea ON ca."estadoConfiguracion" = ea.estado
                            JOIN apartamentos a ON ca."apartamentoIDV" = a.apartamento;            
    
                            `;
                    const resulveApartamentosDisponiblesParaCrearOfertas = await conexion.query(apartamentosDisponiblesParaCrearOfertas);
                    if (resulveApartamentosDisponiblesParaCrearOfertas.rowCount === 0) {
                        const error = "No hay ningun apartamento disponible configurado";
                        throw new Error(error);
                    }
                    const apartamenosDisponiblesEcontrados = resulveApartamentosDisponiblesParaCrearOfertas.rows;
                    const ok = {
                        ok: apartamenosDisponiblesEcontrados
                    };
                    salida.json(ok);
                } catch (errorCatpurado) {
                    const error = {
                        error: errorCapurado.message
                    };
                    salida.json(error);
                } finally {
                }
            }