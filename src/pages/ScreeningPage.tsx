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
import { getScreeningUrl } from '../config/api'

type ScreenType = 'ratio' | 'canslim' | 'momentum'
const RATIOS = [
  { value: 'pe', label: 'P/E' },
  { value: 'peg', label: 'PEG' },
  { value: 'price_to_sales', label: 'Price/Sales' },
  { value: 'ev_to_ebitda', label: 'EV/EBITDA' },
] as const

export function ScreeningPage() {
  const [universe, setUniverse] = useState<string | null>('sp500')
  const [screenType, setScreenType] = useState<ScreenType>('ratio')
  const [ratio, setRatio] = useState<string | null>('pe')
  const [ascending, setAscending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ results: Record<string, unknown>[]; count: number } | null>(null)

  const [fetchLatestUniverse, setFetchLatestUniverse] = useState<string | null>('sp500')
  const [fetchLatestLoading, setFetchLatestLoading] = useState(false)
  const [fetchLatestResult, setFetchLatestResult] = useState<{
    tickers_processed: number
    snapshots_updated: number
    price_rows_updated: number
    errors?: string[]
  } | null>(null)
  const [fetchLatestError, setFetchLatestError] = useState<string | null>(null)

  const fetchScreening = useCallback(async () => {
    if (!universe) return
    setError(null)
    setLoading(true)
    setData(null)
    try {
      if (screenType === 'ratio' && ratio) {
        const url = getScreeningUrl(
          `/api/screening/ratios/${ratio}?universe=${universe}&ascending=${ascending}`
        )
        const res = await fetch(url)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData({ results: json.results ?? [], count: json.count ?? 0 })
      } else if (screenType === 'canslim') {
        const url = getScreeningUrl(`/api/screening/canslim?universe=${universe}`)
        const res = await fetch(url)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData({ results: json.results ?? [], count: json.count ?? 0 })
      } else if (screenType === 'momentum') {
        const url = getScreeningUrl(
          `/api/screening/momentum/top-decile?index=${universe}`
        )
        const res = await fetch(url)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData({ results: json.results ?? [], count: json.count ?? 0 })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [universe, screenType, ratio, ascending])

  const runFetchLatest = useCallback(async () => {
    if (!fetchLatestUniverse) return
    setFetchLatestError(null)
    setFetchLatestResult(null)
    setFetchLatestLoading(true)
    try {
      const url = getScreeningUrl(
        `/api/screening/fetch-latest?universe=${encodeURIComponent(fetchLatestUniverse)}`
      )
      // 30 min timeout for S&P 500 (500+ tickers, multiple yfinance calls per ticker)
      const res = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(1_800_000) })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setFetchLatestResult({
        tickers_processed: json.tickers_processed ?? 0,
        snapshots_updated: json.snapshots_updated ?? 0,
        price_rows_updated: json.price_rows_updated ?? 0,
        errors: json.errors,
      })
    } catch (e) {
      setFetchLatestError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setFetchLatestLoading(false)
    }
  }, [fetchLatestUniverse])

  const columns =
    data?.results?.length &&
    typeof data.results[0] === 'object' &&
    data.results[0] !== null
      ? Object.keys(data.results[0] as object)
      : []

  return (
    <Stack gap="lg">
      <Title order={2}>Screening</Title>

      <Paper p="md" withBorder>
        <Title order={4} mb="sm">Fetch latest data</Title>
        <Text size="sm" c="dimmed" mb="md">
          Download latest ratios and price history from Yahoo Finance and save to the database. This may take several minutes for large universes.
        </Text>
        <Group align="flex-end">
          <Select
            label="Universe"
            data={[
              { value: 'sp500', label: 'S&P 500' },
              { value: 'nasdaq', label: 'NASDAQ 100' },
              { value: 'sp400', label: 'S&P 400 (Mid-Cap)' },
              { value: 'sp600', label: 'S&P 600 (Small-Cap)' },
            ]}
            value={fetchLatestUniverse}
            onChange={setFetchLatestUniverse}
            w={180}
          />
          <Button
            onClick={runFetchLatest}
            loading={fetchLatestLoading}
            disabled={!fetchLatestUniverse}
          >
            Fetch latest data
          </Button>
        </Group>
        {fetchLatestError && (
          <Alert color="red" title="Error" mt="md">
            {fetchLatestError}
          </Alert>
        )}
        {fetchLatestResult && !fetchLatestLoading && (
          <Alert color="green" title="Done" mt="md">
            Processed {fetchLatestResult.tickers_processed} tickers. Snapshots: {fetchLatestResult.snapshots_updated}, price rows: {fetchLatestResult.price_rows_updated}.
            {fetchLatestResult.errors?.length ? ` ${fetchLatestResult.errors.length} error(s).` : ''}
          </Alert>
        )}
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Select
            label="Universe"
            data={[
              { value: 'sp500', label: 'S&P 500' },
              { value: 'nasdaq', label: 'NASDAQ 100' },
              { value: 'sp400', label: 'S&P 400 (Mid-Cap)' },
              { value: 'sp600', label: 'S&P 600 (Small-Cap)' },
            ]}
            value={universe}
            onChange={setUniverse}
          />
          <Select
            label="Screen type"
            data={[
              { value: 'ratio', label: 'Valuation ratio' },
              { value: 'canslim', label: 'CANSLIM' },
              { value: 'momentum', label: 'Momentum (top decile)' },
            ]}
            value={screenType}
            onChange={(v) => setScreenType((v as ScreenType) ?? 'ratio')}
          />
          {screenType === 'ratio' && (
            <>
              <Select
                label="Ratio"
                data={RATIOS.map((r) => ({ value: r.value, label: r.label }))}
                value={ratio}
                onChange={setRatio}
              />
              <Select
                label="Order"
                data={[
                  { value: 'desc', label: 'Descending (high first)' },
                  { value: 'asc', label: 'Ascending (low first)' },
                ]}
                value={ascending ? 'asc' : 'desc'}
                onChange={(v) => setAscending(v === 'asc')}
              />
            </>
          )}
          <Button onClick={fetchScreening} loading={loading} disabled={!universe}>
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
            {data.count} result{data.count !== 1 ? 's' : ''}
          </Text>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                {columns.map((col) => (
                  <Table.Th key={col}>{col}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.results.slice(0, 50).map((row, i) => (
                <Table.Tr key={i}>
                  {columns.map((col) => (
                    <Table.Td key={col}>
                      {String(
                        (row as Record<string, unknown>)[col] ?? '—'
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {data.results.length > 50 && (
            <Text size="xs" c="dimmed">
              Showing first 50 of {data.results.length}
            </Text>
          )}
        </>
      )}
    </Stack>
  )
}
