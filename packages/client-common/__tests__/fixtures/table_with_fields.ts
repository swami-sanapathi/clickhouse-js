import type {
  ClickHouseClient,
  ClickHouseSettings,
} from '@clickhouse/client-common'
import { createTable, guid, TestEnv } from '../utils'

export async function createTableWithFields(
  client: ClickHouseClient,
  fields: string,
  clickhouse_settings?: ClickHouseSettings,
  table_name?: string,
): Promise<string> {
  const tableName = table_name ?? `test_table__${guid()}`
  await createTable(
    client,
    (env) => {
      switch (env) {
        // ENGINE can be omitted in the cloud statements:
        // it will use ReplicatedMergeTree and will add ON CLUSTER as well
        case TestEnv.Cloud:
        case TestEnv.CloudSMT:
          return `
            CREATE TABLE ${tableName}
            (id UInt32, ${fields})
            ORDER BY (id)
          `
        case TestEnv.LocalSingleNode:
          return `
            CREATE TABLE ${tableName}
            (id UInt32, ${fields})
            ENGINE MergeTree()
            ORDER BY (id)
          `
        case TestEnv.LocalCluster:
          return `
            CREATE TABLE ${tableName} ON CLUSTER '{cluster}'
            (id UInt32, ${fields})
            ENGINE ReplicatedMergeTree(
              '/clickhouse/{cluster}/tables/{database}/{table}/{shard}',
              '{replica}'
            )
            ORDER BY (id)
          `
      }
    },
    clickhouse_settings,
  )
  return tableName
}
