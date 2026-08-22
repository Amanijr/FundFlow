import { redirect } from "next/navigation";

export default function ReceiveGiftPage() {
  redirect("/donations/new");
}
