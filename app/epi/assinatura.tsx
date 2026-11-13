import { useRef, type PointerEvent } from "react";
import { Button } from "@/src/components/ui";
import type { Assinatura } from "./dados";

export function Tracos({ valor }: { valor: Assinatura }) {
  return <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    {valor.map((linha, i) => <polyline key={i} vectorEffect="non-scaling-stroke" strokeWidth="2" points={linha.map(([x,y]) => x*600+","+y*180).join(" ")} />)}
  </g>;
}
export function CampoAssinatura({ valor, mudar }: { valor: Assinatura; mudar: (valor: Assinatura) => void }) {
  const dedo = useRef<number | null>(null);
  const atual = useRef<Assinatura>(valor);
  function ponto(e: PointerEvent<SVGSVGElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect();
    const limitar = (n: number) => Math.max(0, Math.min(1,n));
    return [limitar((e.clientX-r.left)/r.width),limitar((e.clientY-r.top)/r.height)];
  }
  function guardar(v: Assinatura) { atual.current = v; mudar(v); }
  function terminar(e: PointerEvent<SVGSVGElement>) {
    if (dedo.current !== e.pointerId) return;
    dedo.current = null;
    guardar(atual.current.filter(linha => linha.length >= 2));
  }
  return <fieldset><legend className="text-sm font-medium">Assinatura do trabalhador</legend>
    <p className="mb-2 text-xs text-muted">Assine no quadro com o dedo, a caneta ou o mouse.</p>
    <svg aria-label="Área de assinatura" viewBox="0 0 600 180" preserveAspectRatio="none" className="h-36 w-full touch-none rounded-lg border border-line bg-cream-50 text-brand-900"
      onPointerDown={e => { if (dedo.current !== null || valor.length >= 32 || e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); dedo.current=e.pointerId; guardar([...atual.current,[ponto(e)]]); }}
      onPointerMove={e => {
        if (dedo.current !== e.pointerId) return;
        const linhas = atual.current.slice();
        let linha = linhas[linhas.length-1];
        if (linha.length >= 256) linha = linha.filter((_,i) => i%2 === 0);
        linhas[linhas.length-1] = [...linha,ponto(e)];
        guardar(linhas);
      }} onPointerUp={terminar} onPointerCancel={terminar}>
      <Tracos valor={valor} />
    </svg><Button variant="ghost" onClick={() => guardar([])}>Limpar assinatura</Button>
  </fieldset>;
}
