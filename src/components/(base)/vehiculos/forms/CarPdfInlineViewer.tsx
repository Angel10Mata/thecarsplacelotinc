"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CarPdfInlineViewerProps = {
  url: string;
  className?: string;
  fullDocument?: boolean;
};

function pdfEmbedSrc(url: string, fullDocument: boolean): string {
  const base = url.split("#")[0] ?? url;
  if (fullDocument) {
    return `${base}#toolbar=0&navpanes=0&scrollbar=1&view=Fit&zoom=page-fit`;
  }
  return `${base}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

export function CarPdfInlineViewer({
  url,
  className,
  fullDocument = false,
}: CarPdfInlineViewerProps) {
  const [iframeReady, setIframeReady] = useState(false);
  const embedSrc = useMemo(
    () => pdfEmbedSrc(url, fullDocument),
    [url, fullDocument],
  );

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
        className={cn(
          "h-full w-full flex-1 border-0 bg-white",
          fullDocument ? "min-h-0" : "min-h-[28rem]",
        )}
        onLoad={() => setIframeReady(true)}
      />
    </div>
  );
}
