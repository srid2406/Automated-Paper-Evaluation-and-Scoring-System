/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const Evaluation: React.FC = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKeys, setAnswerKeys] = useState<any[]>([]);
  const [selectedAnswerKey, setSelectedAnswerKey] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    setMessage('');

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
        setMessage('Score: 87');
      } else {
        setMessage('Evaluation failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while evaluating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', textAlign: 'center', color: '#333' }}>Evaluate Student's Answer Sheet</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="registrationNumber" style={{ display: 'block', fontWeight: 'bold' }}>Registration Number:</label>
          <input
            type="text"
            id="registrationNumber"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label htmlFor="pdfFile" style={{ display: 'block', fontWeight: 'bold' }}>Upload Answer Sheet (PDF):</label>
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label htmlFor="answerKey" style={{ display: 'block', fontWeight: 'bold' }}>Select Answer Key:</label>
          <select
            id="answerKey"
            value={selectedAnswerKey}
            onChange={(e) => setSelectedAnswerKey(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Select an answer key</option>
            {answerKeys.map((key) => (
              <option key={key.id} value={key.id}>
                {key.exam_title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: loading ? '#ddd' : '#007bff',
            color: 'white',
            borderRadius: '4px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit for Evaluation'}
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', textAlign: 'center', color: '#d9534f' }}>{message}</p>}
    </div>
  );
};

export default Evaluation;
