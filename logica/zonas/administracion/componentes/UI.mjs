export const UI = async (entrada, salida) => {
                try {
                    console.log("test");
                    const administracionJS = administracionUI();
                    const ok = {
                        ok: administracionJS
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }
            }