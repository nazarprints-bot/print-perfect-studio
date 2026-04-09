import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface BulkOrderMatrixProps {
  sizes: string[];
  colors: string[];
  onAddToCart: (breakdown: Record<string, Record<string, number>>, totalQty: number) => void;
}

const colorHex: Record<string, string> = {
  White: "#FFFFFF", Black: "#1a1a1a", Red: "#EF4444", Blue: "#3B82F6",
  "Navy Blue": "#1E3A5F", Green: "#22C55E", Grey: "#9CA3AF",
};

const BulkOrderMatrix = ({ sizes, colors, onAddToCart }: BulkOrderMatrixProps) => {
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    colors.forEach((c) => {
      init[c] = {};
      sizes.forEach((s) => { init[c][s] = 0; });
    });
    return init;
  });

  const updateQty = (color: string, size: string, value: string) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setQuantities((prev) => ({
      ...prev,
      [color]: { ...prev[color], [size]: qty },
    }));
  };

  const totalQty = useMemo(() => {
    let total = 0;
    Object.values(quantities).forEach((sizes) => {
      Object.values(sizes).forEach((q) => { total += q; });
    });
    return total;
  }, [quantities]);

  const colorTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.entries(quantities).forEach(([color, sizes]) => {
      totals[color] = Object.values(sizes).reduce((a, b) => a + b, 0);
    });
    return totals;
  }, [quantities]);

  const sizeTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    sizes.forEach((size) => {
      totals[size] = colors.reduce((sum, color) => sum + (quantities[color]?.[size] || 0), 0);
    });
    return totals;
  }, [quantities, sizes, colors]);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground block">Bulk Order Matrix</label>
      <p className="text-xs text-muted-foreground">Enter quantities for each size/color combination</p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="p-3 text-left font-medium text-muted-foreground">Color</th>
              {sizes.map((size) => (
                <th key={size} className="p-3 text-center font-medium text-muted-foreground">{size}</th>
              ))}
              <th className="p-3 text-center font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr key={color} className="border-t hover:bg-secondary/50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border"
                      style={{ backgroundColor: colorHex[color] || "#ccc" }}
                    />
                    <span className="font-medium text-foreground">{color}</span>
                  </div>
                </td>
                {sizes.map((size) => (
                  <td key={size} className="p-2 text-center">
                    <input
                      type="number"
                      min="0"
                      value={quantities[color]?.[size] || ""}
                      onChange={(e) => updateQty(color, size, e.target.value)}
                      placeholder="0"
                      className="w-16 h-9 text-center rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </td>
                ))}
                <td className="p-3 text-center font-semibold text-primary">
                  {colorTotals[color] || 0}
                </td>
              </tr>
            ))}
            <tr className="border-t bg-secondary/50">
              <td className="p-3 font-semibold text-foreground">Total</td>
              {sizes.map((size) => (
                <td key={size} className="p-3 text-center font-semibold text-primary">
                  {sizeTotals[size] || 0}
                </td>
              ))}
              <td className="p-3 text-center font-bold text-primary text-lg">{totalQty}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Button
        onClick={() => onAddToCart(quantities, totalQty)}
        disabled={totalQty === 0}
        className="w-full rounded-xl h-11 group shadow-lg shadow-primary/20"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add {totalQty} items to Cart
      </Button>
    </div>
  );
};

export default BulkOrderMatrix;
