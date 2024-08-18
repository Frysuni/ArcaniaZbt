export function dateGen() {
  return `${new Date().toLocaleDateString()}-${new Date().getHours().toString().padStart(2, '0')}_${new Date().getMinutes().toString().padStart(2, '0')}`;
}
