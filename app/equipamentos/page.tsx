import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Equipamentos } from "./equipamentos";
export default function EquipamentosPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Equipamentos" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Equipamentos /></main></div></div>;
}
