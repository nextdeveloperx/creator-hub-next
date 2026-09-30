/** Fixed, pointer-transparent aurora that stays behind every section so the whole page reads as one dark canvas. */
export function Aurora() {
  return (
    <div className="lp-aurora" aria-hidden="true">
      <div className="lp-blob a" />
      <div className="lp-blob b" />
      <div className="lp-blob c" />
      <div className="lp-dots" />
    </div>
  );
}
