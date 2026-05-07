import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);

    const links = document.querySelectorAll(".header ul a");
    const clickHandlers: Array<(event: Event) => void> = [];

    links.forEach((element) => {
      const handler = (event: Event) => {
        event.preventDefault();
        const target = (element as HTMLAnchorElement).getAttribute("data-href");
        if (target) {
          if (smoother) {
            smoother.scrollTo(target, true, "top top");
          } else {
            const section = document.querySelector(target);
            if (section) {
              section.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
      };

      clickHandlers.push(handler);
      element.addEventListener("click", handler);
    });

    const handleResize = () => {
      ScrollSmoother.refresh(true);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      links.forEach((element, index) => {
        element.removeEventListener("click", clickHandlers[index]);
      });
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          SP
        </a>
        <a
          href="https://www.linkedin.com/in/shyam-pathak-77ba56206/"
          className="navbar-connect"
          data-cursor="disable"
          target="_blank"
          rel="noreferrer"
        >
          linkedin.com/in/shyam-pathak-77ba56206
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
