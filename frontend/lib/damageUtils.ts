// frontend/lib/damageUtils.ts

// ─── Types exportés ───────────────────────────────────────────────────────────

export interface DamageMeta {
  label:    string;
  color:    string;
  severity: string;
  emoji:    string;
}

export interface RoboflowPrediction {
  class:      string;
  confidence: number;
  x:          number;
  y:          number;
  width:      number;
  height:     number;
}

export interface RoboflowResponse {
  success?:    boolean;
  total?:      number;
  predictions: RoboflowPrediction[];
  image?:      { width: number; height: number };
}

export interface FormattedPrediction {
  class:      string;
  label:      string;
  severity:   string;
  confidence: number;
  x:          number;
  y:          number;
  width:      number;
  height:     number;
}

// ─── Metadata par classe de dommage ──────────────────────────────────────────

const DAMAGE_META: Record<string, DamageMeta> = {
  scratch:      { label: "Rayure",        color: "#F59E0B", severity: "Mineur",   emoji: "🔶" },
  dent:         { label: "Bosse",         color: "#EF4444", severity: "Modéré",   emoji: "🔴" },
  crack:        { label: "Fissure",       color: "#8B5CF6", severity: "Sévère",   emoji: "🟣" },
  broken:       { label: "Brisé",         color: "#DC2626", severity: "Critique", emoji: "🚨" },
  damage:       { label: "Dommage",       color: "#F97316", severity: "Modéré",   emoji: "🟠" },
  hood:         { label: "Capot",         color: "#3B82F6", severity: "Zone",     emoji: "🔵" },
  trunk:        { label: "Coffre",        color: "#3B82F6", severity: "Zone",     emoji: "🔵" },
  wheel:        { label: "Roue",          color: "#6B7280", severity: "Zone",     emoji: "⚪" },
  front_bumper: { label: "Pare-chocs av", color: "#F97316", severity: "Modéré",   emoji: "🟠" },
  back_bumper:  { label: "Pare-chocs ar", color: "#F97316", severity: "Modéré",   emoji: "🟠" },
};

export const getMeta = (cls: string): DamageMeta =>
  DAMAGE_META[cls?.toLowerCase()] ?? {
    label: cls, color: "#6B7280", severity: "Inconnu", emoji: "⚪"
  };

// ─── Dessiner les bounding boxes sur un canvas HTML ──────────────────────────

export function drawBoundingBoxes(
  canvas:     HTMLCanvasElement,
  imgElement: HTMLImageElement,
  predictions: RoboflowPrediction[]
): void {
  if (!canvas || !imgElement || !predictions?.length) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { naturalWidth: nw, naturalHeight: nh } = imgElement;
  const { width: dw, height: dh } = imgElement.getBoundingClientRect();

  canvas.width  = dw;
  canvas.height = dh;

  const scaleX = dw / nw;
  const scaleY = dh / nh;

  ctx.clearRect(0, 0, dw, dh);

  predictions.forEach((p) => {
    const meta = getMeta(p.class);
    const x    = (p.x - p.width  / 2) * scaleX;
    const y    = (p.y - p.height / 2) * scaleY;
    const w    = p.width  * scaleX;
    const h    = p.height * scaleY;

    // Rectangle
    ctx.strokeStyle = meta.color;
    ctx.lineWidth   = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Fond semi-transparent
    ctx.fillStyle = meta.color + "20";
    ctx.fillRect(x, y, w, h);

    // Label
    ctx.font = "bold 12px monospace";
    const label = `${meta.label} ${Math.round(p.confidence * 100)}%`;
    const textW = ctx.measureText(label).width + 10;
    ctx.fillStyle = meta.color;
    ctx.fillRect(x, y - 22, textW, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + 5, y - 7);
  });
}

// ─── Formatter les predictions pour le tableau et le rapport ─────────────────

export function formatPredictions(
  predictions: RoboflowPrediction[]
): FormattedPrediction[] {
  return predictions.map((p) => ({
    class:      p.class,
    label:      getMeta(p.class).label,
    severity:   getMeta(p.class).severity,
    confidence: Math.round(p.confidence * 100),
    x:          Math.round(p.x),
    y:          Math.round(p.y),
    width:      Math.round(p.width),
    height:     Math.round(p.height),
  }));
}