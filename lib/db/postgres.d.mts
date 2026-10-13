import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
export function pool(): Pool;
export function query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]): Promise<QueryResult<T>>;
export function transaction<T>(work: (client: Pick<PoolClient, 'query'>) => Promise<T>): Promise<T>;
export function close(): Promise<void>;
