import { createSchema, primitive } from '@/utils/persist';

export class Settings {
  constructor() {
    this.size = 25;
  }
}

createSchema(Settings, {
  size: primitive(),
});
