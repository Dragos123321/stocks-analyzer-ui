import { useState, useCallback } from 'react'
import {
  Title,
  Button,
  TextInput,
  Stack,
  Table,
  Paper,
  Text,
  Alert,
  Loader,
  Group,
  Tabs,
  NumberInput,
} from '@mantine/core'
import { getInsiderUrl } from '../config/api'

type TabType = 'trades' | 'net-flow'

export function InsiderPage() {
  const [ticker, setTicker] = useState('')
  const [tab, setTab] = useState<TabType>('trades')
  const [days, setDays] = useState(90)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trades, setTrades] = useState<Record<string, unknown>[] | null>(null)
  const [netFlow, setNetFlow] = useState<{ net_flow_usd: number; days: number } | null>(null)

  const fetchTrades = useCallback(async () => {
    const t = ticker.trim().toUpperCase()
    if (!t) return
    setError(null)
    setLoading(true)
    setTrades(null)
    setNetFlow(null)
    try {
      const url = getInsiderUrl(
        `/api/insider/trades/${encodeURIComponent(t)}?limit=50&open_market_only=true&collapsed=true`
      )
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? res.statusText)
      }
      const json = await res.json()
      setTrades(json.trades ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [ticker])

  const fetchNetFlow = useCallback(async () => {
    const t = ticker.trim().toUpperCase()
    if (!t) return
    setError(null)
    setLoading(true)
    setTrades(null)
    setNetFlow(null)
    try {
      const url = getInsiderUrl(
        `/api/insider/trades/${encodeURIComponent(t)}/net-flow?days=${days}`
      )
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? res.statusText)
      }
      const json = await res.json()
      setNetFlow({ net_flow_usd: json.net_flow_usd ?? 0, days: json.days ?? days })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [ticker, days])

  const handleSubmit = useCallback(() => {
    if (tab === 'trades') fetchTrades()
    else fetchNetFlow()
  }, [tab, fetchTrades, fetchNetFlow])

  const tradeColumns =
    trades?.length && typeof trades[0] === 'object' && trades[0] !== null
      ? Object.keys(trades[0] as object)
      : []

  return (
    <Stack gap="lg">
      <Title order={2}>Insider Activity</Title>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <TextInput
            label="Ticker"
            placeholder="e.g. NVDA"
            value={ticker}
            onChange={(e) => setTicker(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Tabs value={tab} onChange={(v) => setTab((v as TabType) ?? 'trades')}>
            <Tabs.List>
              <Tabs.Tab value="trades">Trades</Tabs.Tab>
              <Tabs.Tab value="net-flow">Net flow</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="net-flow" pt="md">
              <NumberInput
                label="Lookback (days)"
                min={1}
                max={365}
                value={days}
                onChange={(v) => setDays(Number(v) || 90)}
              />
            </Tabs.Panel>
          </Tabs>
          <Button onClick={handleSubmit} loading={loading} disabled={!ticker.trim()}>
            {tab === 'trades' ? 'Fetch trades' : 'Fetch net flow'}
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

      {netFlow !== null && !loading && tab === 'net-flow' && (
        <Paper p="lg" withBorder>
          <Text fw={500} mb="xs">
            Net insider flow ({netFlow.days} days)
          </Text>
          <Text
            size="xl"
            c={netFlow.net_flow_usd >= 0 ? 'green' : 'red'}
          >
            ${netFlow.net_flow_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </Paper>
      )}

      {trades !== null && trades.length > 0 && !loading && tab === 'trades' && (
        <Stack align="center" gap="md" w="100%" className="insider-results">
          <Text size="sm" c="dimmed">
            {trades.length} trade{trades.length !== 1 ? 's' : ''}
          </Text>
          <Paper withBorder p={0} style={{ overflowX: 'auto', width: '100%' }}>
          <Table highlightOnHover withTableBorder style={{ minWidth: '100%' }}>
            <Table.Thead>
              <Table.Tr>
                {tradeColumns.map((col) => (
                  <Table.Th key={col}>{col}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {trades.slice(0, 100).map((row, i) => {
                const code = (row as Record<string, unknown>).transaction_code as string | undefined
                const isBuy = code === 'P'
                const isSell = code === 'S'
                const rowClass = isBuy ? 'insider-row-buy' : isSell ? 'insider-row-sell' : undefined
                return (
                  <Table.Tr key={i} className={rowClass}>
                    {tradeColumns.map((col) => (
                      <Table.Td key={col}>
                        {String(
                          (row as Record<string, unknown>)[col] ?? '—'
                        )}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
          </Paper>
          {trades.length > 100 && (
            <Text size="xs" c="dimmed">
              Showing first 100 of {trades.length}
            </Text>
          )}
        </Stack>
      )}

      {trades !== null && trades.length === 0 && !loading && tab === 'trades' && (
        <Text size="sm" c="dimmed">
          No trades found for this ticker.
        </Text>
      )}
    </Stack>
  )
}
