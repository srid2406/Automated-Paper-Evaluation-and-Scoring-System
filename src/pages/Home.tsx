import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="page-content">
      <div className="hero-section">
        <h1 className="text-center mb-6">Automated Exam Paper Evaluation System</h1>
        <div className="card">
          <div className="card-body">
            <h2 className="mb-4">About the System</h2>
            <div className="content-section">
              <p className="mb-4">
                Examinations play a very important role in colleges, universities and various other 
                educational institutes. The main objective of an automated exam paper evaluation system 
                is to evaluate the subjective answer written by the student automatically using the 
                proposed system and award marks to the student. Automatic evaluation of answer paper 
                would be beneficial for the universities, schools and colleges for academic purpose 
                by providing ease to faculties and the examination evaluation cell. The proposed 
                system evaluates the answer based on the key answer. By comparing the standard 
                answer and the student's answer marks is obtained. Hence the proposed system could 
                be of great utility to the evaluators, as it saves them the trouble of evaluating 
                the bundles of papers.
              </p>

              <h3 className="mb-3">Project Overview</h3>
              <p className="mb-4">
                This project aims to automate the exam evaluation process. The answer paper has to 
                be scanned and using handwriting recognition technique in machine learning the answers 
                written by the students has to be converted into standard text format. Once the 
                answers are converted into document format summarization techniques has to be carried 
                out, in order to create a summary with the major points of the original document.
              </p>

              <h3 className="mb-3">System Features</h3>
              <p>
                The proposed model expects the admin to store the key answers in the system. The 
                summarized answers will be evaluated automatically by the system based on the key 
                answers provided in advance. The system will award the marks in percentage which 
                will be recorded to calculate the overall results.
              </p>
            </div>
          </div>
        </div>

        <div className="features-grid mt-6">
          <div className="card">
            <div className="card-body">
              <h3>Handwriting Recognition</h3>
              <p>Advanced ML techniques to convert written answers to text</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3>Text Summarization</h3>
              <p>Automatic extraction of key points from answers</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3>Automated Evaluation</h3>
              <p>Systematic comparison with model answers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;