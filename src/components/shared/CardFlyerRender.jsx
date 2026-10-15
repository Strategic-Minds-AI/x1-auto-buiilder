import React, { useMemo } from "react";
import { renderCardFlyer } from "@/lib/cardFlyer/cardFlyerRenderer";

export default function CardFlyerRender({ style, content, brand, displayW }) {
  const { html, designW, designH } = useMemo(
    () => renderCardFlyer(style, content, brand),
    [style, content, brand]
  );

  const scale = displayW ? Math.min(displayW / designW, 1.5) : 1;
  const scaledH = designH * scale;

  return (
    <div style={{ width: displayW || designW, height: scaledH, overflow: "hidden", borderRadius: 8 }}>
      <div
        style={{ width: designW, height: designH, transform: `scale(${scale})`, transformOrigin: "top left" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}