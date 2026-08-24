export default function BinLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-brand-500 text-white text-[11px] font-mono font-medium tracking-wide px-2.5 py-1 animate-fade-in ${className}`}
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
      }}
    >
      {children}
    </span>
  );
}