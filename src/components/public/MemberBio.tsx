import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Edit } from 'lucide-react';

interface MemberBioProps {
  bio?: string;
  isEditable?: boolean;
  onSave?: (newBio: string) => void;
  showTitle?: boolean;
}

export const MemberBio: React.FC<MemberBioProps> = ({ 
  bio = '', 
  isEditable = false, 
  onSave,
  showTitle = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(bio);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    
    setLoading(true);
    try {
      await onSave(draft);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save bio', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(bio);
  };

  return (
    <div>
      {(showTitle || isEditable) && (
        <div className="flex items-center justify-between mb-2">
          {showTitle && <h3 className="text-lg font-semibold text-gray-900">Bio</h3>}
          {isEditable && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(v => !v)} 
              aria-label="Edit Bio"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
            placeholder="Tuliskan bio singkat Anda..."
            disabled={loading}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{draft.length}/500</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap">{bio || 'Belum ada bio.'}</p>
      )}
    </div>
  );
};
