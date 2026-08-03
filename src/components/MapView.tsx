import { Suspense, lazy, useEffect, useState } from "react";
import type { LeafletMapProps } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

function Placeholder({ className }: { className?: string | undefined }) {
  return (
    <div
      className={`flex items-center justify-center bg-muted text-sm text-muted-foreground ${className ?? ""}`}
    >
      Caricamento mappa…
    </div>
  );
}

export function MapView(props: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Placeholder className={props.className} />;

  return (
    <Suspense fallback={<Placeholder className={props.className} />}>
      <LeafletMap {...props} />
    </Suspense>
  );
}
