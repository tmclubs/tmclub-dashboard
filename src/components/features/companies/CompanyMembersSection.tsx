import React, { useState, useMemo, useCallback } from 'react';
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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const CompanyPICSection: React.FC<CompanyMembersSectionProps> = ({
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

    const handleCloseInviteModal = useCallback(() => {
        setShowInviteModal(false);
        setSearchQuery('');
        setSelectedCandidate(null);
    }, []);

    const handleCloseRemoveDialog = useCallback(() => {
        setShowRemoveDialog(false);
        setSelectedMember(null);
    }, []);

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
            <Card className="shadow-sm border-orange-100">
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <span className="text-gray-900 font-bold">Person In Charge</span>
                                <p className="text-xs text-gray-500 font-normal mt-0.5">
                                    Company representatives
                                </p>
                            </div>
                        </CardTitle>
                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => setShowInviteModal(true)}
                                className="w-fit bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                            >
                                <UserPlus className="w-4 h-4 mr-1.5" />
                                Invite PIC
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {picMembers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {picMembers.map((member) => (
                                <div key={member.id} className="relative bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="relative">
                                            <Avatar name={member.name} size="md" className="border-2 border-orange-100 bg-orange-50 text-orange-700" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                                                <Crown className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0">PIC</Badge>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleRemoveClick(member)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Remove PIC"
                                                >
                                                    <ShieldOff className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                            <p className="text-xs text-gray-400">Joined {formatDate(member.invited_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-2">
                                <Shield className="w-5 h-5 text-orange-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">No PIC assigned</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invite PIC Modal */}
            <Modal
                open={showInviteModal}
                onClose={handleCloseInviteModal}
                title="Invite PIC"
                description="Select a member to assign as Person In Charge"
                size="sm"
                preventClose={invitePICMutation.isPending}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={handleCloseInviteModal}
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

                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                        disabled={invitePICMutation.isPending}
                        autoFocus
                    />

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
                                    </button>
                                );
                            })
                        ) : regularMembers.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">All members are already assigned as PIC</p>
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

            <ConfirmDialog
                open={showRemoveDialog}
                onClose={handleCloseRemoveDialog}
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

export const CompanyRegularMembersSection: React.FC<CompanyMembersSectionProps> = ({
    members = [],
    isLoading = false,
}) => {
    const regularMembers = members.filter((m) => !m.is_pic);

    if (isLoading) {
        return (
            <Card className="shadow-sm">
                <CardContent className="flex items-center justify-center py-12">
                    <LoadingSpinner size="sm" />
                </CardContent>
            </Card>
        );
    }

    if (regularMembers.length === 0) return null;

    return (
        <Card className="shadow-sm border-gray-200 mt-6 md:mt-8">
            <CardHeader className="pb-4 border-b border-gray-50 mb-4 px-6 md:px-8">
                <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-gray-900">Members</span>
                    <Badge variant="secondary" className="ml-1 text-xs px-2 bg-gray-100 text-gray-600">
                        {regularMembers.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {regularMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50/50 transition-colors">
                            <Avatar name={member.name} size="md" className="shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm truncate">{member.name}</h4>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">{member.email}</p>
                            </div>
                            <p className="text-[10px] border border-gray-100 rounded px-1.5 py-0.5 text-gray-400 bg-gray-50 shrink-0 whitespace-nowrap hidden sm:block">
                                {formatDate(member.invited_at)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

