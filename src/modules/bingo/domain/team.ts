export interface Team {
  readonly id: string;
  readonly boardId: string;
  readonly name: string;
  readonly colour: string | null;
  /** The member who can add drops for this team, if one is set. */
  readonly captainUserId: string | null;
}

/** Who is asking to change a team's progress. */
export interface Actor {
  readonly userId: string;
  readonly isAdmin: boolean;
}

/** Admins can change any team; a captain only their own. */
export const canEditTeamProgress = (actor: Actor, team: Pick<Team, "captainUserId">) =>
  actor.isAdmin || (team.captainUserId !== null && team.captainUserId === actor.userId);

export interface TeamMember {
  readonly teamId: string;
  readonly userId: string;
  readonly displayName: string;
}
