import React from 'react';
import { ShieldAlert, Wrench, Eye } from 'lucide-react';
import Select from './Select';
import { ROLES } from '../../data/accessData';

const ICONS = { Admin: ShieldAlert, Operator: Wrench, Viewer: Eye };

export const ROLE_OPTIONS = Object.entries(ROLES).map(([role, r]) => ({ value: role, label: r.label, icon: ICONS[role], chip: r.tone.chip }));

/** Role picker shown as a coloured badge; read-only (no chevron) when `disabled`. */
export default function RoleSelect({ value, onChange, disabled, label }) {
  return <Select value={value} onValueChange={onChange} options={ROLE_OPTIONS} disabled={disabled} aria-label={label} shape="pill" className="min-w-[8.5rem]" />;
}
