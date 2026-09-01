import { useState } from "react";
import Flatpickr from "react-flatpickr";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import { CalenderIcon } from "../../icons";
import axiosInstance from "../../axios/axiosConfig";
import jsPDF from "jspdf";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface SellerRow {
  name: string;
  amount: number;
  contracts: number;
}

interface BranchGroup {
  branchName: string;
  totalAmount: number;
  totalContracts: number;
  sellers: SellerRow[];
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + " €";

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function VentasVendedoresTab() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sedeFilter, setSedeFilter] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<BranchGroup[]>([]);
  const [hasData, setHasData] = useState(false);

  const applyQuickFilter = (filter: string) => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (filter) {
      case "Hoy":
        start = end = today;
        break;
      case "Esta semana": {
        const first = new Date(today);
        const day = today.getDay() || 7;
        first.setDate(today.getDate() - (day - 1));
        start = first;
        end = today;
        break;
      }
      case "Este mes":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case "Mes pasado":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }
    if (start && end) {
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  };

  const aggregate = (contracts: any[]): BranchGroup[] => {
    const filtered = sedeFilter
      ? contracts.filter((c) =>
          (c.branch?.name ?? "")
            .toLowerCase()
            .includes(sedeFilter.toLowerCase())
        )
      : contracts;

    const branchMap = new Map<string, Map<string, SellerRow>>();

    for (const c of filtered) {
      const branchName = c.branch?.name ?? "Sin sede";
      const sellerName = c.user
        ? `${c.user.firstName} ${c.user.lastName}`
        : "Sin vendedor";
      const amount = Number(c.coursePrice) || 0;

      if (!branchMap.has(branchName)) branchMap.set(branchName, new Map());
      const sellerMap = branchMap.get(branchName)!;

      if (!sellerMap.has(sellerName))
        sellerMap.set(sellerName, { name: sellerName, amount: 0, contracts: 0 });

      const seller = sellerMap.get(sellerName)!;
      seller.amount += amount;
      seller.contracts += 1;
    }

    return Array.from(branchMap.entries())
      .map(([branchName, sellerMap]) => {
        const sellers = Array.from(sellerMap.values()).sort(
          (a, b) => b.amount - a.amount
        );
        return {
          branchName,
          sellers,
          totalAmount: sellers.reduce((s, x) => s + x.amount, 0),
          totalContracts: sellers.reduce((s, x) => s + x.contracts, 0),
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const fetchAndAggregate = async () => {
    if (!startDate || !endDate) {
      setError("Selecciona una fecha de inicio y fin");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await axiosInstance.get("contracts/reports", {
        params: { startDate, endDate, limit: 9999, page: 1 },
      });

      setGroups(aggregate(data.contracts));
      setHasData(true);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const totalGeneral = groups.reduce(
    (acc, g) => ({
      amount: acc.amount + g.totalAmount,
      contracts: acc.contracts + g.totalContracts,
    }),
    { amount: 0, contracts: 0 }
  );

  // ─── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      "SEDE;VENDEDOR;IMPORTE VENDIDO;CONTRATOS VENDIDOS;IMPORTE TOTAL SEDE",
    ];

    for (const g of groups) {
      for (const s of g.sellers) {
        rows.push(
          `"${g.branchName}";"${s.name}";${s.amount.toFixed(2)};${s.contracts};${g.totalAmount.toFixed(2)}`
        );
      }
    }

    rows.push(
      `"TOTAL GENERAL";"";${totalGeneral.amount.toFixed(2)};${totalGeneral.contracts};`
    );

    const bom = "﻿";
    const blob = new Blob([bom + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-ventas-${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── PDF export ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    // Landscape A4: 297×210mm — content width 269mm, plenty of room for 5 cols
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();   // 297
    const pageH = doc.internal.pageSize.getHeight();  // 210
    const margin = 14;
    const contentW = pageW - margin * 2;              // 269

    // Column x positions (cumulative)
    const C = {
      sede:       margin,           // 14  → width 44
      vendor:     margin + 44,      // 58  → width 74
      amount:     margin + 118,     // 132 → width 52
      amountSede: margin + 170,     // 184 → width 52
      contracts:  margin + 222,     // 236 → width 47  (right edge 283 = 297-14 ✓)
    };

    const ROW_H   = 8;
    const HEAD_H  = 9;
    const BANNER_H = 24;

    // Truncate text to fit a column width (adds "…" if needed)
    const truncate = (text: string, maxMm: number, fontSize: number): string => {
      doc.setFontSize(fontSize);
      const parts = doc.splitTextToSize(text, maxMm) as string[];
      if (parts.length <= 1) return text;
      // Too long — shorten until it fits
      let s = text;
      while (s.length > 1 && (doc.splitTextToSize(s + "…", maxMm) as string[]).length > 1) {
        s = s.slice(0, -1);
      }
      return s + "…";
    };

    // ── Draw table column headers ──────────────────────────────────────────
    let y = 0;

    const drawTableHeader = () => {
      doc.setFillColor(51, 65, 85);
      doc.rect(margin, y, contentW, HEAD_H, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("SEDE",              C.sede + 2,       y + 6);
      doc.text("VENDEDOR",          C.vendor + 2,     y + 6);
      doc.text("IMPORTE VENDIDO",   C.amount + 2,     y + 6);
      doc.text("IMPORTE POR SEDE",  C.amountSede + 2, y + 6);
      doc.text("CONTRATOS",         C.contracts + 2,  y + 6);
      doc.setTextColor(0, 0, 0);
      y += HEAD_H + 1;
    };

    // ── Page: header banner + optional table header repeat ─────────────────
    const startPage = (isFirstPage: boolean) => {
      if (isFirstPage) {
        // Dark banner
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageW, BANNER_H, "F");

        // School name
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("ESMERA SCHOOL", margin, 10);

        // Report title
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text("Reporte de Ventas por Vendedor", margin, 17);

        // Period info (right-aligned)
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        const sedeLabel = sedeFilter ? `Sede: ${sedeFilter}` : "Todas las sedes";
        doc.text(`${startDate}  —  ${endDate}   ·   ${sedeLabel}`, pageW - margin, 10, { align: "right" });
        doc.text(
          `Generado: ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`,
          pageW - margin, 17, { align: "right" }
        );

        // Summary strip
        const stripY = BANNER_H + 1;
        const cardW  = 62;
        const cardH  = 13;
        const cards  = [
          { label: "TOTAL VENDIDO",    value: fmtEur(totalGeneral.amount) },
          { label: "TOTAL CONTRATOS",  value: String(totalGeneral.contracts) },
          { label: "VENDEDORES",        value: String(groups.reduce((s, g) => s + g.sellers.length, 0)) },
        ];
        cards.forEach((card, i) => {
          const cx = margin + i * (cardW + 4);
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(cx, stripY, cardW, cardH, 2, 2, "F");
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(card.label, cx + 4, stripY + 4.5);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(card.value, cx + 4, stripY + 10.5);
        });

        y = stripY + cardH + 4;
      } else {
        // Continuation pages: small banner
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageW, 10, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("ESMERA SCHOOL  —  Reporte de Ventas por Vendedor", margin, 7);
        y = 13;
      }

      drawTableHeader();
    };

    // ── Overflow guard ─────────────────────────────────────────────────────
    const ensureSpace = (needed: number, isFirstPage: boolean) => {
      if (y + needed > pageH - 12) {
        // Footer on current page
        addFooter();
        doc.addPage();
        startPage(false);
        return false; // caller can ignore this return
      }
      return true;
    };

    const addFooter = () => {
      const pg = (doc.internal as any).getCurrentPageInfo().pageNumber;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Esmera School · Documento confidencial", margin, pageH - 5);
      doc.text(`Página ${pg}`, pageW - margin, pageH - 5, { align: "right" });
    };

    // ── Build pages ────────────────────────────────────────────────────────
    startPage(true);
    let rowAlt = false;

    for (const g of groups) {
      // Branch label
      ensureSpace(ROW_H * 2, false);
      doc.setFillColor(240, 253, 244);
      doc.rect(margin, y, contentW, 7, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 101, 52);
      doc.text(g.branchName.toUpperCase(), C.sede + 3, y + 5);
      y += 7;

      for (const s of g.sellers) {
        ensureSpace(ROW_H, false);

        doc.setFillColor(rowAlt ? 248 : 255, rowAlt ? 250 : 255, rowAlt ? 252 : 255);
        doc.rect(margin, y, contentW, ROW_H, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);

        const sedeText   = truncate(g.branchName, 40, 9);
        const vendorText = truncate(s.name, 70, 9);

        doc.text(sedeText,           C.sede + 3,       y + 5.5);
        doc.text(vendorText,         C.vendor + 3,     y + 5.5);
        doc.text(fmtEur(s.amount),   C.amount + 3,     y + 5.5);
        doc.text(fmtEur(g.totalAmount), C.amountSede + 3, y + 5.5);
        doc.text(String(s.contracts), C.contracts + 3, y + 5.5);

        // Subtle row separator
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + ROW_H, margin + contentW, y + ROW_H);

        y += ROW_H;
        rowAlt = !rowAlt;
      }

      // Branch subtotal
      ensureSpace(ROW_H + 2, false);
      doc.setFillColor(187, 247, 208);
      doc.rect(margin, y, contentW, ROW_H + 1, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 78, 59);
      doc.text(`Subtotal ${g.branchName}`, C.vendor + 3, y + 6);
      doc.text(fmtEur(g.totalAmount),      C.amount + 3,    y + 6);
      doc.text(String(g.totalContracts),   C.contracts + 3, y + 6);
      y += ROW_H + 4;
      rowAlt = false;
    }

    // Grand total
    ensureSpace(12, false);
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentW, 11, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL GENERAL",           C.vendor + 3,    y + 7.5);
    doc.text(fmtEur(totalGeneral.amount), C.amount + 3,  y + 7.5);
    doc.text(String(totalGeneral.contracts), C.contracts + 3, y + 7.5);
    y += 11;

    // Footer on every page
    const totalPgs = (doc.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPgs; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Esmera School · Documento confidencial", margin, pageH - 5);
      doc.text(`Página ${p} de ${totalPgs}`, pageW - margin, pageH - 5, { align: "right" });
    }

    doc.save(`reporte-ventas-${startDate}_${endDate}.pdf`);
  };

  const handleExport = () => {
    if (exportFormat === "pdf") exportPDF();
    else exportCSV();
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="px-5 mb-6 space-y-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Ventas por Vendedor
          </h3>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Start date */}
            <div className="flex flex-col">
              <Label>Fecha de Inicio</Label>
              <div className="relative w-full">
                <Flatpickr
                  value={startDate}
                  onChange={(dates: Date[]) =>
                    setStartDate(dates[0]?.toISOString().split("T")[0] || "")
                  }
                  options={{ dateFormat: "Y-m-d" }}
                  placeholder="Seleccionar fecha"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
            </div>

            {/* End date */}
            <div className="flex flex-col">
              <Label>Fecha de Fin</Label>
              <div className="relative w-full">
                <Flatpickr
                  value={endDate}
                  onChange={(dates: Date[]) =>
                    setEndDate(dates[0]?.toISOString().split("T")[0] || "")
                  }
                  options={{ dateFormat: "Y-m-d" }}
                  placeholder="Seleccionar fecha"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
            </div>

            {/* Sede filter */}
            <div className="flex flex-col">
              <Label>Sede</Label>
              <select
                value={sedeFilter}
                onChange={(e) => setSedeFilter(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 focus:outline-none focus:ring"
              >
                <option value="">Todas las sedes</option>
                <option value="Madrid">Madrid</option>
                <option value="Logroño">Logroño</option>
              </select>
            </div>

            {/* Export format */}
            <div className="flex flex-col">
              <Label>Formato</Label>
              <div className="flex h-11 items-center gap-5 rounded-lg border border-gray-300 px-4 dark:border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="pdf"
                    checked={exportFormat === "pdf"}
                    onChange={() => setExportFormat("pdf")}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    PDF
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === "csv"}
                    onChange={() => setExportFormat("csv")}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Excel (CSV)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick filters + action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {["Hoy", "Esta semana", "Este mes", "Mes pasado"].map((label) => (
                <button
                  key={label}
                  onClick={() => applyQuickFilter(label)}
                  className="rounded-full border px-4 py-2 text-sm font-medium text-gray-700 bg-white shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:dark:bg-gray-700"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={fetchAndAggregate}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Generar"}
              </Button>

              {hasData && groups.length > 0 && (
                <Button variant="primary" onClick={handleExport}>
                  Descargar {exportFormat === "pdf" ? "PDF" : "Excel"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <SpinnerThree />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Cargando datos...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        ) : !hasData ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Selecciona un rango de fechas y pulsa "Generar" para ver el
              reporte
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No hay contratos para el período seleccionado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "SEDE",
                    "VENDEDOR",
                    "IMPORTE VENDIDO",
                    "IMPORTE POR SEDE",
                    "CONTRATOS",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      isHeader
                      className="px-4 py-3 font-semibold text-gray-700 text-start text-sm dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50"
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {groups.map((g) => (
                  <>
                    {g.sellers.map((s, si) => (
                      <TableRow
                        key={`${g.branchName}-${s.name}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {si === 0 ? (
                            g.branchName
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">
                              ↳
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                          {s.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                          {fmtEur(s.amount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm tabular-nums">
                          {si === 0 ? (
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              {fmtEur(g.totalAmount)}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400 tabular-nums">
                          {s.contracts}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Branch subtotal */}
                    <TableRow className="bg-emerald-50 dark:bg-emerald-900/20">
                      <TableCell className="px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                        Subtotal
                      </TableCell>
                      <TableCell className="px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        {g.branchName}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                        {fmtEur(g.totalAmount)}
                      </TableCell>
                      <TableCell className="px-4 py-2" />
                      <TableCell className="px-4 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                        {g.totalContracts}
                      </TableCell>
                    </TableRow>
                  </>
                ))}

                {/* Grand total */}
                <TableRow className="bg-gray-900 dark:bg-gray-950">
                  <TableCell className="px-4 py-3 text-sm font-bold text-white uppercase tracking-wide">
                    Total general
                  </TableCell>
                  <TableCell className="px-4 py-3" />
                  <TableCell className="px-4 py-3 text-sm font-bold text-white tabular-nums">
                    {fmtEur(totalGeneral.amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3" />
                  <TableCell className="px-4 py-3 text-sm font-bold text-white tabular-nums">
                    {totalGeneral.contracts}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
