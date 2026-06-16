import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axiosConfig";

interface SearchLead {
  id: string;
  name: string;
  phone: string;
  status: string;
}
interface SearchAlumn {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string;
}
interface SearchContract {
  id: string;
  name: string;
  alumn: { id: string; firstName: string; lastName: string };
}
interface SearchResults {
  leads: SearchLead[];
  alumns: SearchAlumn[];
  contracts: SearchContract[];
}

const EMPTY: SearchResults = { leads: [], alumns: [], contracts: [] };

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(EMPTY);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/search", { params: { q: query.trim() } });
        setResults(data);
        setOpen(true);
      } catch {
        setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const total = results.leads.length + results.alumns.length + results.contracts.length;

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <div ref={containerRef} className="relative w-full xl:w-[430px]">
      <div className="relative">
        <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
          <svg
            className="fill-gray-500 dark:fill-gray-400"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
              fill=""
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => total > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Buscar leads, alumnos, contratos..."
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
          <span>⌘</span>
          <span>K</span>
        </span>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[99999] mt-1 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
          {loading && (
            <p className="px-4 py-3 text-sm text-gray-400">Buscando...</p>
          )}

          {!loading && total === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Sin resultados</p>
          )}

          {!loading && results.leads.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.03]">
                Leads
              </p>
              {results.leads.map((lead) => (
                <button
                  key={lead.id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  onClick={() => handleSelect(`/leads/${lead.id}`)}
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {lead.name}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{lead.phone}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.alumns.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.03]">
                Alumnos
              </p>
              {results.alumns.map((alumn) => (
                <button
                  key={alumn.id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  onClick={() => handleSelect(`/alumns/${alumn.id}`)}
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {alumn.firstName} {alumn.lastName}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{alumn.documentNumber}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.contracts.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.03]">
                Contratos
              </p>
              {results.contracts.map((contract) => (
                <button
                  key={contract.id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  onClick={() => handleSelect(`/alumns/${contract.alumn?.id}`)}
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {contract.name}
                  </span>
                  {contract.alumn && (
                    <span className="shrink-0 text-xs text-gray-400">
                      {contract.alumn.firstName} {contract.alumn.lastName}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
