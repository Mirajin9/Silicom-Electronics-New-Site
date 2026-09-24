import { logo } from './logo-data';
import { url } from '../base';

/** Arrow and SE monogram. Stroke widths are in the mark's own 197 x 453 units.
 *  Colour attributes are fallbacks; brand.css sets the colours per surface. */
function Mark({ transform, draw, arrowWidth, seWeight }: { transform?: string; draw: boolean; arrowWidth: number; seWeight: number }) {
  return <g className="logo-mark" transform={transform}>
    <path className="logo-arrow" d={logo.arrow} fill="none" stroke="#8c9096" strokeWidth={arrowWidth} />
    {draw && logo.arrowHalves.map((d) => <path key={d} className="logo-arrow-half" d={d} pathLength={1} fill="none" stroke="#8c9096" strokeWidth={arrowWidth} />)}
    <path className="logo-se" d={logo.se} fill="#e0161b" stroke="#e0161b" strokeWidth={seWeight} />
  </g>;
}

/** The Silicom lockup, vectorised from the supplied artwork (scripts/build-logo.py).
 *  Colours come from --logo-arrow, --logo-se and --logo-ink, so each surface can restyle it.
 *  `draw` plays the draw-on sequence: the arrow rises from its ribbon notch to the tip. */
export function Logo({ legal = true, draw = false, decorative = false, className = '' }: {
  legal?: boolean; draw?: boolean; decorative?: boolean; className?: string;
}) {
  const label = legal ? 'Silicom Electronics Pvt. Ltd.' : 'Silicom Electronics';
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label };
  const viewBox = (legal ? logo.lockupViewBox : logo.shortViewBox).join(' ');
  // Static logos reference one cached sprite, so no page repeats the path data.
  if (!draw) return <svg className={`brand-logo ${className}`} viewBox={viewBox} {...a11y}>
    <use href={url(`${logo.symbols}#${legal ? 'lockup' : 'lockup-short'}`)} />
  </svg>;
  return <svg className={`brand-logo is-drawing ${className}`} viewBox={viewBox} {...a11y}>
    <Mark transform={logo.markTransform} draw arrowWidth={8.2} seWeight={2.4} />
    <path className="logo-word" d={logo.wordmark} fill="#363636" />
    {legal && <path className="logo-word" d={logo.legal} fill="#363636" />}
  </svg>;
}

/** The mark drawing itself on a loop, for content that is genuinely loading. */
export function LogoLoader({ label = 'Loading 3D model' }: { label?: string }) {
  return <div className="logo-loader" role="status">
    <svg className="brand-logo" viewBox={logo.markViewBox.join(' ')} aria-hidden="true">
      <Mark draw arrowWidth={13} seWeight={5} />
    </svg>
    <span>{label}</span>
  </div>;
}
