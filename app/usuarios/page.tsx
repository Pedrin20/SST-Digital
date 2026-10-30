import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Usuarios } from "./usuarios";

export default function UsuariosPage() {
  return <div className="min-h-screen bg-cream"><Sidebar active="Usuários" /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto w-full max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><Usuarios /></main></div></div>;
}
