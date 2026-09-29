import { redirect } from "next/navigation";
import { UiKitPage } from "./ui-kit-page";
import { readViewer } from "@/lib/read-viewer";
import { memberHomePath } from "@/lib/viewer";

export const metadata = {
  title: "UI Kit · Internalização",
};

export default async function Page() {
  const viewer = await readViewer();
  if (viewer.role === "member") {
    redirect(memberHomePath(viewer.area));
  }
  return <UiKitPage />;
}
