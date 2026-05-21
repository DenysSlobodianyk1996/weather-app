export const generateId = (): number => {
  return +Math.random().toString().slice(2, 16);
}
