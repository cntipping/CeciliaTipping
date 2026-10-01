import { useEffect, useId, useRef, useState } from "react";

interface Project {
  id: string;
  title: string;
  category: string;
  number: string;
  year: string;
  summary: string;
  question: string;
  approach: string;
  reflection: string;
  tags: string[];
  art: "orbit" | "tiles" | "wave";
}
interface Portfolio {
  profile: {
    name: string;
    role: string;
    intro: string;
    email: string;
    links: { label: string; url: string }[];
  };
  projects: Project[];
}

/** A mathematical wireframe, rather than a static hero image. */
function OrbitalDiagram({ energy = 50 }: { energy?: number }) {
  const gridId = useId();
  return (
    <svg
      className="orbital-svg"
      viewBox="0 0 600 480"
      role="img"
      aria-label={`Orbital system visualization, exploration level ${energy}`}
    >
      <defs>
        <pattern
          id={gridId}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth=".5"
            opacity=".2"
          />
        </pattern>
      </defs>
      <rect width="600" height="480" fill={`url(#${gridId})`} />
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M300 18V462M20 240H580" strokeDasharray="3 8" opacity=".5" />
        <g transform={`translate(300 240) rotate(${energy * 0.45 - 35})`}>
          <circle r="178" strokeWidth="2" />
          {[32, 70, 111, 147, 169].map((r) => (
            <ellipse key={r} rx={r} ry="178" opacity=".8" />
          ))}
          {[-140, -95, -48, 0, 48, 95, 140].map((y) => (
            <ellipse
              key={y}
              cy={y}
              rx={Math.sqrt(178 ** 2 - y ** 2)}
              ry={22 + (1 - Math.abs(y) / 178) * 12}
            />
          ))}
          <ellipse
            rx="236"
            ry={48 + energy * 0.55}
            transform="rotate(-23)"
            strokeWidth="2"
          />
          <ellipse rx="218" ry="72" transform="rotate(55)" opacity=".5" />
          <circle cx="207" cy="-52" r="9" fill="currentColor" stroke="none" />
          <circle r="10" fill="currentColor" stroke="none" />
        </g>
        <path
          d="M25 65V25H65M535 25H575V65M25 415V455H65M535 455H575V415"
          strokeWidth="2"
        />
      </g>
      <g fill="currentColor" fontFamily="monospace" fontSize="11">
        <text x="36" y="47">
          FIG. 01 / POSSIBILITY SPACE
        </text>
        <text x="380" y="436">
          EXPLORE · PLAY · ITERATE
        </text>
      </g>
    </svg>
  );
}

function ProjectArt({ kind }: { kind: Project["art"] }) {
  if (kind === "orbit")
    return (
      <div className="project-art art-orbit">
        <OrbitalDiagram energy={25} />
        <span className="art-caption">A FIELD GUIDE TO GRAVITY</span>
      </div>
    );
  if (kind === "tiles")
    return (
      <div className="project-art art-tiles" aria-hidden="true">
        <div className="tile-grid">
          {["?", "✳", "+", "↗", "○", "!", "△", "×", "✳"].map((symbol, i) => (
            <span key={i}>{symbol}</span>
          ))}
        </div>
        <span className="art-caption">LEARN THE RULES. CHANGE THE GAME.</span>
      </div>
    );
  return (
    <div className="project-art art-wave">
      <svg
        viewBox="0 0 440 270"
        role="img"
        aria-label="Oscillating wave experiments"
      >
        <g fill="none" stroke="currentColor">
          {Array.from({ length: 14 }, (_, i) => (
            <path
              key={i}
              d={`M-20 ${80 + i * 9} C90 ${-70 + i * 10}, 110 ${380 - i * 10}, 220 ${130 + i * 3} S330 ${-80 + i * 10}, 470 ${120 + i * 8}`}
              strokeWidth="1.5"
            />
          ))}
        </g>
      </svg>
      <span className="art-caption">THINKING IN SYSTEMS</span>
    </div>
  );
}

function ProjectDialog({
  project,
  close,
}: {
  project: Project | null;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (project) {
      ref.current?.showModal();
      document.body.style.overflow = "hidden";
    } else ref.current?.close();
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="project-title"
    >
      {project && (
        <>
          <button
            className="close"
            onClick={close}
            autoFocus
            aria-label="Close project"
          >
            ×
          </button>
          <p className="eyebrow"></p>
          <h2 id="project-title">{project.title}</h2>
          <p className="dialog-summary">{project.summary}</p>
          <ProjectArt kind={project.art} />
          <h3>The question</h3>
          <p>{project.question}</p>
          <h3>The process</h3>
          <p>{project.approach}</p>
          <h3>The learning</h3>
          <p>{project.reflection}</p>
        </>
      )}
    </dialog>
  );
}

export default function App() {
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState("All work");
  const [selected, setSelected] = useState<Project | null>(null);
  const [energy, setEnergy] = useState(50);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    // Abort stale requests when retrying or unmounting (including StrictMode).
    fetch("/api/portfolio", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Portfolio request failed");
        return response.json() as Promise<Portfolio>;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [attempt]);

  const categories = [
    "All work",
    ...new Set(data?.projects.map((p) => p.category) ?? []),
  ];
  const projects =
    data?.projects.filter(
      (p) => filter === "All work" || p.category === filter,
    ) ?? [];
  const name = data?.profile.name ?? "Your name";

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header>
        <a className="wordmark" href="#" aria-label="Back to top">
          <span className="brand-symbol">✳</span>
          <span>
            {name}
            <small>PLAY / LEARN / MAKE</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">
            Work <sup>01</sup>
          </a>
          <a href="#about">
            About <sup>02</sup>
          </a>
          <a className="nav-contact" href="#contact">
            Let’s talk <span>↗</span>
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-star">✳</span> A PORTFOLIO OF CURIOUS THINGS
            </p>
            <h1 id="hero-title">
              SERIOUS
              <br />
              ABOUT
              <br />
              <span>PLAY.</span>
              <span className="title-star" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="hero-description">
              Exploring how we learn.
              <br />
              Building things that make us curious.
            </p>
            <div className="hero-bottom">
              <a className="solid-button" href="#work">
                Explore my work <span>↙</span>
              </a>
              <span className="mono">
                CODE + DESIGN
                <br />+ A LITTLE CURIOSITY
              </span>
            </div>
          </div>
          <div className="instrument">
            <div className="instrument-top">
              <span>INTERACTIVE SYSTEM / 001</span>
              <span className="instrument-tag">EXPLORATION MODE</span>
            </div>
            <OrbitalDiagram energy={energy} />
            <div className="instrument-foot">
              <div>
                <span className="mono">LEARNING ISN’T LINEAR.</span>
                <p>Neither is the path to a good idea.</p>
              </div>
              <span className="cross" aria-hidden="true">
                +
              </span>
            </div>
            <label className="energy-control">
              <span>TRY A LITTLE CURIOSITY</span>
              <input
                aria-label="Adjust orbital exploration"
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
              />
              <output>{String(energy).padStart(3, "0")}</output>
            </label>
          </div>
        </section>
        <div className="discipline-strip" aria-label="Areas of interest">
          <span>GAMES FOR LEARNING</span>
          <b>✳</b>
          <span>CREATIVE TECHNOLOGY</span>
          <b>✳</b>
          <span>COMPUTER SCIENCE</span>
          <b>✳</b>
          <span>PHYSICS</span>
          <b>✳</b>
        </div>
        <section id="work" className="work-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / THE THINGS I MAKE</p>
              <h2>
                Selected explorations<span className="orange">.</span>
              </h2>
            </div>
            <p>
              Ideas made tangible.
              <br />
              Questions turned into creations.
            </p>
          </div>
          <div className="work-toolbar">
            <div className="filters" aria-label="Filter projects">
              {categories.map((category) => (
                <button
                  key={category}
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="mono">
              {String(projects.length).padStart(2, "0")} EXPLORATIONS
            </span>
          </div>
          {error ? (
            <div className="request-state" role="alert">
              <h3>The projects couldn’t be loaded.</h3>
              <p>Please try again in a moment.</p>
              <button
                className="solid-button"
                onClick={() => setAttempt((v) => v + 1)}
              >
                Try again
              </button>
            </div>
          ) : !data ? (
            <p className="request-state" role="status">
              Loading explorations…
            </p>
          ) : projects.length === 0 ? (
            <p className="request-state">New explorations are on the way.</p>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <button
                  className="project-card"
                  key={project.id}
                  onClick={() => setSelected(project)}
                  aria-label={`Read ${project.title} case study`}
                >
                  <div className="art-frame">
                    <ProjectArt kind={project.art} />
                    <span className="project-number">{project.number}</span>
                    <span className="project-open" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                  <div className="project-meta">
                    <span>{project.category}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
          {(data && projects.length > 0 && (
            <p className="projects-note">
            This project collection includes personal, professional, and
            academic projects.
          </p>
          ))}
        </section>
        <section id="about" className="about-section">
          <div className="about-title">
            <p className="eyebrow">02 / THE PERSON BEHIND THE PLAY</p>
            <h2>
              Equal parts
              <br />
              analytical.
              <br />
              <em>Endlessly curious.</em>
            </h2>
            <span className="about-asterisk" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="about-copy">
            <h3>
              At the intersection of systems,
              <br />
              stories, and learning.
            </h3>
            <p>
              {data?.profile.intro ??
                "A background in computer science and physics. A focus on the design of games for learning."}
            </p>
            <p>
              I’m interested in the moments when making, experimenting, and
              playing become ways of understanding and how we can develop technologies to foster it.
            </p>
            <dl>
              <div>
                <dt>FOUNDATION</dt>
                <dd>
                  Computer Science & Physics<small>Undergraduate studies · AI/ML</small>
                </dd>
              </div>
              <div>
                <dt>CURRENT CHAPTER</dt>
                <dd>
                  Technology, Media, and Learning
                  <small>Master’s studies · Games for learning</small>
                </dd>
              </div>
              <div>
                <dt>APPROACH</dt>
                <dd>Ask. Make. Play. Reflect. Repeat.</dd>
              </div>
            </dl>
          </div>
        </section>
        <section id="contact" className="contact-section">
          <p className="eyebrow">03 / THE NEXT GREAT QUESTION</p>
          <div className="contact-row">
            <h2>
              Let’s make
              <br />
              something <em>click.</em>
            </h2>
            <div>
              <p>
                Have a playful idea, an interesting question,
                <br />
                or a possibility worth exploring?
              </p>
              {data?.profile.email ? (
                <a
                  className="solid-button"
                  href={`mailto:${data.profile.email}`}
                >
                  Say hello <span>↗</span>
                </a>
              ) : (
                <p className="contact-placeholder">
                  Contact details coming soon.
                </p>
              )}
              {data?.profile.links.map((link) => (
                <a
                  className="social-link"
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a href="#" className="footer-brand">
          ✳ {name}
        </a>
        <span>BUILT WITH CURIOSITY. ALWAYS IN PROGRESS.</span>
        <a href="#">Back to top ↑</a>
      </footer>
      <ProjectDialog project={selected} close={() => setSelected(null)} />
    </>
  );
}
