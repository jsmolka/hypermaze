export function popAt(array, i) {
  if (i >= array.length) {
    return undefined;
  }

  const j = array.length - 1;
  if (i !== j) {
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.pop();
}
