import { ComponenteA } from './componenteA.js'; // Importar el componenteA

class ComponenteB extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        p {
          color: green;
        }
      </style>
      <p>Este es el Componente B</p>
      <componente-a id="compA"></componente-a> <!-- Insertar componenteA dentro de componenteB -->
    `;
  }

  connectedCallback() {
    const componenteA = this.shadowRoot.getElementById('compA');
    if (componenteA) {
      // Acceder al método de ComponenteA
      componenteA.metodoDeComponenteA();
    }
  }
}

customElements.define('componente-b', ComponenteB);
