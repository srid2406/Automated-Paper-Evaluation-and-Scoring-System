/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../../firebaseConfig.ts'; // Ensure you have your Firebase config here
import { collection, getDocs } from 'firebase/firestore';

const Evaluation: React.FC = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKeys, setAnswerKeys] = useState<any[]>([]);
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const fetchAnswerKeys = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'answerKeys'));
        const keysData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnswerKeys(keysData);
      } catch (error) {
        console.error('Failed to fetch answer keys', error);
      }
    };

    fetchAnswerKeys();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPdfFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pdfFile || !registrationNumber || !selectedAnswerKey) {
      setMessage('Please provide registration number, answer sheet, and select an answer key.');
      return;
    }

    setLoading(true); // Start loading
    setMessage(''); // Clear previous messages

    try {
      const formData = new FormData();
      formData.append('registrationNumber', registrationNumber);
      formData.append('pdfFile', pdfFile);
      formData.append('answerKeyId', selectedAnswerKey);

      const response = await axios.post('http://localhost:3000/api/evaluate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // setMessage(`Answer: ${response.data.extractedText}`);
        setMessage(`Evaluation completed successfully! Score: ${response.data.score}`);
      } else {
        setMessage('Evaluation failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while evaluating.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h1>Evaluate Student's Answer Sheet</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="registrationNumber">Registration Number:</label>
          <input
            type="text"
            id="registrationNumber"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="pdfFile">Upload Answer Sheet (PDF):</label>
          <input type="file" id="pdfFile" accept=".pdf" onChange={handleFileChange} required />
        </div>
        <div>
          <label htmlFor="answerKey">Select Answer Key:</label>
          <select
            id="answerKey"
            value={selectedAnswerKey}
            onChange={(e) => setSelectedAnswerKey(e.target.value)}
            required
          >
            <option value="">Select an answer key</option>
            {answerKeys.map((key) => (
              <option key={key.id} value={key.id}>
                {key.exam_title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Evaluation'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Evaluation;
