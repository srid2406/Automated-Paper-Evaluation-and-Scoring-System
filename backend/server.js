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
    // Step 1: Extract text from the uploaded PDF using pytesseract
    const extractedText = await extractTextFromPdf(pdfFilePath);

    // Step 2: Fetch answer key from Firestore based on the provided ID
    const answerKeyRef = db.collection('answerKeys').doc(answerKeyId);
    const answerKeyDoc = await answerKeyRef.get();

    if (!answerKeyDoc.exists) {
      return res.status(404).json({ success: false, message: 'Answer key not found' });
    }

    const answerKey = answerKeyDoc.data();

    // Step 3: Evaluate student's answers
    const score = evaluateStudentAnswerSheet(extractedText, answerKey);

    // Step 4: Store the evaluation results in Firestore
    await db.collection('studentScores').doc(registrationNumber).set({
      subject: answerKey.exam_title, // Make sure this is in your answer key structure
      score: score,
    });

    const ans = separateAnswers(extractedText);
    

    // Clean up uploaded file
    fs.unlinkSync(pdfFilePath);

    return res.json({ success: true, score: score, extractedText: extractedText });
  } catch (error) {
    console.error('Error processing the PDF:', error);
    res.status(500).json({ success: false, message: 'Evaluation failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
