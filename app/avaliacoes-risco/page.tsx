import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Avaliacoes } from "./avaliacoes";
export default function AvaliacoesPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Avaliações de risco" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Avaliacoes /></main></div></div>;
}
