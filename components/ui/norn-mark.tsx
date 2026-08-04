/**
 * The Norn mark, taken from the supplied logo artwork.
 *
 * Two things differ from the source file. Its lime backdrop `<rect>` is
 * dropped, since the mark is placed on surfaces that already have their own
 * colour. And the viewBox is tightened from the original 1080x1080 board to the
 * glyph's own bounding box, so the component's box *is* the mark — there is no
 * invisible padding to compensate for when positioning it.
 *
 * `currentColor` lets callers pick the colour with a text utility.
 */
/**
 * Exported so `app/icon.svg` can be checked against it. The favicon has to
 * inline the geometry — it is a standalone file, not a React tree — and this
 * is what stops the two quietly drifting apart.
 */
export const MARK_PATH =
  'M819.999 194C864.182 194 899.999 229.817 899.999 274V834C899.999 878.183 864.182 914 819.999 914H780.186C769.131 914 758.6 911.757 749.022 907.702C736.302 904.095 724.289 897.158 714.291 886.886L206.737 365.403C175.921 333.741 175.921 282.407 206.737 250.745L236.148 220.526C266.965 188.865 316.928 188.865 347.744 220.526L700.186 582.64V274C700.186 229.817 736.003 194 780.186 194H819.999ZM422.791 740.599C461.313 740.599 477.573 789.706 446.662 812.695L324.609 903.469C317.709 908.601 309.338 911.372 300.738 911.372H220C197.909 911.372 180 893.463 180 871.372V780.599C180 758.507 197.909 740.599 220 740.599H422.791Z'

export function NornMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="176 189 724 725"
      fill="currentColor"
      aria-hidden="true"
      data-testid="norn-mark"
      className={className}
    >
      <path d={MARK_PATH} />
    </svg>
  )
}
