import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// `next.config.ts` sets `trailingSlash: true`, and a real `next build` inlines
// this flag from that option. Vitest never runs that build, so without it
// `next/link` silently strips the trailing slash off every href it renders —
// every route assertion in this repo would test a URL the site never serves.
process.env.__NEXT_TRAILING_SLASH = '1'

afterEach(cleanup)
