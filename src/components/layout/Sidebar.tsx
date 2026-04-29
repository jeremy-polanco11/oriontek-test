import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import { Box, Tooltip } from '@mui/material';

/**
 * Navy sidebar — brand mark, scoped sections, gradient active indicator.
 * Mirrors the OrionTek design system's sidebar exactly (#0F1B2D background,
 * 248px wide, gradient bar on the active item).
 */
export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex flex-col bg-navy text-[#c9d2df] sticky top-0 h-screen w-[248px] px-3.5 py-5">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2.5 pb-6 mb-4 border-b border-white/10">
        <Box
          aria-hidden
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            background: 'var(--ot-gradient)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 12px rgba(40,136,200,0.35)',
            color: '#fff',
          }}
        >
          <GroupsIcon sx={{ fontSize: 18 }} />
        </Box>
        <span className="text-white font-bold text-base tracking-[0.06em]">
          ORION<span className="ot-gradient-text">TEK</span>
        </span>
      </div>

      {/* Section: main navigation */}
      <SidebarSection label="Workspace" />
      <NavItem to="/clients" icon={<GroupsIcon sx={{ fontSize: 18 }} />} label="Clientes" active={pathname.startsWith('/clients')} />
      <NavItem to="#" disabled icon={<HomeIcon sx={{ fontSize: 18 }} />} label="Panel" />
      <NavItem to="#" disabled icon={<AssessmentIcon sx={{ fontSize: 18 }} />} label="Reportes" />

      <SidebarSection label="Cuenta" className="mt-2" />
      <NavItem to="#" disabled icon={<SettingsIcon sx={{ fontSize: 18 }} />} label="Ajustes" />

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-white/10 flex items-center gap-2.5 px-2">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--ot-gradient)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
          }}
          aria-hidden
        >
          MR
        </Box>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[13px] font-semibold truncate">Marisol Rivas</div>
          <div className="text-[#8a98ad] text-xs">Administradora</div>
        </div>
        <Tooltip title="Cerrar sesión">
          <button
            type="button"
            aria-label="Cerrar sesión"
            className="text-[#8a98ad] hover:text-white p-1 rounded transition-colors"
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

function SidebarSection({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`px-3 pt-4 pb-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#5a6a82] ${className}`}
    >
      {label}
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
}

function NavItem({ to, label, icon, active, disabled }: NavItemProps) {
  if (disabled) {
    return (
      <span
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#5a6a82] cursor-not-allowed select-none"
        title="Próximamente"
      >
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-[#5a6a82]">Pronto</span>
      </span>
    );
  }
  return (
    <NavLink
      to={to}
      className={() => {
        const base =
          'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-[120ms] no-underline';
        if (active) {
          return `${base} bg-[rgba(8,152,216,0.14)] text-white before:content-[''] before:absolute before:left-[-14px] before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-brand-gradient`;
        }
        return `${base} text-[#b5c0d1] hover:bg-white/5 hover:text-white`;
      }}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
