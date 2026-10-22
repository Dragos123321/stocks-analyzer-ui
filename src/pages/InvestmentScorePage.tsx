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

const FORMULAS = [
  { value: 'lynch_full', label: 'Full Peter Lynch Score' },
] as const

const UNIVERSES = [
  { value: 'sp500', label: 'S&P 500' },
  { value: 'sp400', label: 'S&P 400 (Mid-Cap)' },
  { value: 'sp600', label: 'S&P 600 (Small-Cap)' },
  { value: 'nasdaq', label: 'NASDAQ 100' },
  { value: 'nyse', label: 'NYSE' },
] as const

type ScoreResponse = {
  formula: string
  universe: string
  count: number
  top: Record<string, unknown>[]
}

export function InvestmentScorePage() {
  const [universe, setUniverse] = useState<string | null>('sp500')
  const [formula, setFormula] = useState<string | null>('lynch_full')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ScoreResponse | null>(null)

  const fetchScore = useCallback(async () => {
    if (!universe || !formula) return
    setError(null)
    setLoading(true)
    setData(null)
    try {
      const url = getValuationUrl(
        `/api/valuation/score?formula=${formula}&universe=${universe}`
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
  }, [universe, formula])

  const columns =
    data?.top?.length && typeof data.top[0] === 'object' && data.top[0] !== null
      ? Object.keys(data.top[0])
      : []

  return (
    <Stack gap="lg">
      <Title order={2}>Investment Score</Title>
      <Text size="sm" c="dimmed">
        Rank a universe by a composite investment-score formula and see the Top 10
        stocks to invest in (highest score first). Starts with the Full Peter Lynch
        Score (growth + dividend valuation, debt, institutional ownership) -- more
        formulas can be added later.
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
            label="Formula"
            data={FORMULAS.map((f) => ({ value: f.value, label: f.label }))}
            value={formula}
            onChange={setFormula}
          />
          <Button onClick={fetchScore} loading={loading} disabled={!universe || !formula}>
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
            {data.count} ticker{data.count !== 1 ? 's' : ''} scored
          </Text>
          {data.top.length === 0 ? (
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
                {data.top.map((row, i) => (
                  <Table.Tr key={i}>
                    {columns.map((col) => (
                      <Table.Td key={col}>
                        {String((row as Record<string, unknown>)[col] ?? '—')}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </>
      )}
    </Stack>
  )
}
