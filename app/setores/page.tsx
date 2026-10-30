import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Setores } from "./setores";
export default function SetoresPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Setores" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Setores /></main></div></div>;
}

