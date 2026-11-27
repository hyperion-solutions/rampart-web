export interface Team {
  readonly id: string;
  readonly boardId: string;
  readonly name: string;
  readonly colour: string | null;
}

export interface TeamMember {
  readonly teamId: string;
  readonly userId: string;
  readonly displayName: string;
}
