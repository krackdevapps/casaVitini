
import { describe, expect, test } from '@jest/globals';
import { administracionUI } from '../../../../src/application/administracion/componentes/administracionUI.mjs';
import { apartamentosDisponiblesConfigurados } from '../../../../src/application/administracion/componentes/apartamentosDisponiblesConfigurados.mjs';
import { calculadora } from '../../../../src/application/administracion/componentes/calculadora.mjs';

describe('components', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    test('administracionUI with ok', async () => {
        const newClient = {
            body: {},
            session: fakeAdminSession
        }
        const response = await administracionUI(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('apartment avaible cofigured with ok', async () => {
        const newClient = {
            body: {},
            session: fakeAdminSession
        }
        const response = await apartamentosDisponiblesConfigurados(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('server calc with ok', async () => {
        const newClient = {
            body: {
                numero1: "4",
                numero2: "10",
                operador: "+"
            },
            session: fakeAdminSession
        }
        const response = calculadora(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
