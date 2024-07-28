import { createSchema, primitive } from '@/utils/persist';

export class Settings {
  constructor() {
    this.size = 25;
    this.animate = false;
  }
}

createSchema(Settings, {
  size: primitive(),
  animate: primitive(),
});
