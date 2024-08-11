import { Enum } from '@/utils/enum';
import { createSchema, primitive } from '@/utils/persist';

export class Settings {
  static Algorithm = new Enum([
    { key: 'recursiveBacktracking', translation: 'Recursive backtracking' },
    { key: 'prim', translation: "Prim's algorithm" },
  ]);

  constructor() {
    this.size = 25;
    this.animate = false;
    this.algorithm = Settings.Algorithm.recursiveBacktracking;
  }
}

createSchema(Settings, {
  size: primitive(),
  animate: primitive(),
  algorithm: primitive(),
});
