interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  active: boolean;
  disabled: boolean;
}

const navItems: NavItem[] = [
  { id: 'scheduling', label: 'Scheduling', icon: '📅', path: '/scheduling', active: true, disabled: false },
  { id: 'attendance', label: 'Attendance', icon: '⏱️', path: '/attendance', active: false, disabled: true },
  { id: 'lone-worker', label: 'Lone Worker', icon: '🛡️', path: '/lone-worker', active: false, disabled: true },
  { id: 'activity-logs', label: 'Activity Logs', icon: '📋', path: '/activity-logs', active: false, disabled: true },
  { id: 'guards', label: 'Guard Roster', icon: '👤', path: '/guards', active: false, disabled: true },
  { id: 'clients', label: 'Clients & Sites', icon: '🏢', path: '/clients', active: false, disabled: true },
];

const systemItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard', active: false, disabled: true },
  { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/notifications', active: false, disabled: true },
  { id: 'audit', label: 'Audit Trail', icon: '🔒', path: '/audit', active: false, disabled: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', active: false, disabled: true },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">G</div>
        <span className="sidebar__logo-text">GuardOn</span>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__section-label">Operations</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__item ${item.active ? 'sidebar__item--active' : ''} ${item.disabled ? 'sidebar__item--disabled' : ''}`}
            disabled={item.disabled}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar__item-icon">{item.icon}</span>
            <span className="sidebar__item-label">{item.label}</span>
          </button>
        ))}

        <div className="sidebar__section-label">System</div>
        {systemItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__item ${item.disabled ? 'sidebar__item--disabled' : ''}`}
            disabled={item.disabled}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar__item-icon">{item.icon}</span>
            <span className="sidebar__item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__collapse-btn" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '▶' : '◀'}
        </button>
      </div>
    </aside>
  );
}
