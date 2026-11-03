"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CarPdfInlineViewerProps = {
  url: string;
  className?: string;
};

function pdfEmbedSrc(url: string): string {
  const base = url.split("#")[0] ?? url;
  return `${base}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

export function CarPdfInlineViewer({ url, className }: CarPdfInlineViewerProps) {
  const [iframeReady, setIframeReady] = useState(false);
  const embedSrc = useMemo(() => pdfEmbedSrc(url), [url]);

  useEffect(() => {
    setIframeReady(false);
  }, [embedSrc]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white",
        className,
      )}
    >
      {!iframeReady ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
        </div>
      ) : null}
      <iframe
        key={embedSrc}
        title="Factura"
        src={embedSrc}
        className="h-full min-h-0 w-full flex-1 border-0 bg-white"
        onLoad={() => setIframeReady(true)}
      />
    </div>
  );
}
