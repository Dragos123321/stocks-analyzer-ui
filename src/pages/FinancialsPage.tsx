import { useState, useCallback } from 'react'
import {
  Title,
  Button,
  TextInput,
  Stack,
  Paper,
  Text,
  Alert,
  Loader,
  Group,
  SimpleGrid,
  Card,
} from '@mantine/core'
import { getFinancialsUrl } from '../config/api'

export function FinancialsPage() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratios, setRatios] = useState<Record<string, unknown> | null>(null)
  const [liquidity, setLiquidity] = useState<Record<string, unknown> | null>(null)

  const fetchRatios = useCallback(async () => {
    const t = ticker.trim().toUpperCase()
    if (!t) return
    setError(null)
    setLoading(true)
    setRatios(null)
    setLiquidity(null)
    try {
      const [ratRes, liqRes] = await Promise.all([
        fetch(getFinancialsUrl(`/api/financials/ratios/${encodeURIComponent(t)}`)),
        fetch(getFinancialsUrl(`/api/financials/debt/${encodeURIComponent(t)}`)),
      ])
      if (!ratRes.ok) throw new Error((await ratRes.json().catch(() => ({}))).detail ?? ratRes.statusText)
      const ratJson = await ratRes.json()
      setRatios(ratJson)

      if (liqRes.ok) {
        const liqJson = await liqRes.json()
        setLiquidity(liqJson)
      } else {
        setLiquidity(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [ticker])

  return (
    <Stack gap="lg">
      <Title order={2}>Financials</Title>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <TextInput
            label="Ticker"
            placeholder="e.g. AAPL"
            value={ticker}
            onChange={(e) => setTicker(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRatios()}
          />
          <Button onClick={fetchRatios} loading={loading} disabled={!ticker.trim()}>
            Fetch ratios & liquidity
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

      {ratios && !loading && (
        <>
          <Title order={3} size="h5">
            Valuation ratios
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {Object.entries(ratios)
              .filter(([k]) => k !== 'ticker')
              .map(([key, value]) => (
                <Card key={key} withBorder padding="sm" radius="md">
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Text>
                  <Text fw={500}>
                    {value != null ? String(value) : '—'}
                  </Text>
                </Card>
              ))}
          </SimpleGrid>
        </>
      )}

      {liquidity && !loading && (
        <>
          <Title order={3} size="h5" mt="md">
            Liquidity
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card withBorder padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Current ratio
              </Text>
              <Text fw={500}>
                {liquidity.current_ratio != null
                  ? String(liquidity.current_ratio)
                  : '—'}
              </Text>
            </Card>
            <Card withBorder padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Quick ratio
              </Text>
              <Text fw={500}>
                {liquidity.quick_ratio != null
                  ? String(liquidity.quick_ratio)
                  : '—'}
              </Text>
            </Card>
          </SimpleGrid>
        </>
      )}
    </Stack>
  )
}
