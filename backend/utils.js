import { convert } from 'pdf-poppler';
import fs from 'fs';
import path from 'path';
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: 'apt-terrain-439708-k2-0d203cb25f5a.json', // Replace with your key file path
});

// Extract text from a PDF using Google Vision API
const extractTextFromPdf = async (pdfFilePath) => {
  const outputDir = path.join(process.cwd(), 'images');

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

  for (const file of files) {
    const filePath = path.join(outputDir, file);

    // Run text detection on the image
    const [result] = await client.textDetection(filePath);
    const textAnnotations = result.textAnnotations;
    extractedText += textAnnotations.length ? textAnnotations[0].description : '';

    fs.unlinkSync(filePath); // Clean up after OCR
  }

  return extractedText;
};

const separateAnswers = (extractedText) => {
  // Define the regex pattern to split text based on numbered answers, e.g., "1. ", "2. "
  const answerPattern = /\d+\.\s/;
  const answersArray = extractedText.split(answerPattern).filter((answer) => answer.trim() !== '');

  const answersMap = new Map();

  // Populate the map with question number as key and answer as value
  answersArray.forEach((answer, index) => {
    // Question numbers typically start from 1, so increment index by 1
    const questionNumber = index + 1;
    answersMap.set(questionNumber, answer.trim());
  });

  return answersMap;
};

// Evaluate the student's answers based on the extracted text and answer key
// Evaluate the student's answers based on the extracted text and answer key
const evaluateStudentAnswerSheet = (extractedText, answerKey) => {
  const answersMap = separateAnswers(extractedText);
  let totalScore = 0;
  const scoreDetails = {}; // Object to store scores for each question

  // Function to perform a simple grammar check (for demonstration)
  const simpleGrammarCheck = (answer) => {
    // Check if the answer ends with a period (basic sentence check)
    return answer.trim().endsWith('.');
  };

  // Iterate through each question in the answer key
  answerKey.questions.forEach((question) => {
    const questionNumber = question.question_number; // Get the question number
    const keywords = question.keywords; // Get the keywords for the question
    const studentAnswer = answersMap.get(questionNumber); // Get the student's answer

    // Start with the maximum points for this question
    let questionScore = question.max_points;

    if (studentAnswer) {
      const wordCount = studentAnswer.split(/\s+/).length; // Count words in the student's answer

      // Check if the answer meets the minimum word count
      const meetsWordCount = wordCount >= question.min_words;

      // Check if any of the keywords are present in the student's answer
      const hasKeywords = keywords.some(keyword =>
        studentAnswer.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check for basic grammar
      const hasGoodGrammar = simpleGrammarCheck(studentAnswer);

      // Deduct points based on criteria
      if (!hasKeywords) {
        questionScore -= question.max_points * 0.3;
      }
      if (!meetsWordCount) {
        questionScore -= question.max_points * 0.05;
      }
      if (!hasGoodGrammar) {
        questionScore -= question.max_points * 0.01;
      }
    } else {
      // If there's no answer, score is 0 for that question
      questionScore = 0;
    }

    // Ensure that the score does not go below zero
    if (questionScore < 0) {
      questionScore = 0;
    }

    // Round the question score to the ceiling
    questionScore = Math.ceil(questionScore);
    
    totalScore += questionScore; // Add question score to total score
    scoreDetails[questionNumber] = questionScore; // Store the rounded score for this question
  });

  // Round the total score to the ceiling
  totalScore = Math.ceil(totalScore);

  return { totalScore, scoreDetails }; // Return the total score and the score details
};


export { extractTextFromPdf, separateAnswers, evaluateStudentAnswerSheet };
