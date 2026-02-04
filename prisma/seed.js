const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function syncProductsFromFakeStore() {
  try {
    console.log("📦 Obteniendo productos de FakeStoreAPI...");
    const response = await fetch("https://fakestoreapi.com/products");
    const fakeStoreProducts = await response.json();

    console.log(`✅ ${fakeStoreProducts.length} productos obtenidos de FakeStoreAPI`);

    const createdProducts = [];
    for (const fakeProduct of fakeStoreProducts) {
      const product = await prisma.product.create({
        data: {
          name: fakeProduct.title,
          description: fakeProduct.description,
          price: fakeProduct.price,
          stock: Math.floor(Math.random() * 50) + 20, // Stock aleatorio entre 20-70
          imageUrl: fakeProduct.image,
        },
      });
      createdProducts.push(product);
    }

    return createdProducts;
  } catch (error) {
    console.error("❌ Error sincronizando productos de FakeStore:", error);
    return [];
  }
}

async function main() {
  console.log("🌱 Sembrando base de datos...");

  // Limpiar datos existentes
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const adminPassword = await hash("password123", 10);
  const customerPassword = await hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Juan Cliente",
      email: "cliente@example.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  console.log("✅ Usuarios creados:");
  console.log("  - Admin: admin@example.com / password123");
  console.log("  - Cliente: cliente@example.com / password123");

  // Obtener productos de FakeStoreAPI
  const products = await syncProductsFromFakeStore();

  if (products.length > 0) {
    console.log("✅ Productos de FakeStoreAPI cargados: " + products.length);

    // Crear una orden de ejemplo con el primer producto
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        productId: products[0].id,
        quantity: 1,
        total: products[0].price,
        status: "DELIVERED",
      },
    });

    console.log("✅ Orden de ejemplo creada");
  }

  console.log("\n🎉 Base de datos sembrada exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error sembrando la base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
