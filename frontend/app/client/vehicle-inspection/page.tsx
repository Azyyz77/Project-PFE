"use client";
// frontend/app/inspection/page.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { getMeta, drawBoundingBoxes, formatPredictions } from "@/lib/damageUtils";
import type { FormattedPrediction, RoboflowResponse } from "@/lib/damageUtils";

// ─── URL backend ──────────────────────────────────────────────────────────────
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// ─── Types locaux ─────────────────────────────────────────────────────────────
interface ReportMeta {
  date: string;
  fichier: string;
  total: number;
  critique: boolean;
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function InspectionPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState<boolean>(false);
  const [result,    setResult]    = useState<RoboflowResponse | null>(null);
  const [formatted, setFormatted] = useState<FormattedPrediction[]>([]);
  const [error,     setError]     = useState<string | null>(null);

  const imgRef    = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redessiner les bounding boxes après chaque résultat
  useEffect(() => {
    if (!result?.predictions || !imgRef.current || !canvasRef.current) return;
    const img  = imgRef.current;
    const draw = () => drawBoundingBoxes(canvasRef.current!, img, result.predictions);
    if (img.complete) draw();
    else img.onload = draw;
  }, [result, preview]);

  // ── Gestion fichier ───────────────────────────────────────────────────────
  const applyFile = (f: File | null | undefined) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setFormatted([]);
    setError(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    applyFile(e.target.files?.[0]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    applyFile(e.dataTransfer.files?.[0]);
  }, []);

  // ── Appel API backend ─────────────────────────────────────────────────────
  //
  //  Route backend : POST http://localhost:3000/detect/upload
  //  Body          : multipart/form-data — champ "image"
  //  Si tu as ajouté app.use('/api/detect', detectRoutes) → change en /api/detect/upload
  //
  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFormatted([]);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${BACKEND_URL}/api/detect/upload`, {
        method: "POST",
        body:   formData,
      });

      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

      const data: RoboflowResponse = await res.json();
      setResult(data);
      setFormatted(formatPredictions(data.predictions ?? []));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // ── Rapport ───────────────────────────────────────────────────────────────
  const reportMeta: ReportMeta | null = result
    ? {
        date:     new Date().toLocaleString("fr-FR"),
        fichier:  file?.name ?? "",
        total:    result.total ?? 0,
        critique: formatted.some((d) => d.severity === "Critique"),
      }
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-800 print:bg-white print:text-black">

      {/* ═══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="mx-auto max-w-5xl px-6 pt-6 print:hidden">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f2f5d] via-[#173d7a] to-[#1d4f98] px-6 py-6 text-white shadow-[0_18px_40px_rgba(15,47,93,0.35)] transition-shadow duration-500">
          <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-24 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm font-bold text-sm ring-1 ring-white/20">
                SAV
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Inspection Véhicule</p>
                <p className="text-xs text-blue-100/80">Détection IA — Roboflow YOLOv11</p>
              </div>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
              mAP@50 · 78.2%
            </span>
          </div>
        </div>
      </header>

      {/* ═══ MAIN ════════════════════════════════════════════════════════════ */}
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8 print:hidden">

        {/* ── Zone upload ──────────────────────────────────────────────── */}
        <section
          className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 shadow-sm
            ${preview
              ? "border-[#0f2543] bg-[#0f2543]/5"
              : "border-slate-200 bg-white hover:border-[#0f2543]/40 hover:shadow-md"}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInput}
          />
          {preview ? (
            <div className="flex items-center justify-center gap-3 text-[#0f2543]">
              <span className="text-2xl">✓</span>
              <div className="text-left">
                <p className="text-sm font-semibold">{file?.name}</p>
                <p className="mt-0.5 text-xs text-[#1d4f98]">Clique pour changer l&apos;image</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-4">📷</div>
              <p className="font-semibold text-slate-800">Glisse une photo de véhicule ici</p>
              <p className="mt-1 text-sm text-slate-500">ou clique pour sélectionner</p>
              <p className="mt-3 text-xs text-slate-400">JPG · PNG · WEBP — max 20 MB</p>
            </>
          )}
        </section>

        {/* ── Bouton analyser ──────────────────────────────────────────── */}
        {preview && (
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#0f2543] to-[#1d4f98] py-3.5 text-sm font-bold tracking-widest uppercase text-white transition-all hover:shadow-lg active:scale-[.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Analyse en cours...
              </span>
            ) : (
              "🔍  Analyser le véhicule"
            )}
          </button>
        )}

        {/* ── Erreur ───────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Erreur de détection</p>
              <p className="mt-0.5 text-xs text-red-500">{error}</p>
              <p className="mt-1 text-xs text-red-600">
                Vérifier que le backend tourne sur {BACKEND_URL}
              </p>
            </div>
          </div>
        )}

        {/* ── Image + canvas bounding boxes ────────────────────────────── */}
        {preview && (
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <img
              ref={imgRef}
              src={preview}
              alt="Véhicule inspecté"
              className="w-full block"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl animate-pulse mb-3">🔍</div>
                  <p className="text-sm text-slate-700">Analyse en cours...</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Résultats ────────────────────────────────────────────────── */}
        {result && reportMeta && (
          <section className="space-y-4">

            {/* Bannière résumé */}
            <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 shadow-sm
              ${reportMeta.critique
                ? "bg-red-50 border-red-200"
                : reportMeta.total > 0
                  ? "bg-amber-50 border-amber-200"
                  : "bg-emerald-50 border-emerald-200"}`}
            >
              <span className="text-3xl">
                {reportMeta.critique ? "🔴" : reportMeta.total > 0 ? "🟡" : "🟢"}
              </span>
              <div className="flex-1">
                <p className="font-bold text-base">
                  {reportMeta.total === 0
                    ? "Aucun dommage détecté"
                    : `${reportMeta.total} dommage${reportMeta.total > 1 ? "s" : ""} détecté${reportMeta.total > 1 ? "s" : ""}`}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {reportMeta.date} · {reportMeta.fichier}
                </p>
              </div>
              {reportMeta.critique && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  CRITIQUE
                </span>
              )}
            </div>

            {/* Tableau des dommages */}
            {formatted.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-4 gap-2 bg-slate-50 px-5 py-2.5 text-xs uppercase tracking-widest text-slate-500">
                  <span>Type</span>
                  <span>Sévérité</span>
                  <span>Confiance</span>
                  <span>Position (px)</span>
                </div>
                {formatted.map((d, i) => {
                  const meta = getMeta(d.class);
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-4 items-center gap-2 border-t border-slate-200 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        {d.label}
                      </span>
                      <span
                        className="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: meta.color + "22", color: meta.color }}
                      >
                        {d.severity}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${d.confidence}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs tabular-nums text-slate-500">
                          {d.confidence}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        x:{d.x} y:{d.y}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bouton rapport PDF */}
            <button
              onClick={() => window.print()}
              className="w-full rounded-xl border border-slate-200 bg-gradient-to-r from-[#0f2543] to-[#1d4f98] py-3 text-sm font-bold tracking-widest uppercase text-white transition-all hover:shadow-lg"
            >
              🖨️  Générer le rapport PDF
            </button>
          </section>
        )}
      </main>

      {/* ═══ RAPPORT PDF ════════════════════════════════════════════════════ */}
      {result && reportMeta && (
        <div className="hidden print:block p-10 font-sans text-sm text-black bg-white">
          <div className="border-b-2 border-black pb-5 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Rapport d&apos;Inspection Véhicule</h1>
              <p className="text-gray-500 text-xs mt-1">
                Système SAV — Détection IA Roboflow · YOLOv11 · mAP@50 78.2%
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p className="font-semibold text-black">{reportMeta.date}</p>
              <p>Fichier : {reportMeta.fichier}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Dommages détectés", value: String(reportMeta.total) },
              { label: "Statut global",     value: reportMeta.critique ? "⚠️ CRITIQUE" : reportMeta.total > 0 ? "MODÉRÉ" : "✓ RAS" },
              { label: "Modèle IA",         value: "YOLOv11 · 78.2%" },
            ].map((c) => (
              <div key={c.label} className="border rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>

          {formatted.length > 0 && (
            <>
              <h2 className="font-bold text-base mb-3">Détail des dommages détectés</h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {["#", "Type", "Classe IA", "Sévérité", "Confiance", "Position"].map((h) => (
                      <th key={h} className="border border-gray-300 px-3 py-2 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formatted.map((d, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{d.label}</td>
                      <td className="border border-gray-300 px-3 py-2 font-mono text-xs text-gray-500">{d.class}</td>
                      <td className="border border-gray-300 px-3 py-2">{d.severity}</td>
                      <td className="border border-gray-300 px-3 py-2">{d.confidence}%</td>
                      <td className="border border-gray-300 px-3 py-2 font-mono text-xs text-gray-500">x:{d.x} y:{d.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="mt-16 pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
            <span>Document généré automatiquement — Système SAV</span>
            <span>{reportMeta.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}