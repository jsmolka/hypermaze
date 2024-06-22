export function dispose(object) {
  for (const child of object.children) {
    dispose(child);
  }
  object.geometry?.dispose();
  object.material?.dispose();
  object.texture?.dispose();
  object.dispose?.();
  object.clear?.();
}
