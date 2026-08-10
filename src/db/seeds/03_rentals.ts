import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('rentals').del();

  const vehicles = await knex('vehicles').select('id', 'plate_number');
  const getId = (plate: string): number => {
    const v = vehicles.find((v) => v.plate_number === plate);
    if (!v) throw new Error(`Seed error: vehicle with plate ${plate} not found`);
    return v.id;
  };

  await knex('rentals').insert([
    // Month-boundary rental: July 29 - Aug 3 (6 days total, 3 days fall in August)
    {
      vehicle_id: getId('DHK-1234'),
      customer_name: 'Rahim Uddin',
      customer_phone: '01711111111',
      start_date: '2026-07-29',
      end_date: '2026-08-03',
      total_amount: 2500.0 * 6,
      status: 'completed',
    },
    // A fully-within-August rental
    {
      vehicle_id: getId('DHK-5678'),
      customer_name: 'Karim Hossain',
      customer_phone: '01722222222',
      start_date: '2026-08-05',
      end_date: '2026-08-08',
      total_amount: 4500.0 * 4,
      status: 'booked',
    },
    // Same-day rental (counts as 1 day)
    {
      vehicle_id: getId('DHK-9012'),
      customer_name: 'Salma Akter',
      customer_phone: '01733333333',
      start_date: '2026-08-10',
      end_date: '2026-08-10',
      total_amount: 1800.0 * 1,
      status: 'ongoing',
    },
    // A cancelled rental (should not count in reports/overlap)
    {
      vehicle_id: getId('DHK-1234'),
      customer_name: 'Jamal Khan',
      customer_phone: '01744444444',
      start_date: '2026-08-15',
      end_date: '2026-08-18',
      total_amount: 2500.0 * 4,
      status: 'cancelled',
    },
  ]);
}