// En Next.js App Router, manejamos la autenticación de Replit a través de headers
import { headers } from "next/headers";

export async function getReplitUser() {
  const headersList = await headers();
  const userId = headersList.get("x-replit-user-id");
  const userName = headersList.get("x-replit-user-name");
  const userRoles = headersList.get("x-replit-user-roles");

  if (!userId) return null;

  return {
    id: userId,
    name: userName,
    roles: userRoles ? userRoles.split(",") : [],
  };
}

export async function isAdmin() {
  const user = await getReplitUser();
  if (!user) return false;
  // En Replit, podemos usar roles o simplemente verificar si el ID coincide con el admin configurado
  return user.roles.includes("admin") || process.env.ADMIN_USER_ID === user.id;
}
