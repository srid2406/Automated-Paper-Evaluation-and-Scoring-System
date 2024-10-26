import express from 'express';
import multer from 'multer';
import firebaseAdmin from 'firebase-admin';
import fs from 'fs';
import cors from 'cors';
import { extractTextFromPdf, evaluateStudentAnswerSheet, separateAnswers } from './utils.js';

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Initialize Firestore
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert('automated-paper-evaluati-3fcea-firebase-adminsdk-8zc2l-0681ae7ebb.json'),
});
const db = firebaseAdmin.firestore();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/api/evaluate', upload.single('pdfFile'), async (req, res) => {
  const { registrationNumber, answerKeyId } = req.body;
  const pdfFilePath = req.file.path;

  try {
    // Step 1: Extract text from the uploaded PDF
    const extractedText = await extractTextFromPdf(pdfFilePath);

    // Step 2: Fetch answer key from Firestore based on the provided ID
    const answerKeyRef = db.collection('answerKeys').doc(answerKeyId);
    const answerKeyDoc = await answerKeyRef.get();

    if (!answerKeyDoc.exists) {
      return res.status(404).json({ success: false, message: 'Answer key not found' });
    }

    const answerKey = answerKeyDoc.data();

    // Step 3: Evaluate student's answers
    const { totalScore, scoreDetails } = evaluateStudentAnswerSheet(extractedText, answerKey);
    

    // Step 4: Store the evaluation results in Firestore
    const scoreData = {
      subject: answerKey.exam_title, // Make sure this is in your answer key structure
      questions: scoreDetails, // Store the detailed scores for each question
      totalScore: totalScore, // Store the total score
    };

    // Check if studentScores document already exists
    const studentScoresRef = db.collection('studentScores').doc(registrationNumber);
    const studentScoresDoc = await studentScoresRef.get();

    if (studentScoresDoc.exists) {
      // If the document exists, update it with the new subject scores
      await studentScoresRef.update({
        [answerKey.exam_title]: scoreData,
      });
    } else {
      // If the document does not exist, create a new one
      await studentScoresRef.set({
        [answerKey.exam_title]: scoreData,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(pdfFilePath);

    return res.json({
      success: true,
      message: 'Evaluation completed successfully.',
      subject: answerKey.exam_title,
      totalScore: totalScore,
      scoreDetails: scoreDetails, // Include the details of each question
    });  } catch (error) {
    console.error('Error processing the PDF:', error);
    res.status(500).json({ success: false, message: 'Evaluation failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
