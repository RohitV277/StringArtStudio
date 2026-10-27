/** Shared types for String Art Studio. Units: board size in cm, coordinates in mm from the top-left corner. */
export type Pt = [number, number];

/** A pen-tool anchor. ix/iy and ox/oy are the in and out handle offsets relative to x/y. */
export interface Anchor { x: number; y: number; ix: number; iy: number; ox: number; oy: number }

export type StrokeType = 'pen' | 'line' | 'rect' | 'circle' | 'tri' | 'star' | 'heart' | 'lasso' | 'bez' | 'text';

export interface Stroke {
  type: StrokeType;
  /** Polyline points, or pen-tool anchors when type is 'bez'. */
  pts: Pt[] | Anchor[];
  closed: boolean;
  /** Curves are resampled evenly by length, polygons keep their corners. */
  curve: boolean;
  c: string;
  name?: string;
  /** Strokes that share a layer id move, hide and delete together (used by text). */
  lid?: string;
  /** Hidden in Layers. Hidden strokes get no nails. */
  h?: boolean;
  /** Mandala symmetry (bez only). */
  sym?: number;
  mir?: boolean;
}

export interface Nail { id: number; x: number; y: number }
export interface Group { id: number; ids: number[]; closed: boolean; c: string; n: string }
export interface Thread { a: number; b: number; c: string; g?: number }

export interface Doc {
  W: number; H: number;
  strokes: Stroke[]; nails: Nail[]; groups: Group[]; threads: Thread[];
  nid: number;
  hc?: string[]; hg?: number[];
  bg?: string;
}

export interface SavedProject { n: string; t: number; th: string; d: Doc & Record<string, unknown> }

export interface KeyValueStore {
  length: number;
  key(i: number): string | null;
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}
