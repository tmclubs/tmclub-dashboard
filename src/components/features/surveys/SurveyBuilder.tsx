import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  CheckSquare,
  Radio,
  MessageSquare,
  Star,
  Settings,
  Eye,
  Save
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';

export interface SurveyQuestion {
  id: number;
  type: 'text' | 'textarea' | 'single' | 'multiple' | 'rating' | 'dropdown';
  title: string;
  required: boolean;
  options?: string[];
  description?: string;
  placeholder?: string;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'closed';
  responses?: number;
}

export interface SurveyBuilderProps {
  survey?: Partial<Survey>;
  onSave: (survey: Survey) => void;
  onPreview?: (survey: Survey) => void;
  loading?: boolean;
}

const questionTypes = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Paragraph', icon: MessageSquare },
  { value: 'single', label: 'Single Choice', icon: Radio },
  { value: 'multiple', label: 'Multiple Choice', icon: CheckSquare },
  { value: 'rating', label: 'Rating', icon: Star },
  { value: 'dropdown', label: 'Dropdown', icon: Settings },
];

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  survey,
  onSave,
  onPreview,
  loading = false,
}) => {
  const [title, setTitle] = useState(survey?.title || '');
  const [description, setDescription] = useState(survey?.description || '');
  const [questions, setQuestions] = useState<SurveyQuestion[]>(survey?.questions || []);

  const addQuestion = (type: SurveyQuestion['type']) => {
    const newQuestion: SurveyQuestion = {
      id: Date.now(),
      type,
      title: '',
      required: false,
      options: ['single', 'multiple', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
        : q
    ));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId && q.options
        ? {
            ...q,
            options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
          }
        : q
    ));
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId && q.options
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ));
  };

  const handleSave = () => {
    const surveyData: Survey = {
      id: survey?.id || Date.now(),
      title,
      description,
      questions,
      createdAt: survey?.createdAt || new Date().toISOString(),
      status: 'draft',
    };
    onSave(surveyData);
  };

  const handlePreview = () => {
    const surveyData: Survey = {
      id: survey?.id || Date.now(),
      title,
      description,
      questions,
      createdAt: survey?.createdAt || new Date().toISOString(),
      status: 'draft',
    };
    onPreview?.(surveyData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Input
                placeholder="Survey Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none p-0 shadow-none focus:ring-0 mb-2"
              />
              <textarea
                placeholder="Survey Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-none p-0 shadow-none focus:ring-0 text-gray-600 resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Preview
              </Button>
              <Button
                onClick={handleSave}
                loading={loading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Survey
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Question Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Add Question</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {questionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant="outline"
                  onClick={() => addQuestion(type.value as SurveyQuestion['type'])}
                  className="flex-col h-auto p-4 justify-start"
                >
                  <Icon className="w-6 h-6 mb-2 text-orange-600" />
                  <span className="text-sm font-medium">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 mt-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <span className="text-sm text-gray-500 font-medium">
                    Q{index + 1}
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  {/* Question Title */}
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Question Title"
                      value={question.title}
                      onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                      className="flex-1"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      Required
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Question Description */}
                  <Input
                    placeholder="Question Description (optional)"
                    value={question.description || ''}
                    onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                  />

                  {/* Question Options */}
                  {question.type === 'text' && (
                    <Input
                      placeholder="Placeholder text (optional)"
                      value={question.placeholder || ''}
                      onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                    />
                  )}

                  {question.type === 'textarea' && (
                    <Input
                      placeholder="Placeholder text (optional)"
                      value={question.placeholder || ''}
                      onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                    />
                  )}

                  {['single', 'multiple', 'dropdown'].includes(question.type) && question.options && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Options</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addOption(question.id)}
                          leftIcon={<Plus className="w-3 h-3" />}
                        >
                          Add Option
                        </Button>
                      </div>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Option {optionIndex + 1}</span>
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            className="flex-1"
                          />
                          {question.options!.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'rating' && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Rating Scale:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 text-gray-300" />
                        ))}
                      </div>
                      <span className="text-xs">(1-5 scale)</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your survey by adding your first question above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save Footer */}
      {questions.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Survey
          </Button>
        </div>
      )}
    </div>
  );
};