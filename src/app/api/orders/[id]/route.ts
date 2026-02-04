import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true, product: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    if (order.userId !== user.id && !(await isAdmin())) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta orden" },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    return NextResponse.json(
      { error: "Error al obtener orden" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, quantity } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos: admin puede actualizar status, cliente puede actualizar cantidad
    const isUserAdmin = await isAdmin();
    
    if (!isUserAdmin && order.userId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para actualizar esta orden" },
        { status: 403 }
      );
    }

    const updateData: any = {};

    // Clientes solo pueden modificar cantidad si la orden está PENDING
    if (quantity !== undefined) {
      if (order.status !== "PENDING") {
        return NextResponse.json(
          { error: "Solo puedes modificar cantidad en órdenes pendientes" },
          { status: 400 }
        );
      }

      if (!order.product) {
        return NextResponse.json(
          { error: "Producto no encontrado" },
          { status: 404 }
        );
      }

      const newQuantity = parseInt(quantity);
      if (newQuantity < 1) {
        return NextResponse.json(
          { error: "La cantidad debe ser mayor a 0" },
          { status: 400 }
        );
      }

      const quantityDifference = newQuantity - order.quantity;

      if (quantityDifference > 0 && order.product.stock < quantityDifference) {
        return NextResponse.json(
          { error: "Stock insuficiente" },
          { status: 400 }
        );
      }

      updateData.quantity = newQuantity;
      updateData.total = order.product.price * newQuantity;

      // Actualizar stock del producto
      await prisma.product.update({
        where: { id: order.productId },
        data: { stock: order.product.stock - quantityDifference },
      });
    }

    // Solo admin puede cambiar status
    if (status !== undefined) {
      if (!isUserAdmin) {
        return NextResponse.json(
          { error: "No tienes permiso para cambiar el estado de la orden" },
          { status: 403 }
        );
      }

      const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Status inválido" },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { user: true, product: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }
    console.error("Error al actualizar orden:", error);
    return NextResponse.json(
      { error: "Error al actualizar orden" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const isUserAdmin = await isAdmin();

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (!isUserAdmin && order.userId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta orden" },
        { status: 403 }
      );
    }

    // Clientes solo pueden eliminar órdenes PENDING
    if (!isUserAdmin && order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Solo puedes eliminar órdenes pendientes" },
        { status: 400 }
      );
    }

    // Restaurar stock del producto
    await prisma.product.update({
      where: { id: order.productId },
      data: { stock: order.product.stock + order.quantity },
    });

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Orden eliminada correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }
    console.error("Error al eliminar orden:", error);
    return NextResponse.json(
      { error: "Error al eliminar orden" },
      { status: 500 }
    );
  }
}

