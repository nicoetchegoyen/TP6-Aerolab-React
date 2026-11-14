// Datos inventados exclusivamente para practicar sin credenciales.
// Nunca se usan como reemplazo silencioso de una API que falla.
export const productosDemo = [
  {
    _id: "auriculares",
    name: "Auriculares de estudio",
    category: "Audio",
    cost: 1200,
  },
  {
    _id: "teclado",
    name: "Teclado compacto",
    category: "Accesorios",
    cost: 1800,
  },
  {
    _id: "camara",
    name: "Cámara instantánea",
    category: "Fotografía",
    cost: 4500,
  },
  { _id: "parlante", name: "Parlante portátil", category: "Audio", cost: 2500 },
  {
    _id: "mouse",
    name: "Mouse inalámbrico",
    category: "Accesorios",
    cost: 800,
  },
  {
    _id: "monitor",
    name: "Monitor de escritorio",
    category: "Pantallas",
    cost: 7500,
  },
  {
    _id: "tablet",
    name: "Tablet de lectura",
    category: "Pantallas",
    cost: 5000,
  },
  { _id: "microfono", name: "Micrófono USB", category: "Audio", cost: 2000 },
  {
    _id: "funda",
    name: "Funda para notebook",
    category: "Accesorios",
    cost: 500,
  },
];
let usuario = { name: "Estudiante de práctica", points: 3000 };
let historial = [];

export async function consultarDemo(ruta, datos) {
  if (ruta === "/products") return productosDemo;
  if (ruta === "/user/me") return { ...usuario };
  if (ruta === "/user/history") return [...historial];
  if (ruta === "/user/points") {
    if (![1000, 5000, 7500].includes(datos.amount))
      throw new Error("Cantidad no permitida.");
    usuario = { ...usuario, points: usuario.points + datos.amount };
    return { message: "Puntos de práctica agregados" };
  }
  if (ruta === "/redeem") {
    const producto = productosDemo.find((item) => item._id === datos.productId);
    if (!producto || usuario.points < producto.cost)
      throw new Error("No tenés puntos suficientes.");
    usuario = { ...usuario, points: usuario.points - producto.cost };
    historial = [
      ...historial,
      { ...producto, createDate: new Date().toISOString() },
    ];
    return { message: "Canje de práctica realizado" };
  }
  throw new Error("Ruta de práctica desconocida.");
}
