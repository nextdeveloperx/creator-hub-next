/** Headline where `highlight` gets the glow style: wrapped in place if it appears in `title`, otherwise appended. */
export function SectionTitle({ title, highlight }: { title: string; highlight: string }) {
  if (!highlight) return <>{title}</>;
  const at = title.indexOf(highlight);
  if (at === -1) {
    return (
      <>
        {title} <span className="glow-text">{highlight}</span>
      </>
    );
  }
  return (
    <>
      {title.slice(0, at)}
      <span className="glow-text">{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}
