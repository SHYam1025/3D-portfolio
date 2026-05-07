import { PropsWithChildren } from "react";
import "../styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              SHYAM
              <br />
              <span>PATHAK</span>
            </h1>
          </div>
          <div className="landing-info landing-info-spaced">
            <h3>AI Engineer</h3>
            <p className="landing-text">
              I build production-ready generative AI systems, RAG pipelines, and intelligent automation.
            </p>
            <div className="landing-keywords">
              <span>Generative AI</span>
              <span>Computer Vision</span>
              <span>RAG Systems</span>
              <span>LLM Agents</span>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;