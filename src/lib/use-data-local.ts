"use client";
import { useEffect, useState } from "react";

/** Data civil do navegador, atualizada na virada do dia. */
export function useDataLocal() {
  const [data, setData] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function atualizar() {
      const agora = new Date();
      setData([agora.getFullYear(), String(agora.getMonth() + 1).padStart(2, "0"), String(agora.getDate()).padStart(2, "0")].join("-"));
      const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
      clearTimeout(timer);
      timer = setTimeout(atualizar, amanha.getTime() - agora.getTime());
    }
    atualizar();
    window.addEventListener("focus", atualizar);
    return () => { clearTimeout(timer); window.removeEventListener("focus", atualizar); };
  }, []);
  return data;
}
