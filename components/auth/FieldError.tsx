export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-xs font-semibold text-red-700">{message}</p>;
}
