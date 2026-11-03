import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { cn } from "@/lib/utils";

const APP_HEXAGON_HIGHLIGHTS: Array<[number, number]> = [
  [1, 1],
  [2, 2],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 3],
  [4, 6],
  [7, 5],
  [5, 7],
  [8, 2],
  [8, 5],
  [6, 6],
];

export function AppHexagonBackdrop() {
  return (
    <HexagonPattern
      radius={34}
      gap={8}
      x={-1}
      y={-1}
      hexagons={APP_HEXAGON_HIGHLIGHTS}
      className={cn(
        "z-0 fill-none stroke-zinc-200/85",
        "dark:stroke-zinc-600/35",
        "[mask-image:radial-gradient(ellipse_88%_78%_at_50%_46%,#000_0%,#000_34%,rgb(0_0_0/0.62)_52%,rgb(0_0_0/0.28)_66%,rgb(0_0_0/0.08)_78%,transparent_90%)]",
        "[-webkit-mask-image:radial-gradient(ellipse_88%_78%_at_50%_46%,#000_0%,#000_34%,rgb(0_0_0/0.62)_52%,rgb(0_0_0/0.28)_66%,rgb(0_0_0/0.08)_78%,transparent_90%)]",
      )}
    />
  );
}
