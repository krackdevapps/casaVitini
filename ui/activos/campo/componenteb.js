class ComponenteA extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          p {
            color: blue;
          }
        </style>
        <p>Este es el Componente A</p>
      `;
    }
  
    metodoDeComponenteA() {
      console.log('Método de Componente A ejecutado');
    }
  }
  
  customElements.define('componente-a', ComponenteA);
  export { ComponenteA }; // Exportar el componente
  