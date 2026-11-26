# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Cotizaciones

El botón «Ir a pagar» abre la pasarela simulada de la tienda con los productos y el envío de la cotización. El pedido queda en «Mis pedidos» de la cuenta y el carrito de la tienda se conserva.

Las opciones de platos, vasos y cubiertos aparecen en el formulario según el catálogo. Al marcar una opción, se incorpora a la cotización con la cantidad recomendada, calculada a partir de `unidadesPorPaquete` y el número de personas.
