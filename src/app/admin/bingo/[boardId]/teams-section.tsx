import { teamSwatch } from "@/app/_components/team-colour";
import type { Player } from "@/modules/bingo/domain/player-directory";
import type { Team, TeamMember } from "@/modules/bingo/domain/team";
import { removeTeamAction, removeTeamMemberAction } from "../actions";
import { AddMember } from "./add-member";
import { CreateTeamForm } from "./create-team-form";

/** Admin view of a board's teams: create teams, add and remove members. */
export function TeamsSection({
  boardId,
  teams,
  members,
  players,
  readOnly,
}: {
  boardId: string;
  teams: readonly Team[];
  members: readonly TeamMember[];
  players: ReadonlyMap<string, Player>;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-6">
      {teams.length === 0 && <p className="text-steel text-shadow-pixel">No teams yet.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => {
          const teamMembers = members.filter((m) => m.teamId === team.id);
          return (
            <article key={team.id} className="pixel-box space-y-3 p-5">
              <header className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-pixel text-pixel text-limestone text-shadow-pixel">
                  <span className={`size-4 border-2 border-black ${teamSwatch(team.colour)}`} aria-hidden />
                  {team.name}
                  <span className="text-steel">({teamMembers.length})</span>
                </h3>
                {!readOnly && (
                  <form action={removeTeamAction}>
                    <input type="hidden" name="boardId" value={boardId} />
                    <input type="hidden" name="teamId" value={team.id} />
                    <button type="submit" className="font-pixel text-pixel text-steel hover:text-banner" title="Delete team">
                      Delete
                    </button>
                  </form>
                )}
              </header>
              <ul className="divide-y-4 divide-obsidian">
                {teamMembers.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between gap-3 py-1.5">
                    <span>
                      <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{m.displayName}</span>{" "}
                      <span className="text-steel">{players.get(m.userId)?.rsns.join(", ")}</span>
                    </span>
                    {!readOnly && (
                      <form action={removeTeamMemberAction}>
                        <input type="hidden" name="boardId" value={boardId} />
                        <input type="hidden" name="teamId" value={team.id} />
                        <input type="hidden" name="userId" value={m.userId} />
                        <button type="submit" aria-label={`Remove ${m.displayName}`} className="px-1 font-pixel text-pixel text-steel hover:text-banner">
                          ×
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
              {!readOnly && <AddMember boardId={boardId} teamId={team.id} teamName={team.name} />}
            </article>
          );
        })}
      </div>
      {!readOnly && <CreateTeamForm boardId={boardId} />}
    </div>
  );
}
