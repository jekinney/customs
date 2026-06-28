'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation.js'
import { useConfig } from '@payloadcms/ui'

// Payload opens nav groups purely from saved preferences (no "open when active"
// behavior). This keeps every group collapsed except the one containing the
// current route: on the dashboard all groups close, and a group opens only when
// you're on a page beneath it. We resolve the active group's *label* from the
// config (always-present in the DOM) rather than its links (which Payload
// unmounts while collapsed). Renders nothing.
export default function NavAutoCollapse() {
  const pathname = usePathname()
  const { config } = useConfig()

  useEffect(() => {
    const groupLabel = (group: unknown, fallback: string): string => {
      if (typeof group === 'string') return group
      if (group && typeof group === 'object') return String(Object.values(group)[0] ?? fallback)
      return fallback
    }

    // Which nav-group label should be open for this route?
    let activeLabel: string | null = null
    const match = pathname.match(/\/admin\/(collections|globals)\/([^/]+)/)
    if (match) {
      const [, type, slug] = match
      if (type === 'collections') {
        const c = config.collections?.find((x) => x.slug === slug)
        if (c) activeLabel = groupLabel(c.admin?.group, 'Collections')
      } else {
        const g = config.globals?.find((x) => x.slug === slug)
        if (g) activeLabel = groupLabel(g.admin?.group, 'Globals')
      }
    }

    let observer: MutationObserver | null = null
    let raf = 0

    const sync = () => {
      observer?.disconnect()
      document.querySelectorAll('.nav-group').forEach((group) => {
        const toggle = group.querySelector('.nav-group__toggle') as HTMLElement | null
        if (!toggle) return
        const label = group.querySelector('.nav-group__label')?.textContent?.trim() ?? ''
        const shouldOpen = activeLabel !== null && label === activeLabel
        const isOpen = toggle.classList.contains('nav-group__toggle--open')
        if (shouldOpen !== isOpen) toggle.click()
      })
      if (observer) {
        const nav = document.querySelector('.nav') || document.body
        observer.observe(nav, { childList: true, subtree: true })
      }
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(sync)
    }

    observer = new MutationObserver(schedule)
    schedule()

    return () => {
      observer?.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [pathname, config])

  return null
}
