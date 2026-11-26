import Image from "next/image";
import type { Member } from "@/modules/clan/domain/member";
import { formatLabel } from "@/shared/lib/format";
import { ACCOUNT_TYPE_LABELS } from "./labels";

/** Rank icon is 13x13 pixel art; scale by whole multiples. */
export function RankIcon({ member, scale = 2 }: { member: Member; scale?: 1 | 2 | 3 }) {
  return (
    <Image
      src={member.icons.rank}
      alt=""
      width={13 * scale}
      height={13 * scale}
      unoptimized
      className="pixelated shrink-0"
    />
  );
}

/** Account type icon is 10x13 pixel art; scale by whole multiples. */
export function AccountTypeIcon({ member, scale = 2 }: { member: Member; scale?: 1 | 2 | 3 }) {
  return (
    <Image
      src={member.icons.accountType}
      alt={formatLabel(member.accountType, ACCOUNT_TYPE_LABELS)}
      title={formatLabel(member.accountType, ACCOUNT_TYPE_LABELS)}
      width={10 * scale}
      height={13 * scale}
      unoptimized
      className="pixelated shrink-0"
    />
  );
}
