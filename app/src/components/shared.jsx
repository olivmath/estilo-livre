import { Avatar as ShadAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)" }} />
    </div>
  );
}

export function UserAvatar({ name, photoURL, size = 36 }) {
  return (
    <ShadAvatar style={{ width: size, height: size, flexShrink: 0 }}>
      <AvatarImage src={photoURL} alt={name} style={{ objectFit: "cover" }} />
      <AvatarFallback style={{
        background: "var(--blue)", color: "var(--acc)",
        fontSize: size * 0.4, fontWeight: 700,
      }}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </AvatarFallback>
    </ShadAvatar>
  );
}

export function Field({ label, htmlFor, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label
        htmlFor={htmlFor}
        style={{ display: "block", fontSize: 12, color: "var(--sub)", marginBottom: 6 }}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
