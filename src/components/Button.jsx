import './Button.scss';

/**
 * Botão padrão. Renderiza <Link>/<a> quando recebe `as`.
 * variant: primary | secondary | ghost | success | danger | light
 * size: md | lg
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  block = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  ...props
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', !children && 'btn--icon', className]
    .filter(Boolean)
    .join(' ');
  const extra = Component === 'button' && !props.type ? { type: 'button' } : {};

  return (
    <Component className={classes} {...extra} {...props}>
      {Icon && <Icon size={size === 'lg' ? 22 : 18} strokeWidth={2} aria-hidden />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={18} strokeWidth={2} aria-hidden />}
    </Component>
  );
}
