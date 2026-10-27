/** Catalog data shared by the UI and the verification scripts. */
export const THREAD_COLORS: Record<string, string> = {
  '#ffffff': 'white', '#111111': 'black', '#e53935': 'red', '#ffb300': 'gold',
  '#43a047': 'green', '#1e88e5': 'blue', '#d81b60': 'pink', '#9c6bff': 'violet',
};

export const BOARD_COLORS: [string, string][] = [
  ['#0c0b0a', 'Black'], ['#2f2f33', 'Charcoal'], ['#1c2438', 'Midnight'], ['#14301f', 'Forest'],
  ['#3a1218', 'Wine'], ['#4a3220', 'Walnut'], ['#e9dfcb', 'Cream'], ['#f5f5f5', 'White'],
];

export type Script = 'dev' | 'guj' | 'en';
export interface FontOption { k: Script; n: string; f: string }
export const FONTS: FontOption[] = [
  { k: 'dev', n: 'Kohinoor Devanagari', f: '"Kohinoor Devanagari","Noto Sans Devanagari","Nirmala UI",sans-serif' },
  { k: 'dev', n: 'Devanagari Sangam', f: '"Devanagari Sangam MN","Noto Sans Devanagari","Mangal",sans-serif' },
  { k: 'dev', n: 'ITF Devanagari', f: '"ITF Devanagari","Kohinoor Devanagari","Noto Sans Devanagari",sans-serif' },
  { k: 'dev', n: 'Serif (Sanskrit style)', f: '"Noto Serif Devanagari","Devanagari Sangam MN","Kohinoor Devanagari",serif' },
  { k: 'guj', n: 'Kohinoor Gujarati', f: '"Kohinoor Gujarati","Noto Sans Gujarati","Nirmala UI",sans-serif' },
  { k: 'guj', n: 'Gujarati Sangam', f: '"Gujarati Sangam MN","Noto Sans Gujarati","Shruti",sans-serif' },
  { k: 'en', n: 'Helvetica Neue', f: '"Helvetica Neue",Arial,sans-serif' },
  { k: 'en', n: 'Georgia', f: 'Georgia,serif' },
  { k: 'en', n: 'Times', f: '"Times New Roman",serif' },
  { k: 'en', n: 'Snell Roundhand (script)', f: '"Snell Roundhand","Brush Script MT",cursive' },
  { k: 'en', n: 'Marker Felt', f: '"Marker Felt","Comic Sans MS",fantasy' },
  { k: 'en', n: 'American Typewriter', f: '"American Typewriter","Courier New",monospace' },
  { k: 'en', n: 'Zapfino', f: 'Zapfino,"Brush Script MT",cursive' },
];

export interface ToolInfo { id: string; label: string; step: 'draw' | 'nails' | 'strings'; hint: string }
export const TOOLS: ToolInfo[] = [
  { id: 'select', label: 'Select', step: 'draw', hint: 'Tap a shape to select it. Drag to move, corners to resize, the round handle to rotate.' },
  { id: 'pengrp', label: 'Pen', step: 'draw', hint: 'Pen, freeform pen, direct selection, add, delete and convert point.' },
  { id: 'lasso', label: 'Lasso', step: 'draw', hint: 'Freehand, smooth or polygonal lasso.' },
  { id: 'line', label: 'Line', step: 'draw', hint: 'Drag from one point to another.' },
  { id: 'rect', label: 'Square', step: 'draw', hint: 'Drag from one corner to the opposite corner.' },
  { id: 'circle', label: 'Circle', step: 'draw', hint: 'Drag across the area the circle should fill.' },
  { id: 'tri', label: 'Triangle', step: 'draw', hint: 'Drag across the area the triangle should fill.' },
  { id: 'star', label: 'Star', step: 'draw', hint: 'Drag across the area the star should fill.' },
  { id: 'heart', label: 'Heart', step: 'draw', hint: 'Drag across the area the heart should fill.' },
  { id: 'text', label: 'Text', step: 'draw', hint: 'Tap where the text should go, then type it and pick a font.' },
  { id: 'erase', label: 'Eraser', step: 'draw', hint: 'Tap a line or shape to delete it.' },
  { id: 'add', label: 'Add nail', step: 'nails', hint: 'Tap an empty spot to add a nail.' },
  { id: 'move', label: 'Move nail', step: 'nails', hint: 'Drag a nail to a new place.' },
  { id: 'remove', label: 'Remove nail', step: 'nails', hint: 'Tap a nail to remove it.' },
  { id: 'pick', label: 'Pick shape', step: 'strings', hint: 'Tap a nail to choose its shape.' },
  { id: 'hand', label: 'By hand', step: 'strings', hint: 'Tap nails one after another to string a thread.' },
  { id: 'cut', label: 'Cut thread', step: 'strings', hint: 'Tap a thread to remove it.' },
];
