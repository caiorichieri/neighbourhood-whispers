export type LatLng = [number, number];

export const PORDENONE_CENTER: LatLng = [45.9564, 12.6605];

/** Ray casting: verifica se un punto è dentro il poligono. */
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (polygon.length < 3) return false;
  const [y, x] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i]!;
    const [yj, xj] = polygon[j]!;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonCenter(polygon: LatLng[]): LatLng {
  if (polygon.length === 0) return PORDENONE_CENTER;
  const sum = polygon.reduce<[number, number]>(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0],
  );
  return [sum[0] / polygon.length, sum[1] / polygon.length];
}

export function parsePolygon(value: unknown): LatLng[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((p) =>
    Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "number"
      ? [[p[0], p[1]] as LatLng]
      : [],
  );
}

export function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`)
        .join(";"),
    )
    .join("\n");
}
