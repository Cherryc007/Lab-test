interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function Toggle({ label, checked, onChange, id }: ToggleProps) {
  return (
    <div className="toggle" onClick={() => onChange(!checked)} role="switch" aria-checked={checked} tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
    >
      <div className={`toggle__track ${checked ? 'toggle__track--active' : ''}`}>
        <div className="toggle__thumb" />
      </div>
      <span className="toggle__label" id={id}>{label}</span>
    </div>
  );
}
