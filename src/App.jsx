import { useState, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import Header from "./components/Header/Header";
import IdeaInput from "./components/IdeaInput/IdeaInput";
import FlowCanvas from "./components/FlowCanvas/FlowCanvas";
import EdgeDetails from "./components/EdgeDetails/EdgeDetails";
import ComponentInspector from "./components/ComponentInspector/ComponentInspector";
import WorkspaceHeader from "./components/WorkspaceHeader/WorkspaceHeader";
import SymmetricBackground from "./components/Header/SymmetricBackground";
import About from "./components/About/About";
import { getArchitectureHash, getFromCache, saveToCache } from "./Utils/cache";
import { generateNodeDetails } from "./services/nodeDetailsService";
import { generateArchitecture } from "./services/architectureService";
import "./App.css";

const LOADER_STEPS = [
  "Understanding Idea",
  "Selecting Technologies",
  "Designing Architecture",
  "Optimizing Layers",
  "Building Dependencies",
  "Rendering Graph",
];

const CONSOLE_LOGS = [
  "PARSING: Analysing prompt semantic keywords...",
  "ANALYSIS: Loading technology stack configurations...",
  "DAGRE: Computing force-directed graph node hierarchies...",
  "POLISHING: Adjusting network connection layout boundaries...",
  "BLUEPRINTS: Compiling source folder structures...",
  "CANVAS: Injecting custom SVG nodes to viewport...",
];

function App() {
  const [idea, setIdea] = useState("");
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [nodeDetails, setNodeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const [currentView, setCurrentView] = useState("landing");

  // Increment loading steps sequentially
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => {
          if (prev < LOADER_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Load component details when selectedNode changes
  useEffect(() => {
    if (!selectedNode) {
      setNodeDetails(null);
      setErrorDetails(null);
      return;
    }

    const loadDetails = async () => {
      const archHash = getArchitectureHash(nodes, edges);
      const cachedDetails = getFromCache(archHash, selectedNode.id);

      if (cachedDetails) {
        setNodeDetails(cachedDetails);
        setErrorDetails(null);
        return;
      }

      try {
        setLoadingDetails(true);
        setNodeDetails(null);
        setErrorDetails(null);

        const incoming = edges
          .filter((e) => e.target === selectedNode.id)
          .map((e) => ({ source: e.source, target: e.target }));

        const outgoing = edges
          .filter((e) => e.source === selectedNode.id)
          .map((e) => ({ source: e.source, target: e.target }));

        const details = await generateNodeDetails(selectedNode, incoming, outgoing);

        saveToCache(archHash, selectedNode.id, details);
        setNodeDetails(details);
      } catch (err) {
        console.error(err);
        setErrorDetails("Failed to generate component blueprint details from Gemini AI.");
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [selectedNode, nodes, edges]);

  // Keyboard shortcut ESC to dismiss sidebars
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleGenerate = async (promptText) => {
    if (!promptText || !promptText.trim()) return;

    try {
      setIsLoading(true);
      setLoadingStepIdx(0);
      setSelectedNode(null);
      setSelectedEdge(null);
      setIdea(promptText);

      const response = await generateArchitecture(promptText);

      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const data = JSON.parse(cleaned);

      setNodes(data.nodes);
      setEdges(data.edges);
      setCurrentView("workspace");
    } catch (error) {
      console.error(error);
      alert(`Failed to generate architecture: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isWorkspace = nodes.length > 0 || isLoading;

  if (isWorkspace) {
    return (
      <div className="bf-workspace-layout">
        <WorkspaceHeader
          idea={idea}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        <div className="bf-workspace-body">
          {/* Progressive AI Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1000,
                background: "rgba(11, 11, 15, 0.85)",
                backdropFilter: "blur(20px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
              }}
            >
              <div className="bf-loader-wrapper">
                <div className="bf-loader-glow-aura" />

                <div className="bf-progressive-loader-card">
                  <div className="bf-loader-reactor-container">
                    <div className="bf-loader-reactor-outer" />
                    <div className="bf-loader-reactor-inner" />
                    <div className="bf-loader-reactor-core" />
                  </div>

                  <div className="bf-plc-header">
                    <span>AI Architect Compiling</span>
                  </div>

                  <div className="bf-plc-steps">
                    {LOADER_STEPS.map((step, idx) => {
                      const isCompleted = loadingStepIdx > idx;
                      const isCurrent = loadingStepIdx === idx;

                      let statusClass = "pending";
                      let statusIcon = <div className="bf-step-dot" />;

                      if (isCompleted) {
                        statusClass = "completed";
                        statusIcon = <span className="bf-step-check">✔</span>;
                      } else if (isCurrent) {
                        statusClass = "current";
                        statusIcon = <div className="bf-step-spinner" />;
                      }

                      return (
                        <div key={idx} className={`bf-plc-step ${statusClass}`}>
                          <div className="bf-step-icon-container">{statusIcon}</div>
                          <span className="bf-step-text">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bf-loader-console">
                    <div>
                      <span className="bf-console-prefix">&gt;</span>
                      <span className="bf-console-text">
                        {CONSOLE_LOGS[loadingStepIdx] || "SYSTEM: Initializing compilers..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ReactFlowProvider>
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              setSelectedEdge={setSelectedEdge}
              setSelectedNode={setSelectedNode}
            />
          </ReactFlowProvider>

          <ComponentInspector
            node={selectedNode}
            details={nodeDetails}
            loading={loadingDetails}
            error={errorDetails}
            onClose={() => setSelectedNode(null)}
          />

          <EdgeDetails
            edge={selectedEdge}
            onClose={() => setSelectedEdge(null)}
          />
        </div>
      </div>
    );
  }

  if (currentView === "about") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B0B0F",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SymmetricBackground />
        <About onBackToHome={() => setCurrentView("landing")} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0B0F",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SymmetricBackground />

      <Header onAboutClick={() => setCurrentView("about")} />

      <IdeaInput
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;