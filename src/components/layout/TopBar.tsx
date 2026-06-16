import { useSessionStore } from '../../store/useSessionStore';

export function TopBar() {
  const currentUser = useSessionStore((s) => s.currentUser);

  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const roleName = currentUser?.role
    ? currentUser.role.replace(/([A-Z])/g, ' $1').trim()
    : 'Unknown';

  return (
    <header className="topbar">
      <div className="topbar__breadcrumb">
        <span>Operations</span>
        <span>›</span>
        <span className="topbar__breadcrumb-active">Scheduling</span>
      </div>

      <div className="topbar__user">
        <div className="topbar__user-info">
          <span className="topbar__user-name">{currentUser?.name ?? 'Unknown User'}</span>
          <span className="topbar__user-role">{roleName}</span>
        </div>
        <div className="topbar__avatar">{initials}</div>
      </div>
    </header>
  );
}
