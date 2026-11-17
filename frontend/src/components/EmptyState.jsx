export default function EmptyState({ title, text }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}
