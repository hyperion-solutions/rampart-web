import type { UserRepository } from "../domain/user-repository";

/** Whether a signed-in session still belongs to a stored user. Sessions of deleted users end. */
export class CheckUserExists {
  constructor(private readonly users: UserRepository) {}

  execute(userId: string): Promise<boolean> {
    return this.users.exists(userId);
  }
}
