/**
 * Locks the app shell to the height the user can actually see.
 *
 * `100dvh` is *supposed* to be that height, but it is not trustworthy with
 * viewport-fit=cover: several engines count the strip behind the system
 * navigation / home-indicator bar inside the unit while leaving it outside the
 * visible area. The shell then renders taller than the fold, the browser
 * scrolls the visual viewport to compensate, and you get a dead band at the
 * bottom with the layout pushed off the top.
 *
 * Every box under <html> is height:100% + overflow:hidden, so nothing inside
 * the tree can overflow on its own — the mismatch can only come from the unit
 * on <html> itself. `visualViewport.height` is the visible height *by
 * definition*, so we measure it and publish it as --app-h.
 *
 * index.html seeds --app-h before first paint; this keeps it current.
 */

const VAR = '--app-h'

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (el as HTMLElement).isContentEditable === true
  )
}

export function installViewportHeight(): () => void {
  const vv = window.visualViewport
  const root = document.documentElement

  function apply() {
    // The on-screen keyboard shrinks visualViewport. Resizing the shell then
    // would collapse the very form the user is typing into, so hold the last
    // good value until focus leaves.
    if (isTypingTarget(document.activeElement)) return
    // Pinch-zoom shrinks visualViewport too. user-scalable=no is gone (WCAG
    // 1.4.4), so this is reachable; the shell must not shrink with the zoom.
    if (vv && vv.scale !== 1) return

    const h = vv?.height ?? window.innerHeight
    if (h > 0) root.style.setProperty(VAR, `${Math.round(h)}px`)
  }

  apply()

  vv?.addEventListener('resize', apply)
  window.addEventListener('resize', apply)
  window.addEventListener('orientationchange', apply)
  // Fires when the keyboard closes, which is exactly when the value we skipped
  // above needs to be picked back up.
  window.addEventListener('focusout', apply)

  return () => {
    vv?.removeEventListener('resize', apply)
    window.removeEventListener('resize', apply)
    window.removeEventListener('orientationchange', apply)
    window.removeEventListener('focusout', apply)
  }
}

/**
 * Opt-in on-device readout, mounted only for `?vh=1`. There is no way to
 * inspect a phone's real viewport numbers from a desktop devtools session, and
 * guessing which of dvh / innerHeight / the safe-area inset is lying is how
 * this bug survived two previous fixes.
 */
export function installViewportProbe(): void {
  if (!new URLSearchParams(window.location.search).has('vh')) return

  const box = document.createElement('pre')
  box.style.cssText = [
    'position:fixed', 'left:8px', 'right:8px', 'bottom:8px', 'z-index:99999',
    'margin:0', 'padding:10px', 'border-radius:8px', 'font:11px/1.45 ui-monospace,monospace',
    'background:rgba(0,0,0,.86)', 'color:#0f0', 'white-space:pre-wrap',
    'pointer-events:none', 'border:1px solid #0f0',
  ].join(';')
  document.body.appendChild(box)

  // Read the raw insets through a probe element: env() is not exposed to JS.
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;' +
    'padding-bottom:env(safe-area-inset-bottom,0px);padding-top:env(safe-area-inset-top,0px)'
  document.body.appendChild(probe)

  function render() {
    const cs = getComputedStyle(probe)
    const vv = window.visualViewport
    const root = document.documentElement
    box.textContent = [
      `visualViewport.h : ${vv ? Math.round(vv.height) : 'n/a'}   scale: ${vv ? vv.scale : '-'}`,
      `window.innerH    : ${window.innerHeight}`,
      `docEl.clientH    : ${root.clientHeight}`,
      `--app-h          : ${root.style.getPropertyValue('--app-h') || '(unset)'}`,
      `safe-top/bottom  : ${cs.paddingTop} / ${cs.paddingBottom}`,
      `docEl.scrollH    : ${root.scrollHeight}   body.scrollH: ${document.body.scrollHeight}`,
      `screen           : ${window.screen.width}x${window.screen.height}  dpr:${window.devicePixelRatio}`,
    ].join('\n')
  }

  render()
  window.visualViewport?.addEventListener('resize', render)
  window.visualViewport?.addEventListener('scroll', render)
  window.addEventListener('resize', render)
  setInterval(render, 500)
}
