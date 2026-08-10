import knex, { Knex } from 'knex';
import { types } from 'pg';
import knexConfig from '../knexfile';

types.setTypeParser(1082, (val: string) => val);

const environment = process.env.NODE_ENV || 'development';
const config = (knexConfig as Record<string, Knex.Config>)[environment];

const db: Knex = knex(config);

export default db;