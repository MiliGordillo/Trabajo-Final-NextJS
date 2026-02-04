/**
 * Utilidades para integración con FakeStoreAPI
 */

export interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

const FAKESTORE_API_URL = "https://fakestoreapi.com";

/**
 * Obtiene todos los productos de FakeStoreAPI
 */
export async function getAllProducts(): Promise<FakeStoreProduct[]> {
  try {
    const response = await fetch(`${FAKESTORE_API_URL}/products`);
    if (!response.ok) throw new Error("Error fetching products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products from FakeStore:", error);
    return [];
  }
}

/**
 * Obtiene un producto específico de FakeStoreAPI
 */
export async function getProductById(id: number): Promise<FakeStoreProduct | null> {
  try {
    const response = await fetch(`${FAKESTORE_API_URL}/products/${id}`);
    if (!response.ok) throw new Error("Product not found");
    return await response.json();
  } catch (error) {
    console.error("Error fetching product from FakeStore:", error);
    return null;
  }
}

/**
 * Obtiene productos por categoría
 */
export async function getProductsByCategory(category: string): Promise<FakeStoreProduct[]> {
  try {
    const response = await fetch(`${FAKESTORE_API_URL}/products/category/${category}`);
    if (!response.ok) throw new Error("Category not found");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

/**
 * Obtiene todas las categorías disponibles
 */
export async function getAllCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${FAKESTORE_API_URL}/products/categories`);
    if (!response.ok) throw new Error("Error fetching categories");
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories from FakeStore:", error);
    return [];
  }
}

/**
 * Obtiene productos ordenados (sort: 'asc' o 'desc')
 */
export async function getSortedProducts(sort: "asc" | "desc" = "asc"): Promise<FakeStoreProduct[]> {
  try {
    const response = await fetch(`${FAKESTORE_API_URL}/products?sort=${sort}`);
    if (!response.ok) throw new Error("Error fetching sorted products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching sorted products:", error);
    return [];
  }
}
