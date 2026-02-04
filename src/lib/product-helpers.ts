/**
 * Utilidades para cálculos y operaciones comunes de productos
 */

export interface ProductTotal {
  subtotal: number;
  quantity: number;
  total: number;
}

/**
 * Calcula el total de una compra
 */
export function calculateTotal(price: number, quantity: number): number {
  return Math.round(price * quantity * 100) / 100;
}

/**
 * Formatea un precio como moneda
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Valida cantidad válida
 */
export function isValidQuantity(quantity: number, maxStock: number): boolean {
  return quantity >= 1 && quantity <= maxStock && Number.isInteger(quantity);
}

/**
 * Calcula descuento por cantidad
 * Descuento: 5% si >= 5 unidades, 10% si >= 10 unidades
 */
export function calculateDiscount(quantity: number, price: number): number {
  if (quantity >= 10) {
    return price * quantity * 0.1; // 10% descuento
  } else if (quantity >= 5) {
    return price * quantity * 0.05; // 5% descuento
  }
  return 0;
}

/**
 * Calcula total con descuento incluido
 */
export function calculateTotalWithDiscount(
  price: number,
  quantity: number
): ProductTotal {
  const subtotal = calculateTotal(price, quantity);
  const discount = calculateDiscount(quantity, price);
  return {
    subtotal,
    quantity,
    total: Math.round((subtotal - discount) * 100) / 100,
  };
}

/**
 * Obtiene categoría de rango de precio
 */
export function getPriceCategory(price: number): "budget" | "mid" | "premium" {
  if (price < 50) return "budget";
  if (price < 200) return "mid";
  return "premium";
}

/**
 * Calcula el promedio de productos en carrito
 */
export function calculateCartStats(
  products: Array<{ price: number; quantity: number }>
): {
  totalPrice: number;
  totalQuantity: number;
  averagePrice: number;
} {
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalPrice = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalQuantity,
    averagePrice:
      totalQuantity > 0
        ? Math.round((totalPrice / totalQuantity) * 100) / 100
        : 0,
  };
}

/**
 * Filtra productos por rango de precio
 */
export function filterByPriceRange<T extends { price: number }>(
  products: T[],
  minPrice: number,
  maxPrice: number
): T[] {
  return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * Ordena productos por precio
 */
export function sortByPrice<T extends { price: number }>(
  products: T[],
  order: "asc" | "desc" = "asc"
): T[] {
  return [...products].sort((a, b) =>
    order === "asc" ? a.price - b.price : b.price - a.price
  );
}

/**
 * Ordena productos por nombre
 */
export function sortByName<T extends { name: string }>(
  products: T[],
  order: "asc" | "desc" = "asc"
): T[] {
  return [...products].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, "es-ES");
    return order === "asc" ? comparison : -comparison;
  });
}

/**
 * Agrupa productos por categoría
 */
export function groupByCategory<T extends { category?: string }>(
  products: T[]
): Record<string, T[]> {
  return products.reduce(
    (acc, product) => {
      const category = product.category || "Sin categoría";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Busca productos por término
 */
export function searchProducts<
  T extends { name: string; description?: string }
>(products: T[], searchTerm: string): T[] {
  const term = searchTerm.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
  );
}

/**
 * Obtiene producto más caro
 */
export function getMostExpensive<T extends { price: number }>(
  products: T[]
): T | null {
  return products.length > 0
    ? products.reduce((max, p) => (p.price > max.price ? p : max))
    : null;
}

/**
 * Obtiene producto más barato
 */
export function getCheapest<T extends { price: number }>(
  products: T[]
): T | null {
  return products.length > 0
    ? products.reduce((min, p) => (p.price < min.price ? p : min))
    : null;
}

/**
 * Calcula estadísticas de productos
 */
export function getProductStats(
  products: Array<{ price: number }>
): {
  count: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalValue: number;
} {
  if (products.length === 0) {
    return {
      count: 0,
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      totalValue: 0,
    };
  }

  const prices = products.map((p) => p.price);
  const totalValue = prices.reduce((sum, p) => sum + p, 0);

  return {
    count: products.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgPrice: Math.round((totalValue / products.length) * 100) / 100,
    totalValue: Math.round(totalValue * 100) / 100,
  };
}
