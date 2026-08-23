import Link from "next/link";
import { PROFILES } from "@/components/marketing/content";

const list = [
  PROFILES.operations,
  PROFILES.commercial,
  PROFILES.manufacturing,
] as const;

export function ProfileCards() {
  return (
    <div className="mk-grid-3">
      {list.map((profile) => (
        <Link key={profile.id} href={profile.href} className="mk-card">
          <p className="mk-card-meta">Executive Profile</p>
          <h3 className="mk-h3">{profile.name}</h3>
          <p className="mk-body">{profile.subheadline}</p>
          <p className="mk-body" style={{ color: "var(--mk-accent)" }}>
            Explore profile →
          </p>
        </Link>
      ))}
    </div>
  );
}
