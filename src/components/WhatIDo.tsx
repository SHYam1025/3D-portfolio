import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const workData = [
  {
    title: "AI AGENTS",
    subtitle: "Autonomous workflow orchestration",
    desc: `
I engineer multi-agent AI systems capable of reasoning,
task delegation, memory handling, workflow execution,
and intelligent automation pipelines designed for real-world operations.
    `,
    stack: [
      "LangChain",
      "CrewAI",
      "OpenAI",
      "Agent Memory",
      "Tool Calling",
      "Workflow Graphs",
    ],
  },

  {
    title: "RAG SYSTEMS",
    subtitle: "Context-aware retrieval intelligence",
    desc: `
Building citation-aware RAG systems connecting enterprise
documents, semantic retrieval, embeddings, and LLM reasoning
for reliable and explainable AI outputs.
    `,
    stack: [
      "FAISS",
      "Pinecone",
      "Vector DB",
      "Embeddings",
      "Semantic Search",
      "PDF Intelligence",
    ],
  },

  {
    title: "COMPUTER VISION",
    subtitle: "Perception-driven AI systems",
    desc: `
Developing visual intelligence systems involving OCR,
object detection, document understanding, multimodal AI,
and real-time image processing workflows.
    `,
    stack: [
      "OpenCV",
      "YOLO",
      "OCR",
      "Vision Transformers",
      "Image Pipelines",
      "Multimodal AI",
    ],
  },

  {
    title: "AI INFRASTRUCTURE",
    subtitle: "Production-grade deployment systems",
    desc: `
I build scalable AI backends, APIs, orchestration layers,
streaming workflows, and deployable AI products optimized
for performance, reliability, and scale.
    `,
    stack: [
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "React",
      "Cloud",
      "Realtime APIs",
    ],
  },
];

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);

  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    const handlers: Array<() => void> = [];

    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");

          const handler = () => handleClick(container);

          handlers.push(handler);

          container.addEventListener("click", handler);
        } else {
          handlers.push(() => {});
        }
      });
    }

    return () => {
      containerRef.current.forEach((container, index) => {
        const handler = handlers[index];

        if (container && handler) {
          container.removeEventListener("click", handler);
        }
      });
    };
  }, []);

  return (
    <div className="whatIDO">
      {/* LEFT SIDE */}
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>

          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-scroll-area">
            {workData.map((item, index) => (
              <div
                className="what-content what-noTouch"
                ref={(el) => setRef(el, index)}
                key={index}
              >
                <div className="glass-layer"></div>

                <div className="what-content-in">
                  <h3>{item.title}</h3>

                  <h4>{item.subtitle}</h4>

                  <p>{item.desc}</p>

                  <h5>Skillset & Tools</h5>

                  <div className="what-content-flex">
                    {item.stack.map((tech, i) => (
                      <div className="what-tags" key={i}>
                        {tech}
                      </div>
                    ))}
                  </div>

                  <div className="what-arrow"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");

  container.classList.remove("what-sibling");

  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");

        sibling.classList.toggle("what-sibling");
      }
    });
  }
}