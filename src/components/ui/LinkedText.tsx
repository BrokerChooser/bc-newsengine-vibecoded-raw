/**
 * Parses markdown-style [text](url) links in plain text and renders them as <a> tags.
 * All other text is rendered as-is.
 */
export default function LinkedText({ text }: { text: string }) {
  // Match [link text](url)
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          const [, linkText, href] = match;
          const isExternal = href.startsWith('http');
          return (
            <a
              key={i}
              href={href}
              className="text-secondary-600 underline decoration-secondary-300 underline-offset-2 hover:text-secondary-700 hover:decoration-secondary-500 transition-colors"
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {linkText}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
