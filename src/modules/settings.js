import { Enum } from '@/utils/enum';
import { defineSchema, primitive } from '@/utils/persist';

export class Settings {
  static Algorithm = new Enum([
    { key: 'recursiveBacktracking', translation: 'Recursive backtracking' },
    { key: 'prim', translation: "Prim's algorithm" },
    { key: 'kruskal', translation: "Kruskal's algorithm" },
  ]);

  constructor() {
    this.size = 25;
    this.animate = false;
    this.algorithm = Settings.Algorithm.recursiveBacktracking;
  }
}

defineSchema(Settings, {
  size: primitive(),
  animate: primitive(),
  algorithm: primitive(),
});
