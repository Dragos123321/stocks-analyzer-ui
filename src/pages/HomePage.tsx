import { Link, useNavigate } from 'react-router-dom'
import { Title, Text, Paper, Stack, Anchor } from '@mantine/core'
import { useCallback } from 'react'

const cards = [
  {
    path: '/screening',
    title: 'Screening',
    description:
      'Rank stocks by valuation ratios (P/E, PEG, Price/Sales, EV/EBITDA), CANSLIM score, or cross-sectional momentum. Choose S&P 500 or NASDAQ 100 universe.',
  },
  {
    path: '/insider',
    title: 'Insider Activity',
    description:
      'View SEC Form 4 insider transactions by ticker: open-market buys and sells, collapsed trades, and net flow over a configurable window.',
  },
  {
    path: '/financials',
    title: 'Financials',
    description:
      'Per-ticker diluted EPS (annual and quarterly), EPS change %, valuation ratios, and liquidity ratios (current ratio, quick ratio).',
  },
  {
    path: '/fair-value',
    title: 'Fair Value',
    description:
      'Estimate intrinsic value with Peter Lynch Fair Value, Graham Number, or a simplified DCF. See the Top 10 most undervalued and overvalued stocks across S&P 500, S&P 400, S&P 600, NASDAQ 100, or NYSE.',
  },
  {
    path: '/investment-score',
    title: 'Investment Score',
    description:
      'Rank a universe by a composite investment-score formula and see the Top 10 stocks to invest in. Starts with the Full Peter Lynch Score; more formulas can be added later.',
  },
] as const

export function HomePage() {
  const navigate = useNavigate()

  const handleKeyDown = useCallback(
    (path: string) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        navigate(path)
      }
    },
    [navigate]
  )

  return (
    <Stack gap="xl">
      {cards.map(({ path, title, description }) => (
        <Anchor
          key={path}
          component={Link}
          to={path}
          underline="never"
          c="inherit"
        >
          <Paper
            p="lg"
            shadow="sm"
            radius="md"
            withBorder
            className="home-card"
            tabIndex={0}
            role="button"
            onKeyDown={handleKeyDown(path)}
            aria-label={`Go to ${title}`}
          >
            <Title order={2} size="h4" mb="xs">
              {title}
            </Title>
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          </Paper>
        </Anchor>
      ))}
    </Stack>
  )
}
