import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Connect</h4>
            <p>
              Let’s build AI workflows, RAG systems, and automation that powers real products.
            </p>
            <p>
              <a
                href="https://www.linkedin.com/in/shyam-pathak-77ba56206/"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
              >
                LinkedIn — shyam-pathak-77ba56206
              </a>
            </p>
            <h4>Education</h4>
            <p>
              City Montessori School,Lucknow
              2014-2019
            </p>
            <p>
              K.R. Mangalam World School,Gurugram
              2020-2021
            </p>
            <p>
              B.Tech Computer Science,JUET Guna
              2021-2025
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href="https://github.com/SHYam1025"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              GitHub <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com/in/shyam-pathak-77ba56206/"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              LinkedIn <MdArrowOutward />
            </a>
          
            <a
              href="https://www.instagram.com/shyampathakk_25/"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Instagram <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Shyam Pathak</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
