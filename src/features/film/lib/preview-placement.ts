/** Clamp preview overlay against viewport, using the hovered card as anchor. */
export type AnchorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type PreviewPlacement = {
  left: number;
  top: number;
};

const VIEWPORT_PAD = 12;
/** Overlap prevents a pointer gap between the card and preview. */
const ANCHOR_GAP = -8;
/** Center the preview below this viewport width. */
const MOBILE_CENTER_MAX_WIDTH = 768;

export function computePreviewPlacement(
  anchor: AnchorRect,
  previewWidth: number,
  previewHeight: number,
  viewportWidth: number = typeof window !== 'undefined' ? window.innerWidth : 0,
  viewportHeight: number = typeof window !== 'undefined' ? window.innerHeight : 0
): PreviewPlacement {
  const maxLeft = Math.max(VIEWPORT_PAD, viewportWidth - VIEWPORT_PAD - previewWidth);
  const maxTop = Math.max(VIEWPORT_PAD, viewportHeight - VIEWPORT_PAD - previewHeight);

  // Center the preview on narrow viewports.
  if (viewportWidth <= MOBILE_CENTER_MAX_WIDTH) {
    const left = Math.min(maxLeft, Math.max(VIEWPORT_PAD, (viewportWidth - previewWidth) / 2));
    const preferredTop = Math.max(
      VIEWPORT_PAD,
      Math.min(anchor.top, viewportHeight - VIEWPORT_PAD - previewHeight)
    );
    // Keep edge cards closer to the viewport center.
    const centeredTop = (viewportHeight - previewHeight) / 2;
    const top = Math.min(
      maxTop,
      Math.max(VIEWPORT_PAD, Math.abs(preferredTop - centeredTop) > 80 ? centeredTop : preferredTop)
    );
    return { left, top };
  }

  // Prefer right side of card; flip to left if not enough room
  const rightCandidate = anchor.left + anchor.width + ANCHOR_GAP;
  const leftCandidate = anchor.left - previewWidth - ANCHOR_GAP;
  const preferRight = rightCandidate + previewWidth <= viewportWidth - VIEWPORT_PAD;

  let left = preferRight ? rightCandidate : leftCandidate;
  if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;
  if (left > maxLeft) left = maxLeft;

  // Align near card top, keep within viewport
  let top = anchor.top;
  if (top + previewHeight > viewportHeight - VIEWPORT_PAD) {
    top = viewportHeight - VIEWPORT_PAD - previewHeight;
  }
  if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;
  if (top > maxTop) top = maxTop;

  // If card is near bottom and still overflows after clamp, try align bottom of preview to bottom of card
  if (anchor.top + anchor.height - previewHeight >= VIEWPORT_PAD) {
    const bottomAligned = anchor.top + anchor.height - previewHeight;
    const stillOverflowsBottom = top + previewHeight > viewportHeight - VIEWPORT_PAD;
    if (stillOverflowsBottom || top + previewHeight > viewportHeight * 0.92) {
      top = Math.min(maxTop, Math.max(VIEWPORT_PAD, bottomAligned));
    }
  }

  return { left, top };
}
