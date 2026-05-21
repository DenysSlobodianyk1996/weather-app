export const uniqueByProps = (arr: any[], keys: string[]) => {
  const map = new Map();

  for (const item of arr) {
    const key = keys.map(k => item[k]).join('|');
    
    if (!map.has(key)) {
      map.set(key, item); // keep full object
    }
  }

  return [...map.values()];
}
