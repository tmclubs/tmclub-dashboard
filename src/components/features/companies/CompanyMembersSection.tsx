import React, { useState, useMemo } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    ShieldOff,
    Mail,
    Clock,
    Crown,
    Search,
    Check,
} from 'lucide-react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Avatar,
    Input,
    LoadingSpinner,
} from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { CompanyMember } from '@/types/api';
import { useInviteCompanyPIC, useRemoveCompanyPIC } from '@/lib/hooks/useCompanies';

export interface CompanyMembersSectionProps {
    companyId: number;
    members?: CompanyMember[];
    isAdmin: boolean;
    isLoading?: boolean;
}

export const CompanyMembersSection: React.FC<CompanyMembersSectionProps> = ({
    companyId,
    members = [],
    isAdmin,
    isLoading = false,
}) => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<CompanyMember | null>(null);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);

    const invitePICMutation = useInviteCompanyPIC();
    const removePICMutation = useRemoveCompanyPIC();

    const picMembers = members.filter((m) => m.is_pic);
    const regularMembers = members.filter((m) => !m.is_pic);

    const filteredCandidates = useMemo(() => {
        if (!searchQuery.trim()) return regularMembers;
        const query = searchQuery.toLowerCase();
        return regularMembers.filter(
            (m) =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query)
        );
    }, [regularMembers, searchQuery]);

    const handleInvitePIC = () => {
        if (!selectedCandidate) return;

        invitePICMutation.mutate(
            { companyId, email: selectedCandidate.email },
            {
                onSuccess: () => {
                    setShowInviteModal(false);
                    setSearchQuery('');
                    setSelectedCandidate(null);
                },
            }
        );
    };

    const handleRemovePIC = () => {
        if (!selectedMember) return;
        removePICMutation.mutate(
            { companyId, email: selectedMember.email },
            {
                onSuccess: () => {
                    setShowRemoveDialog(false);
                    setSelectedMember(null);
                },
            }
        );
    };

    const handleRemoveClick = (member: CompanyMember) => {
        setSelectedMember(member);
        setShowRemoveDialog(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const MemberCard: React.FC<{ member: CompanyMember }> = ({ member }) => (
        <div className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-orange-100 transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <Avatar
                        name={member.name}
                        size="md"
                        className={`border-2 ${member.is_pic
                            ? 'border-orange-300 ring-2 ring-orange-100'
                            : 'border-gray-100'
                            }`}
                    />
                    {member.is_pic && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                            <Crown className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {member.name}
                        </h4>
                        {member.is_pic && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs flex-shrink-0">
                                <Shield className="w-3 h-3 mr-1" />
                                PIC
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-400">Joined {formatDate(member.invited_at)}</p>
                    </div>
                </div>

                {/* Actions */}
                {isAdmin && member.is_pic && (
                    <div className="flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveClick(member)}
                            className="h-auto py-1.5 px-2.5 text-red-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all duration-200 group/btn"
                            title="Remove PIC status"
                        >
                            <ShieldOff className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline ml-1.5 text-xs font-medium">Remove PIC</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <Card className="shadow-sm">
                <CardContent className="flex items-center justify-center py-12">
                    <LoadingSpinner size="sm" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* PIC Section */}
                <Card className="shadow-sm border-orange-100">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <span className="text-gray-900">Person In Charge</span>
                                    <p className="text-xs text-gray-500 font-normal mt-0.5">
                                        Company representatives
                                    </p>
                                </div>
                            </CardTitle>
                            {isAdmin && (
                                <Button
                                    size="sm"
                                    onClick={() => setShowInviteModal(true)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                                >
                                    <UserPlus className="w-4 h-4 mr-1.5" />
                                    <span className="hidden sm:inline">Invite PIC</span>
                                    <span className="sm:hidden">Invite</span>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {picMembers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {picMembers.map((member) => (
                                    <MemberCard key={member.id} member={member} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4">
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                                    <Shield className="w-6 h-6 text-orange-300" />
                                </div>
                                <p className="text-sm text-gray-500">
                                    No PIC assigned yet
                                </p>
                                {isAdmin && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Click "Invite PIC" to assign a person in charge
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Regular Members Section */}
                {regularMembers.length > 0 && (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <span className="text-gray-900">Members</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        {regularMembers.length}
                                    </Badge>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {regularMembers.map((member) => (
                                    <MemberCard key={member.id} member={member} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Invite PIC Modal */}
            <Modal
                open={showInviteModal}
                onClose={() => {
                    setShowInviteModal(false);
                    setSearchQuery('');
                    setSelectedCandidate(null);
                }}
                title="Invite PIC"
                description="Select a member to assign as Person In Charge"
                size="sm"
                preventClose={invitePICMutation.isPending}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowInviteModal(false);
                                setSearchQuery('');
                                setSelectedCandidate(null);
                            }}
                            disabled={invitePICMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInvitePIC}
                            loading={invitePICMutation.isPending}
                            disabled={!selectedCandidate}
                            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4 mr-1.5" />
                            Assign as PIC
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <p className="text-sm text-orange-800">
                            <strong>Note:</strong> Select from the list of company members.
                            The PIC will have access to manage this company's data.
                        </p>
                    </div>

                    {/* Search input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            disabled={invitePICMutation.isPending}
                            autoFocus
                        />
                    </div>

                    {/* Member list */}
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((member) => {
                                const isSelected = selectedCandidate?.id === member.id;
                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => setSelectedCandidate(isSelected ? null : member)}
                                        disabled={invitePICMutation.isPending}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                                            ? 'border-orange-400 bg-orange-50 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Avatar
                                                name={member.name}
                                                size="sm"
                                                className={`border ${isSelected ? 'border-orange-300' : 'border-gray-200'}`}
                                            />
                                            {isSelected && (
                                                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        </div>
                                        {isSelected && (
                                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs flex-shrink-0">
                                                Selected
                                            </Badge>
                                        )}
                                    </button>
                                );
                            })
                        ) : regularMembers.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">All members are already assigned as PIC</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Add new members first
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-6 px-4">
                                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    No members found for "{searchQuery}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Remove PIC Confirm Dialog */}
            <ConfirmDialog
                open={showRemoveDialog}
                onClose={() => {
                    setShowRemoveDialog(false);
                    setSelectedMember(null);
                }}
                onConfirm={handleRemovePIC}
                title="Remove PIC Status"
                description={`Are you sure you want to remove PIC status from "${selectedMember?.name}"? They will become a regular member.`}
                confirmText="Remove PIC"
                cancelText="Cancel"
                variant="destructive"
                loading={removePICMutation.isPending}
            />
        </>
    );
};

export default CompanyMembersSection;
