import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('vehicles').del();

  await knex('vehicles').insert([
    {
      name: 'Toyota Corolla',
      plate_number: 'DHK-1234',
      category: 'sedan',
      daily_rate: 2500.0,
    },
    {
      name: 'Honda CR-V',
      plate_number: 'DHK-5678',
      category: 'suv',
      daily_rate: 4500.0,
    },
    {
      name: 'Suzuki Alto',
      plate_number: 'DHK-9012',
      category: 'hatchback',
      daily_rate: 1800.0,
    },
  ]);
}