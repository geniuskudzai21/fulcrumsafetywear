import type { PaymentMethod } from "@/lib/validation/checkout";

const ICON_STYLES: Record<PaymentMethod, { color: string; label: string }> = {
  ecocash: { color: "#168447", label: "E" },
  inbucks: { color: "#6d3bb5", label: "I" },
  zimswitch: { color: "#176b8a", label: "Z" },
};

export default function PaymentMethodIcon({
  method,
}: {
  method: PaymentMethod;
}) {
  const { color, label } = ICON_STYLES[method];

  return (
    <span
      aria-hidden="true"
      className="grid h-9 w-11 shrink-0 place-items-center rounded-md border border-mist bg-white"
      style={{ color }}
    >
      {method === "zimswitch" ? (
        <svg viewBox="0 0 36 24" className="h-6 w-9" fill="none">
          <rect
            x="2.5"
            y="4"
            width="31"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M3.5 9h29M8 15h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : method === "ecocash" ? (
        <svg viewBox="0 0 24 28" className="h-7 w-6" fill="none">
          <rect
            x="4"
            y="1.5"
            width="16"
            height="25"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9 5h6M10 22h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <text
            x="12"
            y="17"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="currentColor"
          >
            {label}
          </text>
        </svg>
      ) : (
        <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none">
          <circle
            cx="14"
            cy="14"
            r="11"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="14"
            y="19"
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="currentColor"
          >
            {label}
          </text>
        </svg>
      )}
    </span>
  );
}
