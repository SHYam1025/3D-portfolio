import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (percent < 100) return;
    const timer1 = window.setTimeout(() => {
      setLoaded(true);
      window.setTimeout(() => {
        setIsLoaded(true);
      }, 250);
    }, 100);

    return () => {
      window.clearTimeout(timer1);
    };
  }, [percent]);

  useEffect(() => {
    if (!isLoaded) return;
    let timer: number | null = null;

    import("./utils/initialFX").then((module) => {
      setClicked(true);
      timer = window.setTimeout(() => {
        if (module.initialFX) {
          module.initialFX();
        }
        setIsLoading(false);
      }, 300);
    });

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isLoaded]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          SP
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span> AI Engineer</span> <span>RAG Systems</span><span>Full Stack ML engineer </span><span>Agentic Workflows </span>
            <span> AI Engineer</span> <span>RAG Systems</span><span>Full Stack ML engineer </span><span>Agentic Workfolws </span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  const interval = window.setInterval(() => {
    if (percent < 98) {
      percent = Math.min(98, percent + Math.ceil(Math.random() * 8));
      setLoading(percent);
    }
  }, 60);

  const fallbackTimeout = window.setTimeout(() => {
    if (percent < 100) {
      clear();
    }
  }, 15000);

  function clear() {
    window.clearInterval(interval);
    window.clearTimeout(fallbackTimeout);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      window.clearInterval(interval);
      window.clearTimeout(fallbackTimeout);
      percent = 100;
      setLoading(100);
      resolve(percent);
    });
  }
  return { loaded, percent, clear };
};
