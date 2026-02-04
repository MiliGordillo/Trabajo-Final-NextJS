// src/app/orders/[id]/page.tsx
import { revalidatePath } from "next/cache";

async function getOrder(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  async function update(formData: FormData) {
    "use server";
    const status = String(formData.get("status"));
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    revalidatePath(`/orders/${id}`);
  }

  async function remove() {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${id}`, { method: "DELETE" });
    revalidatePath("/orders");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Pedido</h1>
      <p>Usuario: {order.user?.name}</p>
      <p>Producto: {order.product?.name}</p>
      <p>Cantidad: {order.quantity}</p>

      <form action={update} className="mt-4 flex gap-2">
        <select name="status" defaultValue={order.status} className="border p-2">
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button className="bg-black text-white px-3 py-2">Actualizar</button>
      </form>

      <form action={remove} className="mt-4">
        <button className="bg-red-600 text-white px-3 py-2">Eliminar</button>
      </form>
    </div>
  );
}
