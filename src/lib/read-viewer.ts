import { redirect } from "next/navigation";
import { isArea, type Area } from "@/domain/status-machine";
import { readAppSession } from "@/lib/app-session";
import { findUser, userCanEnter } from "@/lib/users";
import type { Viewer } from "@/lib/viewer";

export async function readViewer(): Promise<Viewer> {
  const session = await readAppSession();
  if (!session) {
    redirect("/login");
  }
  const user = await findUser(session.email);
  if (!user || !userCanEnter(user)) {
    redirect(`/sem-acesso?email=${encodeURIComponent(session.email)}`);
  }
  return {
    role: user.role === "admin" ? "admin" : "member",
    area: (isArea(user.area) ? user.area : "comercial") as Area,
    name: user.name || session.nome,
    email: user.email,
  };
}
