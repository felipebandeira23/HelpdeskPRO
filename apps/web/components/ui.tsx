'use client';

import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from 'react';

/* ------------------------------------------------------------------ *
 * Form primitives — fonte única de estilo para botões e campos.
 * Antes do refactor havia 121 <button> e 56 inputs com classes
 * copiadas à mão. Use estes componentes em telas novas.
 * ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // bg-* base preservado (testes fixam essas classes); profundidade via shadow/active
  primary:
    'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-card hover:shadow-glow-brand active:scale-[0.98]',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-[0.98]',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-card active:scale-[0.98]',
  danger:
    'bg-red-600 hover:bg-red-500 text-white border-transparent shadow-card active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border-transparent',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
        BUTTON_VARIANTS[variant]
      } ${BUTTON_SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        icon
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

const FIELD_BASE =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors disabled:opacity-50';

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-slate-300 mb-1.5"
    >
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`${FIELD_BASE} ${className}`} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`${FIELD_BASE} resize-none ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = '', children, ...props }, ref) => (
  <select ref={ref} className={`${FIELD_BASE} cursor-pointer ${className}`} {...props}>
    {children}
  </select>
));
Select.displayName = 'Select';

/** Campo completo: label + controle. */
export function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
    </div>
  );
}

/** Alias para Input (para compat com código antigo). */
export const TextInput = Input;

/** Modal simples. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && (
          <div className="flex gap-3 p-6 border-t border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-slate-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Panel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  // Superfície elevada: glass sutil (design-system/MASTER.md §Tokens)
  return (
    <div
      className={`bg-slate-900/70 backdrop-blur-sm rounded-xl border border-white/[0.06] shadow-card p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/** Panel com cabeçalho e ações — padrão de seção do design system. */
export function Section({
  title,
  actions,
  children,
  className = '',
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </Panel>
  );
}

/** Placeholder shimmer para cargas >300ms (regra progressive-loading). */
export function Skeleton({
  className = 'h-4 w-full',
}: {
  className?: string;
}) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon = '📭',
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-slate-300 font-medium">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Fonte única de cores/labels de status e prioridade.
 * Qualquer tela que precise dessas cores deve importar daqui em vez
 * de redefinir os mapas localmente (evita divergência de paleta).
 * ------------------------------------------------------------------ */

export const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  WAITING: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  PAUSED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  CLOSED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  WAITING: 'Aguardando',
  PAUSED: 'Pausado',
  CLOSED: 'Fechado',
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${style}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-green-500/15 text-green-300 border-green-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  HIGH: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  URGENT: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

/** Cor sólida do "dot" de prioridade (semáforo) para listagens. */
export const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export function PriorityBadge({ priority }: { priority: string }) {
  const style =
    PRIORITY_STYLES[priority] ||
    'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${style}`}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon,
  accent = 'bg-blue-600',
}: {
  title: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-slate-900/70 backdrop-blur-sm rounded-xl border border-white/[0.06] shadow-card p-6 hover:border-white/[0.12] transition-colors">
      {/* fita de acento — identidade visual dos cards de métrica */}
      <span
        className={`absolute inset-y-0 left-0 w-1 ${accent} opacity-80`}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between mb-4">
        <span className={`text-2xl ${accent} bg-opacity-10 rounded-lg p-3`}>
          {icon}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white tnum">{value}</p>
    </div>
  );
}
