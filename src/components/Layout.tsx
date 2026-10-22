import { Link, Outlet, useLocation } from 'react-router-dom'
import { Container, Title, Text, Anchor, Box } from '@mantine/core'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <Box className="app">
      <header className="header">
        <Container size="md">
          <Anchor
            component={Link}
            to="/"
            underline="never"
            className="title-link"
          >
            <Title order={1} className="title">
              Stock Analyzer
            </Title>
          </Anchor>
          {!isHome ? (
            <Anchor component={Link} to="/" size="sm" c="dimmed" mt="xs" inlineBlock>
              ← Back to home
            </Anchor>
          ) : (
            <Text size="md" c="dimmed" className="tagline">
              Screen stocks, track insider activity, and view financials
            </Text>
          )}
        </Container>
      </header>

      <main className="main">
        <Container size="md">
          <Outlet />
        </Container>
      </main>

      <footer className="footer">
        <Text size="sm" c="dimmed">
          Connect to the Screening, Insider, and Financials APIs to load data.
        </Text>
      </footer>
    </Box>
  )
}
