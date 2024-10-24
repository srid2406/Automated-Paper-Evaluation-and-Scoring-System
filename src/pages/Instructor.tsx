/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '../../firebaseConfig.ts';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AnswerKey {
  id: string;
  exam_title: string;
  questions: {
    question_number: number;
    keywords: string[];
    min_words: number;
    max_points: number;
  }[];
}

const Instructor: React.FC = () => {
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [currentKey, setCurrentKey] = useState<Partial<AnswerKey>>({
    exam_title: '',
    questions: []
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchAnswerKeys();
  }, []);

  const fetchAnswerKeys = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'answerKeys'));
      const keysData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as AnswerKey[];
      setAnswerKeys(keysData);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to fetch answer keys' });
    }
  };

  const handleAddQuestion = () => {
    setCurrentKey(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          question_number: (prev.questions?.length || 0) + 1,
          keywords: [],
          min_words: 100,
          max_points: 10
        }
      ]
    }));
  };

  const handleAddKeyword = (questionIndex: number) => {
    const newQuestions = [...(currentKey.questions || [])];
    newQuestions[questionIndex].keywords.push('');
    setCurrentKey({ ...currentKey, questions: newQuestions });
  };

  const handleKeywordChange = (questionIndex: number, keywordIndex: number, value: string) => {
    const newQuestions = [...(currentKey.questions || [])];
    newQuestions[questionIndex].keywords[keywordIndex] = value;
    setCurrentKey({ ...currentKey, questions: newQuestions });
  };

  const handleRemoveKeyword = (questionIndex: number, keywordIndex: number) => {
    const newQuestions = [...(currentKey.questions || [])];
    newQuestions[questionIndex].keywords.splice(keywordIndex, 1);
    setCurrentKey({ ...currentKey, questions: newQuestions });
  };

  const handleSaveAnswerKey = async () => {
    try {
      // Ensure exam_title is defined before proceeding
      if (!currentKey.exam_title) {
        setStatus({ type: 'error', message: 'Exam title is required' });
        return;
      }

      // Format the subject key
      const subjectKey = currentKey.exam_title.replace(/\s+/g, '_').toLowerCase();

      // Save to Firestore
      await setDoc(doc(db, 'answerKeys', subjectKey), currentKey); // Save answer key to Firestore

      setStatus({ type: 'success', message: 'Answer key saved successfully' });
      fetchAnswerKeys();
      setIsAddingNew(false);
      setCurrentKey({ exam_title: '', questions: [] });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save answer key' });
    }
  };

  const handleDeleteAnswerKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this answer key?')) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'answerKeys', id));

      setStatus({ type: 'success', message: 'Answer key deleted successfully' });
      fetchAnswerKeys();
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to delete answer key' });
    }
  };

  return (
    <div className="page-content">
      <div className="flex justify-between items-center mb-6">
        <h1>Answer Key Management</h1>
        {!isAddingNew && (
          <button 
            className="button button-primary flex items-center gap-2"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus size={20} />
            Add New Answer Key
          </button>
        )}
      </div>

      {status && (
        <Alert className={`mb-4 ${status.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      {isAddingNew ? (
        <div className="card">
          <div className="card-header">
            <h2>Create New Answer Key</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Exam Title</label>
              <input
                type="text"
                value={currentKey.exam_title}
                onChange={(e) => setCurrentKey({ ...currentKey, exam_title: e.target.value })}
                className="input"
                placeholder="Enter exam title"
              />
            </div>

            {currentKey.questions?.map((question, qIndex) => (
              <div key={qIndex} className="question-section mb-6 p-4 border rounded">
                <h3>Question {question.question_number}</h3>
                
                <div className="form-group">
                  <label>Minimum Words</label>
                  <input
                    type="number"
                    value={question.min_words}
                    onChange={(e) => {
                      const newQuestions = [...currentKey.questions!];
                      newQuestions[qIndex].min_words = parseInt(e.target.value);
                      setCurrentKey({ ...currentKey, questions: newQuestions });
                    }}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Points</label>
                  <input
                    type="number"
                    value={question.max_points}
                    onChange={(e) => {
                      const newQuestions = [...currentKey.questions!];
                      newQuestions[qIndex].max_points = parseInt(e.target.value);
                      setCurrentKey({ ...currentKey, questions: newQuestions });
                    }}
                    className="input"
                  />
                </div>

                <div className="keywords-section">
                  <label>Keywords</label>
                  {question.keywords.map((keyword, kIndex) => (
                    <div key={kIndex} className="keyword-input flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => handleKeywordChange(qIndex, kIndex, e.target.value)}
                        className="input"
                        placeholder="Enter keyword"
                      />
                      <button
                        className="button button-danger"
                        onClick={() => handleRemoveKeyword(qIndex, kIndex)}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="button button-secondary mt-2"
                    onClick={() => handleAddKeyword(qIndex)}
                  >
                    Add Keyword
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <button
                className="button button-secondary"
                onClick={handleAddQuestion}
              >
                Add Question
              </button>
              <button
                className="button button-primary"
                onClick={handleSaveAnswerKey}
              >
                Save Answer Key
              </button>
              <button
                className="button button-danger"
                onClick={() => {
                  setIsAddingNew(false);
                  setCurrentKey({ exam_title: '', questions: [] });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="answer-keys-grid">
          {answerKeys.map((key) => (
            <div key={key.id} className="card">
              <div className="card-header">
                <h3>{key.exam_title}</h3>
                <div className="flex gap-2">
                  <button
                    className="icon-button"
                    onClick={() => {
                      setCurrentKey(key);
                      setIsAddingNew(true);
                    }}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    className="icon-button text-red-500"
                    onClick={() => handleDeleteAnswerKey(key.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="key-info">
                  <p><strong>Questions:</strong> {key.questions.length}</p>
                  <ul className="question-list">
                    {key.questions.map((q, i) => (
                      <li key={i}>
                        Question {q.question_number}: {q.keywords.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Instructor;
