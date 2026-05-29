export default function TanukiLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" };
  return (
    <span className={`font-black tracking-tight ${sizes[size]}`} style={{ color: "var(--tanuki-red)" }}>
      TANUKI
    </span>
  );
}
