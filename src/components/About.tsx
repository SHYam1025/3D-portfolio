import "./styles/About.css";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">About Me</h3>
        <p className="para about-genz">
          I’m Shyam Pathak, an AI engineer and Computer Science student at JUET Guna.
        </p>
        <p className="para about-genz">
          I design and ship AI products with real people in mind — from junior internship
          systems at Masin AI to self-led career operating platforms built with multi-agent
          orchestration.
        </p>
        <p className="para about-genz">
          My work combines RAG, agents, vision, and product-grade deployment to turn messy
          data into usable workflows that scale.
        </p>
      </div>
    </div>
  );
};

export default About;
