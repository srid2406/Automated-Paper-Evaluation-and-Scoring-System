import { createWorker } from 'tesseract.js'; // Use CDN for ESM build
import { convert } from 'pdf-poppler';
import fs from 'fs';
import path from 'path';

// Create a worker for Tesseract.js

// Extract text from a PDF
const extractTextFromPdf = async (pdfFilePath) => {
  const outputDir = path.join(process.cwd(), 'images'); // Use process.cwd() for absolute path
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await convert(pdfFilePath, {
    out_dir: outputDir,
    format: 'png',
  });

  let extractedText = '';
  const files = fs.readdirSync(outputDir);

  const worker = await createWorker('eng');


  for (const file of files) {
    const filePath = path.join(outputDir, file);
    const { data: { text } } = await worker.recognize(filePath);
    extractedText += text;
    fs.unlinkSync(filePath); // Clean up after OCR
  }

  // Terminate the worker
  await worker.terminate();

  return extractedText;
};

// Evaluate the student's answers based on the extracted text and answer key
const evaluateStudentAnswerSheet = (extractedText, answerKey) => {
  let score = 0;
  // Implement your logic here to compare extractedText with answerKey
  return score;
};

export { extractTextFromPdf, evaluateStudentAnswerSheet };
