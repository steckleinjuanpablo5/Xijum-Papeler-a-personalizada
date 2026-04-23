import { products as baseProducts } from './products.js';

const notebookCustomization = {
  colors: ['Rosa', 'Beige', 'Lila', 'Azul', 'Verde', 'Negro'],
  materials: ['Pasta dura', 'Pasta flexible', 'Tela', 'Vinil'],
  extras: ['Hojas blancas', 'Hojas rayadas', 'Separador', 'Bolsa interior', 'Elástico'],
  allowCustomNote: true
};

const plannerCustomization = {
  colors: ['Rosa', 'Beige', 'Lila', 'Azul', 'Verde', 'Negro'],
  materials: ['Pasta dura', 'Pasta flexible', 'Tela', 'Vinil'],
  extras: ['Separadores', 'Stickers', 'Calendario', 'Tracker de hábitos', 'Bolsa interior'],
  allowCustomNote: true
};

export const products = baseProducts.map((product) => {
  if (product.category === 'libretas') {
    return {
      ...product,
      customizable: true,
      customizationOptions: notebookCustomization
    };
  }

  if (product.category === 'agendas-y-planeadores') {
    return {
      ...product,
      customizable: true,
      customizationOptions: plannerCustomization
    };
  }

  return {
    ...product,
    customizable: false
  };
});
