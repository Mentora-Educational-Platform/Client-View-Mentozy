import { useState, useRef, useEffect } from 'react';
import { useOrganizationMode, Organization } from '../../../context/OrganizationModeContext';
import { useAuth } from '../../../context/AuthContext';
import { Building2, User, ChevronDown, Check } from 'lucide-react';

interface ModeToggleProps {
    compact?: boolean;
}

export function ModeToggle({ compact = false }: ModeToggleProps) {
    const { user } = useAuth();
    const {
        mode,
        activeOrganization,
        userOrganizations,
        setMode,
        setActiveOrganization,
        hasOrganizations,
        loading,
    } = useOrganizationMode();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading || !hasOrganizations) return null;

    const isOrgAdmin = Boolean(user?.user_metadata?.is_org);

    const handleModeChange = (newMode: 'personal' | 'organization') => {
        if (newMode === 'organization' && userOrganizations.length > 1) {
            setIsDropdownOpen(true);
        } else {
            setMode(newMode);
            setIsDropdownOpen(false);
        }
    };

    const handleOrgSelect = (org: Organization) => {
        setActiveOrganization(org);
        setIsDropdownOpen(false);
    };

    // Organisation Admin layout: render active organisation selector without personal toggle
    if (isOrgAdmin) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => userOrganizations.length > 1 && setIsDropdownOpen(prev => !prev)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-full text-xs font-bold shadow-sm transition-all ${userOrganizations.length > 1 ? 'hover:bg-indigo-100 cursor-pointer' : 'cursor-default'}`}
                >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span className="truncate max-w-[140px]">
                        {activeOrganization?.name || 'Organization'}
                    </span>
                    {userOrganizations.length > 1 && (
                        <ChevronDown className={`w-3.5 h-3.5 text-indigo-500 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                </button>

                {isDropdownOpen && userOrganizations.length > 1 && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2.5 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Select Organization
                            </p>
                        </div>
                        <div className="max-h-64 overflow-y-auto py-1">
                            {userOrganizations.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => handleOrgSelect(org)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                                        ${activeOrganization?.id === org.id ? 'bg-indigo-50' : ''}
                                    `}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        {org.avatar_url ? (
                                            <img src={org.avatar_url} alt={org.name} className="w-8 h-8 rounded-xl object-cover" />
                                        ) : (
                                            <Building2 className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{org.name}</p>
                                    </div>
                                    {activeOrganization?.id === org.id && (
                                        <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Compact mode: used inside the org mode banner (suppressed for org admins)
    if (compact) {
        if (isOrgAdmin) return null;
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => handleModeChange('personal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-semibold transition-all backdrop-blur-sm border border-white/20"
                >
                    <User className="w-3.5 h-3.5" />
                    <span>Switch to Personal</span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Toggle Pill */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-1">
                {/* Personal Button */}
                <button
                    onClick={() => handleModeChange('personal')}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
                        ${mode === 'personal'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}
                    `}
                >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Personal</span>
                </button>

                {/* Separator dot */}
                <div className="w-px h-3 bg-gray-300 mx-0.5" />

                {/* Organization Button */}
                <button
                    onClick={() => handleModeChange('organization')}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
                        ${mode === 'organization'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}
                    `}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline truncate max-w-[120px]">
                        {mode === 'organization' && activeOrganization
                            ? activeOrganization.name
                            : 'Organization'}
                    </span>
                    {userOrganizations.length > 1 && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                </button>
            </div>

            {/* Organization Dropdown */}
            {isDropdownOpen && userOrganizations.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Select Organization
                        </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                        {userOrganizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleOrgSelect(org)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                                    ${activeOrganization?.id === org.id ? 'bg-indigo-50' : ''}
                                `}
                            >
                                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    {org.avatar_url ? (
                                        <img src={org.avatar_url} alt={org.name} className="w-8 h-8 rounded-xl object-cover" />
                                    ) : (
                                        <Building2 className="w-4 h-4 text-indigo-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{org.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {org.role === 'teacher' ? 'Teacher' : 'Student'}
                                    </p>
                                </div>
                                {activeOrganization?.id === org.id && (
                                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
