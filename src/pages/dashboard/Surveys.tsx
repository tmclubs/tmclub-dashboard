import React, { useState } from 'react';
import { SurveyBuilder, SurveyList, type Survey, type SurveyQuestion } from '../../components/features/surveys';
import { Button, ConfirmDialog } from '../../components/ui';

export const SurveysPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock questions for demo surveys
  const mockQuestions: SurveyQuestion[] = [
    { id: 1, type: 'text', title: 'What is your name?', required: true },
    { id: 2, type: 'single', title: 'How satisfied are you?', required: true, options: ['Very satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'] },
  ];

  // Mock data - will be replaced with API calls
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: 1,
      title: 'Event Feedback Form 2024',
      description: 'Comprehensive feedback survey for our annual tech conference 2024',
      questions: mockQuestions,
      responses: 45,
      status: 'published',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'Member Satisfaction Survey',
      description: 'Monthly survey to gauge member satisfaction with TMC services',
      questions: mockQuestions,
      responses: 156,
      status: 'published',
      createdAt: '2024-01-10T14:30:00Z',
    },
    {
      id: 3,
      title: 'New Feature Request Survey',
      description: 'Gather feedback on potential new features for the TMC platform',
      questions: mockQuestions,
      responses: 0,
      status: 'draft',
      createdAt: '2024-01-20T16:45:00Z',
    },
    {
      id: 4,
      title: 'Workshop Interest Survey',
      description: 'Survey to determine interest in upcoming workshop topics',
      questions: mockQuestions,
      responses: 89,
      status: 'closed',
      createdAt: '2023-12-15T11:20:00Z',
    },
  ]);

  const handleCreateSurvey = async (survey: Survey) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSurveys(prev => [...prev, survey]);
      setShowCreateModal(false);
      setView('list');

      // TODO: Show success toast
      console.log('Survey created successfully');
    } catch (error) {
      console.error('Failed to create survey:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSurvey = async (survey: Survey) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSurveys(prev =>
        prev.map(s => s.id === survey.id ? survey : s)
      );

      setShowEditModal(false);
      setSelectedSurvey(null);
      setView('list');

      // TODO: Show success toast
      console.log('Survey updated successfully');
    } catch (error) {
      console.error('Failed to update survey:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurvey = async () => {
    if (!selectedSurvey) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSurveys(prev => prev.filter(s => s.id !== selectedSurvey.id));

      setShowDeleteDialog(false);
      setSelectedSurvey(null);

      // TODO: Show success toast
      console.log('Survey deleted successfully');
    } catch (error) {
      console.error('Failed to delete survey:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleEditSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowEditModal(true);
    setView('builder');
  };

  const handleDeleteClick = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowDeleteDialog(true);
  };

  const handlePreviewSurvey = (survey: Survey) => {
    // TODO: Implement preview functionality
    console.log('Preview survey:', survey);
  };

  const handleViewResults = (survey: Survey) => {
    // TODO: Navigate to results page
    console.log('View results:', survey);
  };

  const handleShareSurvey = (survey: Survey) => {
    // TODO: Implement share functionality
    console.log('Share survey:', survey);
  };

  if (view === 'builder' && showCreateModal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Survey</h1>
            <p className="text-gray-600 mt-1">Build your custom survey with questions</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateModal(false);
              setView('list');
            }}
          >
            Back to Surveys
          </Button>
        </div>

        <SurveyBuilder
          onSave={handleCreateSurvey}
          loading={loading}
          onPreview={handlePreviewSurvey}
        />
      </div>
    );
  }

  if (view === 'builder' && showEditModal && selectedSurvey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Survey</h1>
            <p className="text-gray-600 mt-1">Modify your survey questions and settings</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setSelectedSurvey(null);
              setView('list');
            }}
          >
            Back to Surveys
          </Button>
        </div>

        <SurveyBuilder
          survey={selectedSurvey}
          onSave={handleUpdateSurvey}
          loading={loading}
          onPreview={handlePreviewSurvey}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SurveyList
        surveys={surveys}
        onCreate={() => {
          setShowCreateModal(true);
          setView('builder');
        }}
        onEdit={handleEditSurvey}
        onDelete={handleDeleteClick}
        onPreview={handlePreviewSurvey}
        onViewResults={handleViewResults}
        onShare={handleShareSurvey}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSurvey}
        title="Delete Survey"
        description={`Are you sure you want to delete "${selectedSurvey?.title}"? This action cannot be undone and will also remove all response data.`}
        confirmText="Delete Survey"
        cancelText="Cancel"
        variant="destructive"
        loading={loading}
      />
    </div>
  );
};