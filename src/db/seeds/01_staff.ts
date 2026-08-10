import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('staff').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  await knex('staff').insert([
    {
      email: 'admin@vehiclerental.com',
      password_hash: passwordHash,
      name: 'Admin Staff',
    },
  ]);
}