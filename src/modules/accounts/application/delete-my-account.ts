import type { UserRepository } from "../domain/user-repository";

/** Removes everything the site stores about a member: their user, linked accounts and Dink links. */
export class DeleteMyAccount {
  constructor(private readonly users: UserRepository) {}

  execute(userId: string): Promise<void> {
    return this.users.delete(userId);
  }
}
