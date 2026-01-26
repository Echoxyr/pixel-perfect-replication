import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function HtmlPreviewFrame({
  html,
  className,
  title = "Anteprima documento",
}: {
  html: string;
  className?: string;
  title?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const blob = new Blob([html], { type: "text/html" });
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [html]);

  if (!url) return null;

  return (
    <iframe
      src={url}
      title={title}
      className={cn("w-full h-[60vh] rounded-lg border border-border", className)}
    />
  );
}
