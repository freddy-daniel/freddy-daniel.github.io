/**
 * Tracks which in-page section is currently under the header.
 *
 * Note on the implementation: the naive version sets the active id from
 * every intersecting entry as it arrives, which means that when two sections
 * are on screen at once the result depends on callback ordering and the nav
 * highlight flickers between them. Instead we keep a visibility map and
 * always resolve to the first visible section in document order.
 */
export function useScrollSpy(ids: readonly string[]) {
  const active = ref<string>(ids[0] ?? '')
  const visible = new Map<string, boolean>()

  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting)
        }
        const first = ids.find(id => visible.get(id))
        if (first) active.value = first
      },
      {
        // The large bottom inset keeps the band of interest near the top of
        // the viewport, so a tall section does not stay "active" long after
        // it has scrolled past.
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    onBeforeUnmount(() => observer.disconnect())
  })

  return active
}
