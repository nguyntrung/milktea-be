const weightUnits: Record<string, number> = {
  'gram': 1,
  'kg': 1000,
  'cái': 0,
  'thùng': 0,
  'hộp': 0,
  'chai': 0,
  'lon': 0,
  'viên': 0,
  'ml': 0,
  'lít': 0,
};

const volumeUnits: Record<string, number> = {
  'ml': 1,
  'lít': 1000,
  'cái': 0,
  'thùng': 0,
  'hộp': 0,
  'chai': 0,
  'lon': 0,
  'viên': 0,
  'gram': 0,
  'kg': 0,
};

export function convertToBaseUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (from === to) return quantity;

  if (
    weightUnits.hasOwnProperty(from) &&
    weightUnits.hasOwnProperty(to) &&
    weightUnits[from] > 0 &&
    weightUnits[to] > 0
  ) {
    return (quantity * weightUnits[from]) / weightUnits[to];
  }

  if (
    volumeUnits.hasOwnProperty(from) &&
    volumeUnits.hasOwnProperty(to) &&
    volumeUnits[from] > 0 &&
    volumeUnits[to] > 0
  ) {
    return (quantity * volumeUnits[from]) / volumeUnits[to];
  }

  throw new Error(`Không thể chuyển đổi từ đơn vị ${fromUnit} sang ${toUnit}`);
}

