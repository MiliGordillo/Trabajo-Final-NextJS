import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    let orders;
    if (await isAdmin()) {
      orders = await prisma.order.findMany({
        include: { user: true, product: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { user: true, product: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "ProductId y quantity son requeridos" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    const total = product.price * quantity;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId,
        quantity: parseInt(quantity),
        total,
        status: "PENDING",
      },
      include: { user: true, product: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { stock: product.stock - quantity },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden:", error);
    return NextResponse.json(
      { error: "Error al crear orden" },
      { status: 500 }
    );
  }
}

