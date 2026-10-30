import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Empresas } from "./empresas";

export default function EmpresasPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Empresas" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto w-full max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Empresas /></main></div></div>;
}
