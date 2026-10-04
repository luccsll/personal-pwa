import './Badge.scss';

/** tone: primary | success | warning | danger | neutral */
export default function Badge({ tone = 'primary', icon: Icon, children, color }) {
  return (
    <span className={`badge badge--${tone}`} style={color ? { '--badge-color': color } : undefined}>
      {Icon && <Icon size={12} strokeWidth={2.4} aria-hidden />}
      {children}
    </span>
  );
}
