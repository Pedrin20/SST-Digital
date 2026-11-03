import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Vinculos } from "./vinculos";
export default function VinculosPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Usuários" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Vinculos /></main></div></div>;
}
