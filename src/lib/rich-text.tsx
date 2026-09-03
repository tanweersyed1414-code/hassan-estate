import React from "react";

/**
 * Renders simple admin-authored text into paragraphs, supporting **bold**
 * spans. Used for free-text content fields edited from Admin -> Site
 * Settings, where a full rich-text editor would be overkill.
 */
export function renderRichText(text: string, className?: string): React.ReactNode {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  return paragraphs.map((para, i) => (
    <p key={i} className={className}>
      {renderInline(para)}
    </p>
  ));
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-navy-950">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
