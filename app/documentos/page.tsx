import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Documentos } from "./documentos";
export default function DocumentosPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Documentos" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Documentos /></main></div></div>;
}
