import { useState, useCallback } from 'react'
import {
  Title,
  Button,
  Select,
  Stack,
  Table,
  Paper,
  Text,
  Alert,
  Loader,
  Group,
} from '@mantine/core'
import { getValuationUrl } from '../config/api'

const METHODS = [
  { value: 'lynch', label: 'Peter Lynch Fair Value' },
  { value: 'graham', label: 'Graham Number' },
  { value: 'dcf', label: 'Simplified DCF' },
] as const

const UNIVERSES = [
  { value: 'sp500', label: 'S&P 500' },
  { value: 'sp400', label: 'S&P 400 (Mid-Cap)' },
  { value: 'sp600', label: 'S&P 600 (Small-Cap)' },
  { value: 'nasdaq', label: 'NASDAQ 100' },
  { value: 'nyse', label: 'NYSE' },
] as const

type FairValueResponse = {
  method: string
  universe: string
  count: number
  top_upside: Record<string, unknown>[]
  top_downside: Record<string, unknown>[]
}

function resultColumns(rows: Record<string, unknown>[]): string[] {
  return rows.length && typeof rows[0] === 'object' && rows[0] !== null
    ? Object.keys(rows[0])
    : []
}

function ResultTable({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  const columns = resultColumns(rows)
  return (
    <Stack gap="xs">
      <Title order={4}>{title}</Title>
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          No results.
        </Text>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col}>{col}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, i) => (
              <Table.Tr key={i}>
                {columns.map((col) => (
                  <Table.Td key={col}>{String(row[col] ?? '—')}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  )
}

export function FairValuePage() {
  const [universe, setUniverse] = useState<string | null>('sp500')
  const [method, setMethod] = useState<string | null>('lynch')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FairValueResponse | null>(null)

  const fetchFairValue = useCallback(async () => {
    if (!universe || !method) return
    setError(null)
    setLoading(true)
    setData(null)
    try {
      const url = getValuationUrl(
        `/api/valuation/fair-value?method=${method}&universe=${universe}`
      )
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [universe, method])

  return (
    <Stack gap="lg">
      <Title order={2}>Fair Value</Title>
      <Text size="sm" c="dimmed">
        Estimate intrinsic value using Peter Lynch Fair Value, Graham Number, or a simplified
        DCF, then see the Top 10 most undervalued (upside) and most overvalued (downside)
        stocks in a chosen universe.
      </Text>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Select
            label="Universe"
            data={UNIVERSES.map((u) => ({ value: u.value, label: u.label }))}
            value={universe}
            onChange={setUniverse}
          />
          <Select
            label="Method"
            data={METHODS.map((m) => ({ value: m.value, label: m.label }))}
            value={method}
            onChange={setMethod}
          />
          <Button onClick={fetchFairValue} loading={loading} disabled={!universe || !method}>
            Run screen
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {loading && (
        <Group justify="center" p="xl">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading…
          </Text>
        </Group>
      )}

      {data && !loading && (
        <>
          <Text size="sm" c="dimmed">
            {data.count} ticker{data.count !== 1 ? 's' : ''} with a valid fair value
          </Text>
          <ResultTable title="Top 10 Undervalued (Upside)" rows={data.top_upside} />
          <ResultTable title="Top 10 Overvalued (Downside)" rows={data.top_downside} />
        </>
      )}
    </Stack>
  )
}
