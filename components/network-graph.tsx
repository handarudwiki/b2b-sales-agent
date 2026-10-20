import { PiTarget } from "react-icons/pi";
import type { ContactKind, RelationshipType } from "@prisma/client";
import { contactKindLabels } from "@/lib/labels";
import { relationshipTypeLabels } from "@/lib/graph";
import { contactKindColor, initials } from "./tokens";

type GraphContact = {
  id: string;
  name: string;
  kind: ContactKind;
  org: string | null;
  prospectId: string | null;
};

type GraphEdge = {
  id: string;
  fromId: string;
  toId: string;
  strength: number;
  type: RelationshipType;
};

type Props = {
  contacts: GraphContact[];
  edges: GraphEdge[];
  prospects: { id: string; name: string }[];
  paths: { prospectId: string; nodeIds: string[] }[];
};

const W = 1200;
const PAD_X = 120;
const TOP = 82;
const ROW = 104;
const R = 20;

const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function NetworkGraph({ contacts, edges, prospects, paths }: Props) {
  const ids = new Set(contacts.map((c) => c.id));
  const adj = new Map<string, Set<string>>();
  const connect = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  const validEdges = edges.filter((e) => ids.has(e.fromId) && ids.has(e.toId));
  for (const e of validEdges) {
    connect(e.fromId, e.toId);
    connect(e.toId, e.fromId);
  }

  const linked = prospects.filter((p) => contacts.some((c) => c.prospectId === p.id));
  for (const c of contacts) {
    if (c.prospectId && linked.some((p) => p.id === c.prospectId)) {
      connect(c.id, `p:${c.prospectId}`);
      connect(`p:${c.prospectId}`, c.id);
    }
  }

  const layer = new Map<string, number>();
  const queue: string[] = [];
  for (const c of contacts) {
    if (c.kind === "TEAM") {
      layer.set(c.id, 0);
      queue.push(c.id);
    }
  }
  while (queue.length) {
    const id = queue.shift()!;
    for (const n of adj.get(id) ?? []) {
      if (!n.startsWith("p:") && !layer.has(n)) {
        layer.set(n, layer.get(id)! + 1);
        queue.push(n);
      }
    }
  }

  const reachedMax = layer.size ? Math.max(...layer.values()) : -1;
  const hasIsolated = contacts.some((c) => !layer.has(c.id));
  const isolatedLayer = reachedMax + 1;
  for (const c of contacts) if (!layer.has(c.id)) layer.set(c.id, isolatedLayer);
  const lastContactLayer = hasIsolated ? isolatedLayer : reachedMax;
  const prospectLayer = lastContactLayer + 1;
  const columnCount = (linked.length ? prospectLayer : lastContactLayer) + 1;

  const columns: string[][] = Array.from({ length: Math.max(1, columnCount) }, () => []);
  for (const c of contacts) columns[layer.get(c.id)!].push(c.id);
  for (const p of linked) columns[prospectLayer].push(`p:${p.id}`);

  const contactById = new Map(contacts.map((c) => [c.id, c]));
  const prospectById = new Map(linked.map((p) => [`p:${p.id}`, p]));
  const labelOf = (id: string) => contactById.get(id)?.name ?? prospectById.get(id)?.name ?? "";

  const order = new Map<string, number>();
  for (const col of columns) {
    const bary = (id: string) => {
      const ns = [...(adj.get(id) ?? [])].filter((n) => order.has(n));
      return ns.length ? ns.reduce((sum, n) => sum + order.get(n)!, 0) / ns.length : Number.POSITIVE_INFINITY;
    };
    col.sort((a, b) => bary(a) - bary(b) || labelOf(a).localeCompare(labelOf(b)));
    col.forEach((id, i) => order.set(id, i));
  }

  const maxRows = Math.max(1, ...columns.map((c) => c.length));
  const height = TOP + (maxRows - 1) * ROW + 86;
  const colX = (ci: number) =>
    columns.length === 1 ? W / 2 : PAD_X + (ci * (W - 2 * PAD_X)) / (columns.length - 1);

  const pos = new Map<string, { x: number; y: number }>();
  columns.forEach((col, ci) => {
    const offset = ((maxRows - col.length) * ROW) / 2;
    col.forEach((id, i) => pos.set(id, { x: colX(ci), y: TOP + offset + i * ROW }));
  });

  const hotEdges = new Set<string>();
  const hotNodes = new Set<string>();
  for (const p of paths) {
    p.nodeIds.forEach((id, i) => {
      hotNodes.add(id);
      if (i > 0) hotEdges.add(edgeKey(p.nodeIds[i - 1], id));
    });
    const last = p.nodeIds[p.nodeIds.length - 1];
    if (last) {
      hotEdges.add(edgeKey(last, `p:${p.prospectId}`));
      hotNodes.add(`p:${p.prospectId}`);
    }
  }

  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    if (Math.abs(a.x - b.x) < 1) {
      const bulge = 64;
      return `M ${a.x} ${a.y} C ${a.x - bulge} ${a.y}, ${b.x - bulge} ${b.y}, ${b.x} ${b.y}`;
    }
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };

  const header = (ci: number) => {
    if (linked.length && ci === prospectLayer) return "Prospek";
    if (hasIsolated && ci === isolatedLayer) return "Belum terhubung";
    if (ci === 0 && reachedMax >= 0) return "Tim internal";
    return `${ci} langkah`;
  };

  const lines = [
    ...validEdges.map((e) => ({
      key: edgeKey(e.fromId, e.toId),
      from: e.fromId,
      to: e.toId,
      width: 1.2 + (Math.max(1, Math.min(100, e.strength)) / 100) * 2.2,
      title: `${labelOf(e.fromId)} ↔ ${labelOf(e.toId)} · ${relationshipTypeLabels[e.type]} · kekuatan ${e.strength}`,
    })),
    ...contacts
      .filter((c) => c.prospectId && prospectById.has(`p:${c.prospectId}`))
      .map((c) => ({
        key: edgeKey(c.id, `p:${c.prospectId}`),
        from: c.id,
        to: `p:${c.prospectId}`,
        width: 1.6,
        title: `${c.name} → ${labelOf(`p:${c.prospectId}`)} · kontak jembatan`,
      })),
  ];
  const sortedLines = [...lines].sort((a, b) => Number(hotEdges.has(a.key)) - Number(hotEdges.has(b.key)));

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="h-auto w-full min-w-190"
      role="img"
      aria-label="Context graph relasi dari tim internal ke prospek"
    >
      {columns.map((_, ci) => (
        <g key={`col-${ci}`}>
          <line x1={colX(ci)} x2={colX(ci)} y1={44} y2={height - 18} stroke="#eceee7" strokeWidth={1} />
          <text
            x={colX(ci)}
            y={24}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            letterSpacing="0.08em"
            fill="#81867e"
          >
            {header(ci).toUpperCase()}
          </text>
        </g>
      ))}

      {sortedLines.map((l) => {
        const a = pos.get(l.from);
        const b = pos.get(l.to);
        if (!a || !b) return null;
        const hot = hotEdges.has(l.key);
        const d = curve(a, b);
        return (
          <g key={l.key}>
            <title>{l.title}</title>
            {hot && <path d={d} fill="none" stroke="#d4f65a" strokeWidth={9} strokeLinecap="round" opacity={0.85} />}
            <path
              d={d}
              fill="none"
              stroke={hot ? "#0e100f" : "#cfd2c8"}
              strokeWidth={hot ? 2.6 : l.width}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {[...pos.entries()].map(([id, { x, y }]) => {
        const hot = hotNodes.has(id);
        const prospect = prospectById.get(id);
        if (prospect) {
          const w = Math.min(230, Math.max(124, prospect.name.length * 7.4 + 52));
          return (
            <g key={id} transform={`translate(${x} ${y})`}>
              <title>{`Prospek: ${prospect.name}`}</title>
              {hot && (
                <rect x={-w / 2 - 5} y={-22} width={w + 10} height={44} rx={22} fill="none" stroke="#d4f65a" strokeWidth={5} />
              )}
              <rect x={-w / 2} y={-17} width={w} height={34} rx={17} fill="#0e100f" />
              <PiTarget x={-w / 2 + 12} y={-7} size={14} color="#d4f65a" />
              <text x={-w / 2 + 32} y={0} dominantBaseline="central" fontSize={12.5} fontWeight={600} fill="#ffffff">
                {prospect.name}
              </text>
            </g>
          );
        }
        const c = contactById.get(id);
        if (!c) return null;
        const color = contactKindColor[c.kind];
        return (
          <g key={id} transform={`translate(${x} ${y})`}>
            <title>{`${c.name} · ${contactKindLabels[c.kind]}${c.org ? ` · ${c.org}` : ""}`}</title>
            {hot && <circle r={R + 6} fill="none" stroke="#d4f65a" strokeWidth={5} />}
            <circle
              r={R}
              style={{ fill: `color-mix(in oklab, ${color} 18%, white)` }}
              stroke={color}
              strokeWidth={hot ? 2.5 : 1.5}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              style={{ fill: `color-mix(in oklab, ${color} 70%, black)` }}
            >
              {initials(c.name)}
            </text>
            <text
              y={R + 19}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="#0e100f"
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {c.name}
            </text>
            <text
              y={R + 35}
              textAnchor="middle"
              fontSize={11}
              fill="#81867e"
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {c.org ?? contactKindLabels[c.kind]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
