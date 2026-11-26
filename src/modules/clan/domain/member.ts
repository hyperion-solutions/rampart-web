export type MemberRole = string;

export interface Member {
  readonly id: number;
  readonly username: string;
  readonly displayName: string;
  readonly role: MemberRole;
  readonly accountType: string;
  readonly ehp: number;
  readonly ehb: number;
  readonly totalExp: number;
}
