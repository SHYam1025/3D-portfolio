import { useState } from "react";
import "./styles/Career.css";

const Career = () => {
  const [showMasinDetails, setShowMasinDetails] = useState(false);

  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          {/* Current Role: Masin AI */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="role-header">
                <img src="/images/masin.png" alt="Masin AI" className="company-logo" />
                <div>
                  <h4>AI Engineering Intern</h4>
                  <h5><a href="https://masin.ai/" target="_blank" rel="noopener noreferrer" className="company-link">Masin AI ↗</a></h5>
                </div>
              </div>
              <h3>PRESENT</h3>
            </div>
            <div className="career-description-container">
              <p>
                Architecting production-grade Generative AI systems, focusing on RAG pipelines, 
                autonomous agents, and document intelligence.
              </p>
              <button className="details-btn" onClick={() => setShowMasinDetails(!showMasinDetails)}>
                {showMasinDetails ? "Hide Impact" : "View Internship Impact"}
              </button>
              {showMasinDetails && (
                <ul className="details-list">
                  <li>Built end-to-end <strong>RAG-based pipelines</strong> for legal document analysis.</li>
                  <li>Developed<strong>AI Agents and Agentic Workflows</strong> using Langchain and LangGraph</li>
                  <li>Engineered vision workflows with <strong>YOLO + OCR</strong> for engineering drawings.</li>
                  <li>Designed scalable processing architectures (chunking, embeddings, retrieval).</li>
                  <li>Implemented citation grounding to reduce LLM hallucinations.</li>
                </ul>
              )}
            </div>
          </div>

          {/* Leadership: BitWise */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="role-header">
                <img src="/images/bitwise.png" alt="BitWise Club" className="company-logo" />
                <div>
                  <h4>Secretary</h4>
                  <h5>BitWise Club</h5>
                </div>
              </div>
              <h3>2023–24</h3>
            </div>
            <div className="career-description-container">
              <p>
                Led a community of 50+ students, organizing hackathons and technical workshops 
                to bridge the gap between academia and industry.
              </p>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <h2 style={{ marginTop: '150px' }}>
          Education <span>&</span>
          <br /> Qualifications
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          {/* University */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="role-header">
                <img src="/images/jaypee.png" alt="Jaypee University" className="company-logo" />
                <div>
                  <h4>B.Tech in Computer Science</h4>
                  <h5>Jaypee University of Engineering and Technology</h5>
                </div>
              </div>
              <h3>2021–25</h3>
            </div>
            <div className="career-description-container">
              <p>
                <strong>AI Engineer</strong> specializing in Generative AI. 
                Architected and deployed systems like <strong>DataForge_pro</strong>, 
                <strong>Citation-RAG</strong>, and <strong>FraudX</strong>.
              </p>
            </div>
          </div>

          {/* Class XII */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="role-header">
                <img src="/images/krmangalam.png" alt="K R Mangalam" className="company-logo" />
                <div>
                  <h4>Class XII (CBSE)</h4>
                  <h5>K R Mangalam World School</h5>
                </div>
              </div>
              <h3>2020–21</h3>
            </div>
            <div className="career-description-container">
              <p className="edu-percent">Score: 82%</p>
              <p>Focused on Physics, Chemistry, and Mathematics with a strong foundation in computer science fundamentals.</p>
            </div>
          </div>

          {/* Class X */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="role-header">
                <img src="/images/cms.png" alt="City Montessori School" className="company-logo" />
                <div>
                  <h4>Class X (ICSE)</h4>
                  <h5>City Montessori School</h5>
                </div>
              </div>
              <h3>2014–19</h3>
            </div>
            <div className="career-description-container">
              <p className="edu-percent">Score: 92%</p>
              <p>Completed secondary education with high distinction in Mathematics and Science.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;