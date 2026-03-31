import { useEffect, useRef, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import adaptLearnLogo from "./assets/adaptlearn-logo.svg";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip
);

const pageIntro = {
  home: "This is the home page. You can review the project and start the assessment.",
  login: "This is the login page. Enter your name and student ID, or use the microphone to fill them.",
  behavioral: "This page checks learning interaction patterns using media and typed responses.",
  timed: "This page checks typing pace, ordering, memory, audio recall, and short comprehension using a multi-task support module.",
  assessment: "This page contains the learning habit questions. Use the slider or microphone to answer.",
  subject: "This page asks about your subject preferences and study methods.",
  dashboard: "This page shows your predicted learning style and model confidence.",
  recommendation: "This page gives you study recommendations based on your learning style.",
  analytics: "This page shows the learning analytics and engagement charts.",
  report: "This page shows a parent and teacher report with strengths, risks, and support suggestions.",
};

const progressMap = {
  home: 0,
  login: 15,
  behavioral: 30,
  timed: 42,
  assessment: 55,
  subject: 70,
  dashboard: 86,
  recommendation: 95,
  analytics: 100,
  report: 100,
};

const questions = [
  { id: "video_actions", text: "How often do you watch learning videos?", min: 0, max: 100, labels: ["Never", "Sometimes", "Often", "Very Often", "Always"] },
  { id: "audio_actions", text: "How often do you listen to audio lessons?", min: 0, max: 100, labels: ["Never", "Sometimes", "Often", "Very Often", "Always"] },
  { id: "text_actions", text: "How often do you read notes or textbooks?", min: 0, max: 100, labels: ["Never", "Sometimes", "Often", "Very Often", "Always"] },
  { id: "study_time", text: "How many hours do you study per day?", min: 0, max: 12, labels: ["0 hrs", "3 hrs", "6 hrs", "9 hrs", "12 hrs"] },
  { id: "absences", text: "How many classes did you miss last month?", min: 0, max: 20, labels: ["0", "5", "10", "15", "20+"] },
  { id: "final_grade", text: "What was your recent exam grade? (0-100)", min: 0, max: 100, labels: ["0", "25", "50", "75", "100"] },
  { id: "hand_raise", text: "How often do you ask questions in class?", min: 0, max: 100, labels: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
  { id: "resource_visits", text: "How often do you use online learning resources?", min: 0, max: 100, labels: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
  { id: "announcement_views", text: "How often do you check announcements?", min: 0, max: 100, labels: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
  { id: "discussion_posts", text: "How often do you participate in discussions?", min: 0, max: 100, labels: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
];

const initialAnswers = {
  hand_raise: 0,
  resource_visits: 0,
  announcement_views: 0,
  discussion_posts: 0,
  free_time: 0,
  study_time: 0,
  absences: 0,
  final_grade: 0,
  total_actions: 0,
  video_actions: 0,
  audio_actions: 0,
  text_actions: 0,
  platform_Unknown: 0,
};

const initialStudent = {
  name: "",
  id: "",
  favoriteSubject: "",
  difficultSubject: "",
  mathStyle: "",
  scienceStyle: "",
  studyPreference: "",
  learningStyle: "",
  confidence: 0,
};

const initialBehavior = {
  keystrokes: [],
  typedCharacters: 0,
  backspaceCount: 0,
  pauseDurations: [],
  navigationDurations: [],
  rapidNavigationCount: 0,
  sliderAdjustments: 0,
  voiceSessions: 0,
  toolClicks: 0,
  focusChanges: 0,
  pageVisits: {},
};

const interactionLessons = [
  {
    id: 1,
    topic: "Understanding Gravity",
    summary: "Gravity pulls objects toward Earth. Watch and respond with a short explanation.",
    prompt: "In one or two lines, explain how gravity works.",
    visual: "Gravity concept: Earth, apple, and falling motion",
    videoSrc: "https://assets.science.nasa.gov/content/dam/science/cds/eclips/assets/videos/spotlite-mass-and-weight/video.mp4",
    videoType: "video",
  },
  {
    id: 2,
    topic: "Water Cycle",
    summary: "Observe the sequence and type one part of the cycle you remember.",
    prompt: "Describe one stage of the water cycle.",
    visual: "Cloud, rain, river, and sun cycle",
    videoSrc: "https://gpm.nasa.gov/education/sites/default/files/videos/WaterCycleMovie-NoText.mp4",
    videoType: "video",
  },
];

const subjectGroups = [
  { key: "favoriteSubject", label: "Which subject do you like the most?", options: ["Math", "Science", "English", "Computer"] },
  { key: "difficultSubject", label: "Which subject do you find difficult?", options: ["Math", "Science", "English", "Computer"] },
  { key: "mathStyle", label: "How do you prefer studying Mathematics?", options: ["Videos", "Teacher", "Reading", "Practice"] },
  { key: "scienceStyle", label: "How do you prefer studying Science?", options: ["Videos", "Teacher", "Reading", "Examples"] },
  { key: "studyPreference", label: "What do you enjoy more?", options: ["Problems", "Examples"] },
];

const recommendationsMap = {
  Visual: [
    { title: "Flowchart videos", text: "Use step-by-step videos, process maps, and whiteboard explainers to understand concepts faster." },
    { title: "Mind maps", text: "Turn chapters into maps, charts, diagrams, and visual summaries before revision." },
    { title: "Color-coded notes", text: "Highlight formulas, key ideas, and categories using colors and visual symbols." },
    { title: "Slides and infographics", text: "Convert long text into slides, concept cards, or infographic summaries." },
  ],
  Audio: [
    { title: "Recorded lectures", text: "Replay teacher explanations and convert difficult lessons into repeatable audio clips." },
    { title: "Podcasts and spoken explainers", text: "Use educational podcasts and verbal topic summaries during revision." },
    { title: "Text-to-speech support", text: "Listen to notes and PDFs instead of depending only on reading." },
    { title: "Voice repetition", text: "Record your own explanations and listen back to strengthen memory." },
  ],
  Text: [
    { title: "Structured notes", text: "Break chapters into clean written summaries, headings, and bullet points." },
    { title: "Flashcards", text: "Use flashcards for formulas, terms, definitions, and quick recall." },
    { title: "Written practice", text: "Write answers in your own words to reinforce understanding and retention." },
    { title: "Reading blocks", text: "Use focused reading sessions with note-taking and review checkpoints." },
  ],
};

const toolkitMap = {
  Visual: [
    { title: "Flowchart Board", description: "Sketch diagrams, workflows, and visual revision boards.", href: "https://excalidraw.com/" },
    { title: "Video Search", description: "Open a ready-made search for concept videos and visual tutorials.", href: "https://www.youtube.com/results?search_query=learning+concept+videos+with+flowcharts" },
    { title: "Slides Workspace", description: "Create visual summaries, concept decks, and image-led revision slides.", href: "https://docs.google.com/presentation/" },
    { title: "Mind Map Tool", description: "Build visual chapter maps and topic branches quickly.", href: "https://www.mindmeister.com/" },
  ],
  Audio: [
    { title: "Text To Speech", description: "Listen to notes, articles, and copied text out loud.", href: "https://ttsreader.com/" },
    { title: "Voice Recorder", description: "Record spoken explanations and replay them later.", href: "https://online-voice-recorder.com/" },
    { title: "Podcast Search", description: "Find audio explainers and educational podcast episodes.", href: "https://www.youtube.com/results?search_query=educational+podcast+learning" },
    { title: "Speech Notes", description: "Dictate spoken notes and convert ideas into text.", href: "https://dictation.io/" },
  ],
  Text: [
    { title: "Notes Doc", description: "Write structured summaries, headings, and revision notes.", href: "https://docs.google.com/document/" },
    { title: "Flashcard Builder", description: "Create study cards for terms, formulas, and quick recall.", href: "https://quizlet.com/create-set" },
    { title: "Reading Workspace", description: "Keep articles, notes, and written explanations in one place.", href: "https://www.notion.so/" },
    { title: "Practice Writing", description: "Draft written answers and paragraph-based explanations.", href: "https://writer.bighugelabs.com/" },
  ],
};

const pageOrder = ["home", "login", "behavioral", "timed", "assessment", "subject", "dashboard", "recommendation", "analytics", "report"];
const heroHighlights = [
  { eyebrow: "Adaptive", title: "Context-aware flow", text: "The interface changes naturally from onboarding to prediction to analytics without feeling like separate pages." },
  { eyebrow: "Accessible", title: "Voice-first support", text: "Microphone input and voice guidance are woven into the workflow instead of feeling like an afterthought." },
];
const metricThemes = ["blue", "orange", "green", "pink", "violet", "gold"];
const timedChallengePrompt = "Plants need sunlight, water, and air to grow strong every day. Their roots absorb water from the soil, while the leaves use sunlight to make food. If a plant does not get enough light or water, it may grow slowly or become weak.";
const timedChallengeDuration = 45;
const orderingTarget = ["Seed", "Sprout", "Leaf Growth", "Flower"];
const memoryWords = ["moon", "tree", "key", "river", "star"];
const memoryRevealDuration = 12;
const audioRecallContent = {
  script: "The blue bus stopped near the library at four o clock after the students finished class.",
  question: "What stopped near the library, and when did it stop?",
  keywords: ["bus", "library", "four"],
};
const comprehensionContent = {
  passage: "Mina learns best when she studies in short, quiet sessions with clear notes and small breaks between tasks.",
  question: "Which environment helps Mina most?",
  options: [
    "A noisy room with television in the background",
    "Short and quiet study sessions with clear notes",
    "Last-minute study with no breaks",
    "Skipping revision and only watching entertainment videos",
  ],
  correct: "Short and quiet study sessions with clear notes",
};

function mockPrediction(answers) {
  const v = answers.video_actions || 0;
  const a = answers.audio_actions || 0;
  const t = answers.text_actions || 0;
  let prediction = "Visual";
  if (a > v && a > t) prediction = "Audio";
  else if (t > v && t > a) prediction = "Text";
  return { prediction, confidence: Math.min(0.95, Math.max(v, a, t) / 100 + 0.3) };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateTextAccuracy(target, response) {
  const source = target.trim().toLowerCase();
  const typed = response.trim().toLowerCase();
  if (!source.length && !typed.length) return 100;
  if (!typed.length) return 0;

  const maxLength = Math.max(source.length, typed.length);
  let matches = 0;

  for (let index = 0; index < Math.min(source.length, typed.length); index += 1) {
    if (source[index] === typed[index]) matches += 1;
  }

  return Math.round((matches / maxLength) * 100);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createOrderingTask() {
  return {
    items: shuffleArray(orderingTarget),
    dragIndex: null,
    completed: false,
    attempts: 0,
    score: 0,
  };
}

function createMemoryTask() {
  return {
    phase: "idle",
    remainingSeconds: memoryRevealDuration,
    response: "",
    completed: false,
    score: 0,
    recalledWords: 0,
  };
}

function scoreKeywordRecall(response, keywords) {
  const text = response.toLowerCase();
  const matches = keywords.filter((keyword) => text.includes(keyword)).length;
  return {
    matches,
    score: Math.round((matches / keywords.length) * 100),
  };
}

const featureMeta = {
  hand_raise: {
    label: "Class Participation",
    focus: "How actively the student speaks up or asks questions during class.",
  },
  resource_visits: {
    label: "Learning Resource Use",
    focus: "How often the student opens online study materials or learning resources.",
  },
  announcement_views: {
    label: "Announcement Checking",
    focus: "How regularly the student follows updates, notices, and academic reminders.",
  },
  discussion_posts: {
    label: "Discussion Activity",
    focus: "How often the student joins discussions or responds in learning forums.",
  },
  free_time: {
    label: "Free Time",
    focus: "Available time outside study that may affect routine and balance.",
    unit: "hrs/day",
  },
  study_time: {
    label: "Study Time",
    focus: "Average daily time spent on study or revision.",
    unit: "hrs/day",
  },
  absences: {
    label: "Absences",
    focus: "Classes missed recently. Higher values may reduce continuity and classroom confidence.",
    unit: "days",
  },
  final_grade: {
    label: "Recent Grade",
    focus: "Most recent academic result used to understand current performance level.",
    unit: "%",
  },
  total_actions: {
    label: "Overall Platform Activity",
    focus: "Combined activity across the learning platform, showing total engagement.",
  },
  video_actions: {
    label: "Video Learning Use",
    focus: "How much the student uses video-based learning materials.",
  },
  audio_actions: {
    label: "Audio Learning Use",
    focus: "How much the student uses audio lessons or listening-based study support.",
  },
  text_actions: {
    label: "Text Learning Use",
    focus: "How much the student uses reading, notes, or written materials.",
  },
};

function formatFeatureValue(key, value) {
  const meta = featureMeta[key];
  if (!meta?.unit) return Math.round(value);
  return `${Math.round(value)} ${meta.unit}`;
}

function describeFeatureReading(key, value) {
  if (key === "absences") {
    if (value >= 10) return "Needs attention: the student is missing many classes.";
    if (value >= 5) return "Watch closely: attendance is becoming inconsistent.";
    return "Stable: attendance is mostly regular.";
  }

  if (key === "final_grade") {
    if (value >= 75) return "Strong: academic performance is currently healthy.";
    if (value >= 50) return "Developing: the student is managing but may need reinforcement.";
    return "Needs support: recent academic score is low.";
  }

  if (key === "study_time") {
    if (value >= 4) return "Good routine: the student is spending consistent time studying.";
    if (value >= 2) return "Moderate routine: study time is present but may need structure.";
    return "Low routine: study time may not be enough for steady progress.";
  }

  if (key === "free_time") {
    if (value >= 5) return "Balanced: there is enough personal time alongside study.";
    if (value >= 2) return "Limited free time: routine may feel busy.";
    return "Very low free time: the student may need better rest-study balance.";
  }

  if (value >= 70) return "Strong engagement in this area.";
  if (value >= 40) return "Moderate engagement in this area.";
  return "Low engagement in this area.";
}

function buildFeatureRows(answers) {
  return Object.entries(answers)
    .filter(([key]) => key !== "platform_Unknown")
    .map(([key, value]) => {
      const meta = featureMeta[key] || {
        label: key.replaceAll("_", " "),
        focus: "Assessment signal used by the model.",
      };

      return {
        key,
        label: meta.label,
        value: formatFeatureValue(key, value),
        focus: meta.focus,
        reading: describeFeatureReading(key, value),
      };
    });
}

export default function App() {
  const [page, setPage] = useState("home");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Microphone ready.");
  const [student, setStudent] = useState(initialStudent);
  const [answers, setAnswers] = useState(initialAnswers);
  const [listening, setListening] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [voiceContext, setVoiceContext] = useState(null);
  const [preferredVoice, setPreferredVoice] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [behaviorData, setBehaviorData] = useState(initialBehavior);
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [behaviorTaskIndex, setBehaviorTaskIndex] = useState(0);
  const [behaviorTaskResponse, setBehaviorTaskResponse] = useState("");
  const [behaviorVerification, setBehaviorVerification] = useState({
    videoPlays: 0,
    videoReplays: 0,
    imageClicks: 0,
    taskBackspaces: 0,
    taskKeystrokes: [],
    taskPauseDurations: [],
    inference: "Pending",
  });
  const [timedChallenge, setTimedChallenge] = useState({
    prompt: timedChallengePrompt,
    response: "",
    running: false,
    completed: false,
    remainingSeconds: timedChallengeDuration,
    startedAt: null,
    finishedAt: null,
    keystrokes: [],
    pauseDurations: [],
    backspaceCount: 0,
    inference: "Pending",
  });
  const [orderingTask, setOrderingTask] = useState(createOrderingTask);
  const [memoryTask, setMemoryTask] = useState(createMemoryTask);
  const [audioTask, setAudioTask] = useState({
    played: 0,
    response: "",
    completed: false,
    score: 0,
  });
  const [comprehensionTask, setComprehensionTask] = useState({
    selected: "",
    completed: false,
    score: 0,
  });

  const recognitionRef = useRef(null);
  const styleChartRef = useRef(null);
  const featureChartRef = useRef(null);
  const datasetStyleChartRef = useRef(null);
  const datasetMetricChartRef = useRef(null);
  const styleChartInstance = useRef(null);
  const featureChartInstance = useRef(null);
  const datasetStyleChartInstance = useRef(null);
  const datasetMetricChartInstance = useRef(null);
  const lastKeystrokeTimeRef = useRef(Date.now());
  const pageEnterTimeRef = useRef(Date.now());
  const previousPageRef = useRef("home");

  const question = questions[questionIndex];
  const currentInteractionLesson = interactionLessons[behaviorTaskIndex];
  const recommendations = recommendationsMap[student.learningStyle || "Visual"];
  const toolkit = toolkitMap[student.learningStyle || "Visual"];
  const progress = progressMap[page] || 0;
  const behaviorInsights = buildBehaviorInsights(behaviorData);
  const timedChallengeInsights = buildTimedChallengeInsights(timedChallenge);
  const supportCheckInsights = buildSupportCheckInsights(
    timedChallengeInsights,
    orderingTask,
    memoryTask,
    audioTask,
    comprehensionTask
  );
  const supportTasksCompleted = timedChallenge.completed && orderingTask.completed && memoryTask.completed && audioTask.completed && comprehensionTask.completed;

  const speakText = (text, force = false) => {
    if (!("speechSynthesis" in window)) return;
    if (!force && !voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      setPreferredVoice(
        voices.find((voice) => /en(-|_)?in/i.test(voice.lang)) ||
          voices.find((voice) => /^en/i.test(voice.lang)) ||
          voices[0] ||
          null
      );
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      setActiveField(null);
      setVoiceContext(null);
    };
    recognition.onerror = (event) => {
      setVoiceStatus(
        event.error === "not-allowed"
          ? "Microphone permission was blocked. Please allow microphone access."
          : "Voice input could not hear you clearly. Please try again."
      );
    };
    recognition.onresult = (event) => handleVoiceTranscript(event.results[0][0].transcript.trim());
    recognitionRef.current = recognition;
  }, [activeField, voiceContext, questionIndex, page, student]);

  useEffect(() => {
    const now = Date.now();
    const previousPage = previousPageRef.current;
    const duration = now - pageEnterTimeRef.current;

    if (previousPage) {
      setBehaviorData((prev) => ({
        ...prev,
        navigationDurations: [...prev.navigationDurations, duration],
        rapidNavigationCount: duration < 4000 ? prev.rapidNavigationCount + 1 : prev.rapidNavigationCount,
        pageVisits: {
          ...prev.pageVisits,
          [page]: (prev.pageVisits[page] || 0) + 1,
        },
      }));
    }

    previousPageRef.current = page;
    pageEnterTimeRef.current = now;
  }, [page]);

  useEffect(() => {
    if (page !== "dashboard" || !styleChartRef.current) return;
    styleChartInstance.current?.destroy();
    styleChartInstance.current = new Chart(styleChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Visual", "Audio", "Text"],
        datasets: [{
          data: [answers.video_actions, answers.audio_actions, answers.text_actions],
          backgroundColor: ["rgba(31,94,255,0.78)", "rgba(255,138,76,0.78)", "rgba(21,183,158,0.78)"],
          borderColor: ["#1f5eff", "#ff8a4c", "#15b79e"],
          borderWidth: 2,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
    });
    return () => styleChartInstance.current?.destroy();
  }, [page, answers]);

  useEffect(() => {
    if (page !== "analytics" || !featureChartRef.current) return;
    featureChartInstance.current?.destroy();
    featureChartInstance.current = new Chart(featureChartRef.current, {
      type: "bar",
      data: {
        labels: ["Video", "Audio", "Text", "Hand Raise", "Resources", "Discussions"],
        datasets: [{
          label: "Engagement / Score",
          data: [
            answers.video_actions,
            answers.audio_actions,
            answers.text_actions,
            answers.hand_raise,
            answers.resource_visits,
            answers.discussion_posts,
          ],
          backgroundColor: "rgba(31,94,255,0.62)",
          borderColor: "#1f5eff",
          borderWidth: 2,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } },
    });
    return () => featureChartInstance.current?.destroy();
  }, [page, answers]);

  useEffect(() => {
    if (page !== "analytics" || datasetSummary) return;
    fetch("http://127.0.0.1:5000/dataset-summary")
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) setDatasetSummary(data);
      })
      .catch(() => {
        setDatasetSummary(null);
      });
  }, [page, datasetSummary]);

  useEffect(() => {
    if (page !== "analytics" || !datasetSummary || !datasetStyleChartRef.current) return;
    datasetStyleChartInstance.current?.destroy();
    datasetStyleChartInstance.current = new Chart(datasetStyleChartRef.current, {
      type: "doughnut",
      data: {
        labels: Object.keys(datasetSummary.learning_style_distribution || {}),
        datasets: [{
          data: Object.values(datasetSummary.learning_style_distribution || {}),
          backgroundColor: ["rgba(12,103,242,0.82)", "rgba(255,107,44,0.82)", "rgba(18,184,134,0.82)", "rgba(91,88,240,0.82)"],
          borderWidth: 2,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
    });
    return () => datasetStyleChartInstance.current?.destroy();
  }, [page, datasetSummary]);

  useEffect(() => {
    if (page !== "analytics" || !datasetSummary || !datasetMetricChartRef.current) return;
    datasetMetricChartInstance.current?.destroy();
    datasetMetricChartInstance.current = new Chart(datasetMetricChartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(datasetSummary.average_metrics || {}).map((label) => label.replaceAll("_", " ")),
        datasets: [{
          label: "Average value",
          data: Object.values(datasetSummary.average_metrics || {}),
          backgroundColor: ["#0c67f2", "#ff6b2c", "#12b886", "#5b58f0", "#ff5fa2", "#f2b312", "#2ea7ff"],
          borderRadius: 12,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
    return () => datasetMetricChartInstance.current?.destroy();
  }, [page, datasetSummary]);

  useEffect(() => {
    if (page !== "timed" || !timedChallenge.running) return undefined;
    if (timedChallenge.remainingSeconds <= 0) {
      finalizeTimedChallenge(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTimedChallenge((prev) => ({
        ...prev,
        remainingSeconds: prev.remainingSeconds - 1,
      }));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [page, timedChallenge.running, timedChallenge.remainingSeconds]);

  useEffect(() => {
    if (page !== "timed" || memoryTask.phase !== "reveal") return undefined;
    if (memoryTask.remainingSeconds <= 0) {
      setMemoryTask((prev) => ({
        ...prev,
        phase: "answer",
        remainingSeconds: 0,
      }));
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setMemoryTask((prev) => ({
        ...prev,
        remainingSeconds: prev.remainingSeconds - 1,
      }));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [page, memoryTask.phase, memoryTask.remainingSeconds]);

  const startRecognition = () => {
    if (!recognitionRef.current) {
      setVoiceStatus("Voice input is not supported in this browser.");
      return;
    }
    try {
      recognitionRef.current.abort();
    } catch {
      // no-op
    }
    setTimeout(() => {
      try {
        recognitionRef.current.start();
      } catch {
        setVoiceStatus("Voice input is already active. Please try again in a moment.");
      }
    }, 120);
  };

  const startVoiceInput = (field) => {
    setBehaviorData((prev) => ({ ...prev, voiceSessions: prev.voiceSessions + 1 }));
    setActiveField(field);
    setVoiceContext(null);
    const prompt = field === "id" ? "Say your student ID now." : "Say your full name now.";
    setVoiceStatus(prompt);
    speakText(prompt, true);
    startRecognition();
  };

  const startContextMic = () => {
    setBehaviorData((prev) => ({ ...prev, voiceSessions: prev.voiceSessions + 1 }));
    if (page === "login") {
      startVoiceInput(activeField || "name");
      return;
    }
    setActiveField(null);
    if (page === "assessment") {
      setVoiceContext("assessment");
      setVoiceStatus("Say a number, or say next or back.");
      speakText("Say a number, or say next or back.", true);
    } else if (page === "timed") {
      setVoiceContext("timed");
      setVoiceStatus("Say the sentence and I will add it to the timed response box.");
      speakText("Say the sentence and I will add it to the timed response box.", true);
    } else if (page === "subject") {
      const pending = subjectGroups.find((group) => !student[group.key]);
      setVoiceContext("subject");
      const prompt = pending ? `Say your ${pending.label.toLowerCase()}.` : "All subject preferences are already filled.";
      setVoiceStatus(prompt);
      speakText(prompt, true);
    } else {
      setVoiceContext("navigation");
      const prompt = "Say a page name like home, login, timed, assessment, dashboard, recommendation, or analytics.";
      setVoiceStatus(prompt);
      speakText(prompt, true);
    }
    startRecognition();
  };

  const parseSpokenNumber = (text) => {
    const match = text.match(/\d+(\.\d+)?/);
    if (match) return Number(match[0]);
    const words = {
      zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
      seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
      fifteen: 15, twenty: 20, twentyfive: 25, thirty: 30, forty: 40,
      fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
    };
    return words[text.replace(/[\s-]+/g, "")] ?? null;
  };

  const assessmentVoiceValue = (spokenText) => {
    const lower = spokenText.toLowerCase();
    if (lower.includes("never")) return question.min;
    if (lower.includes("rarely")) return Math.round(question.min + (question.max - question.min) * 0.25);
    if (lower.includes("sometimes")) return Math.round(question.min + (question.max - question.min) * 0.5);
    if (lower.includes("often")) return Math.round(question.min + (question.max - question.min) * 0.75);
    if (lower.includes("always") || lower.includes("very often")) return question.max;
    const numeric = parseSpokenNumber(lower);
    return numeric === null ? null : clamp(numeric, question.min, question.max);
  };

  const handleVoiceTranscript = (transcript) => {
    if (activeField) {
      if (activeField === "id") {
        setStudent((prev) => ({ ...prev, id: transcript.replace(/\s+/g, "").toUpperCase() }));
        setVoiceStatus("Student ID captured.");
        speakText("Student ID added.", true);
      } else {
        setStudent((prev) => ({ ...prev, name: transcript.replace(/\b\w/g, (char) => char.toUpperCase()) }));
        setVoiceStatus("Name captured.");
        speakText("Name added.", true);
      }
      return;
    }

    if (voiceContext === "assessment") {
      const lower = transcript.toLowerCase();
      if (lower.includes("next")) return nextQuestion();
      if (lower.includes("back") || lower.includes("previous")) return previousQuestion();
      const value = assessmentVoiceValue(transcript);
      if (value === null) return setVoiceStatus("Say a number or words like never, sometimes, often, or always.");
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      setVoiceStatus(`Answer saved as ${value}.`);
      speakText(`Answer saved as ${value}.`, true);
      return;
    }

    if (voiceContext === "timed") {
      setTimedChallenge((prev) => ({ ...prev, response: `${prev.response} ${transcript}`.trim() }));
      setVoiceStatus("Timed response updated.");
      return;
    }

    if (voiceContext === "subject") {
      const pending = subjectGroups.find((group) => !student[group.key]);
      if (!pending) return setVoiceStatus("All subject preferences are already selected.");
      const matched = pending.options.find((option) =>
        transcript.toLowerCase().includes(option.toLowerCase())
      );
      if (!matched) return setVoiceStatus(`Could not match that. Please say a valid option for ${pending.label.toLowerCase()}.`);
      setStudent((prev) => ({ ...prev, [pending.key]: matched }));
      setVoiceStatus(`${pending.label} saved as ${matched}.`);
      return;
    }

    const lower = transcript.toLowerCase();
    if (lower.includes("home")) setPage("home");
    else if (lower.includes("login")) setPage("login");
    else if (lower.includes("timed")) setPage("timed");
    else if (lower.includes("assessment")) setPage("assessment");
    else if (lower.includes("dashboard")) setPage("dashboard");
    else if (lower.includes("recommendation")) setPage("recommendation");
    else if (lower.includes("analytic")) setPage("analytics");
    else setVoiceStatus("Try saying home, login, timed, assessment, dashboard, recommendation, or analytics.");
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      total_actions: (prev.video_actions || 0) + (prev.audio_actions || 0) + (prev.text_actions || 0),
      free_time: 5,
    }));
    setPage("subject");
  };

  const previousQuestion = () => {
    if (questionIndex > 0) setQuestionIndex((prev) => prev - 1);
  };

  const startAssessment = () => {
    if (!student.name.trim() || !student.id.trim()) {
      alert("Please enter both your name and student ID.");
      return;
    }

    fetch("http://127.0.0.1:5000/student-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: student.name,
        student_id: student.id,
      }),
    }).catch(() => null);

    setQuestionIndex(0);
    setBehaviorTaskIndex(0);
    setBehaviorTaskResponse("");
    setBehaviorVerification({
      videoPlays: 0,
      videoReplays: 0,
      imageClicks: 0,
      taskBackspaces: 0,
      taskKeystrokes: [],
      taskPauseDurations: [],
      inference: "Pending",
    });
    setTimedChallenge({
      prompt: timedChallengePrompt,
      response: "",
      running: false,
      completed: false,
      remainingSeconds: timedChallengeDuration,
      startedAt: null,
      finishedAt: null,
      keystrokes: [],
      pauseDurations: [],
      backspaceCount: 0,
      inference: "Pending",
    });
    setOrderingTask(createOrderingTask());
    setMemoryTask(createMemoryTask());
    setAudioTask({
      played: 0,
      response: "",
      completed: false,
      score: 0,
    });
    setComprehensionTask({
      selected: "",
      completed: false,
      score: 0,
    });
    setPage("behavioral");
  };

  const handleTrackedInputChange = (field, value) => {
    const now = Date.now();
    const previousValue = student[field] || "";
    const pause = now - lastKeystrokeTimeRef.current;

    setBehaviorData((prev) => ({
      ...prev,
      backspaceCount: value.length < previousValue.length ? prev.backspaceCount + 1 : prev.backspaceCount,
      typedCharacters: prev.typedCharacters + Math.max(0, value.length - previousValue.length),
      pauseDurations: pause > 700 ? [...prev.pauseDurations, pause] : prev.pauseDurations,
      keystrokes: [...prev.keystrokes, now],
    }));

    lastKeystrokeTimeRef.current = now;
    setStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleFocusTrack = (field) => {
    setActiveField(field);
    setBehaviorData((prev) => ({ ...prev, focusChanges: prev.focusChanges + 1 }));
  };

  const handleBehaviorTaskInput = (value) => {
    const now = Date.now();
    const pause = now - lastKeystrokeTimeRef.current;

    setBehaviorVerification((prev) => ({
      ...prev,
      taskBackspaces: value.length < behaviorTaskResponse.length ? prev.taskBackspaces + 1 : prev.taskBackspaces,
      taskKeystrokes: [...prev.taskKeystrokes, now],
      taskPauseDurations: pause > 700 ? [...prev.taskPauseDurations, pause] : prev.taskPauseDurations,
    }));

    setBehaviorData((prev) => ({
      ...prev,
      backspaceCount: value.length < behaviorTaskResponse.length ? prev.backspaceCount + 1 : prev.backspaceCount,
      keystrokes: [...prev.keystrokes, now],
      pauseDurations: pause > 700 ? [...prev.pauseDurations, pause] : prev.pauseDurations,
      typedCharacters: prev.typedCharacters + Math.max(0, value.length - behaviorTaskResponse.length),
    }));

    lastKeystrokeTimeRef.current = now;
    setBehaviorTaskResponse(value);
  };

  const handleBehaviorMedia = (type) => {
    setBehaviorVerification((prev) => ({
      ...prev,
      videoPlays: type === "play" ? prev.videoPlays + 1 : prev.videoPlays,
      videoReplays: type === "replay" ? prev.videoReplays + 1 : prev.videoReplays,
      imageClicks: type === "image" ? prev.imageClicks + 1 : prev.imageClicks,
    }));
  };

  const finalizeBehaviorVerification = () => {
    const avgPause = behaviorVerification.taskPauseDurations.length
      ? Math.round(behaviorVerification.taskPauseDurations.reduce((sum, item) => sum + item, 0) / behaviorVerification.taskPauseDurations.length)
      : 0;

    let inference = "Balanced interaction pattern";
    if ((behaviorVerification.videoPlays + behaviorVerification.videoReplays + behaviorVerification.imageClicks) >= 3) {
      inference = "High visual-media engagement";
    } else if (behaviorVerification.taskKeystrokes.length > 25 && behaviorVerification.taskBackspaces < 4) {
      inference = "Comfortable text-response pattern";
    } else if (avgPause >= 1800) {
      inference = "Reflective / slow-processing interaction";
    }

    setBehaviorVerification((prev) => ({ ...prev, inference }));

    if (behaviorTaskIndex < interactionLessons.length - 1) {
      setBehaviorTaskIndex((prev) => prev + 1);
      setBehaviorTaskResponse("");
      lastKeystrokeTimeRef.current = Date.now();
      return;
    }

    setPage("timed");
  };

  const startTimedChallenge = () => {
    lastKeystrokeTimeRef.current = Date.now();
    setTimedChallenge({
      prompt: timedChallengePrompt,
      response: "",
      running: true,
      completed: false,
      remainingSeconds: timedChallengeDuration,
      startedAt: Date.now(),
      finishedAt: null,
      keystrokes: [],
      pauseDurations: [],
      backspaceCount: 0,
      inference: "Running",
    });
    setVoiceStatus("Timed typing task started. Type the sentence before the timer ends.");
  };

  const handleTimedChallengeInput = (value) => {
    if (!timedChallenge.running) return;
    const now = Date.now();
    const pause = now - lastKeystrokeTimeRef.current;

    setTimedChallenge((prev) => ({
      ...prev,
      response: value,
      backspaceCount: value.length < prev.response.length ? prev.backspaceCount + 1 : prev.backspaceCount,
      keystrokes: [...prev.keystrokes, now],
      pauseDurations: pause > 700 ? [...prev.pauseDurations, pause] : prev.pauseDurations,
    }));

    setBehaviorData((prev) => ({
      ...prev,
      backspaceCount: value.length < timedChallenge.response.length ? prev.backspaceCount + 1 : prev.backspaceCount,
      keystrokes: [...prev.keystrokes, now],
      pauseDurations: pause > 700 ? [...prev.pauseDurations, pause] : prev.pauseDurations,
      typedCharacters: prev.typedCharacters + Math.max(0, value.length - timedChallenge.response.length),
    }));

    lastKeystrokeTimeRef.current = now;
  };

  const finalizeTimedChallenge = (timedOut = false) => {
    setTimedChallenge((prev) => {
      const finishedAt = Date.now();
      const elapsedMs = prev.startedAt ? Math.max(1000, finishedAt - prev.startedAt) : timedChallengeDuration * 1000;
      const averagePause = prev.pauseDurations.length
        ? Math.round(prev.pauseDurations.reduce((sum, item) => sum + item, 0) / prev.pauseDurations.length)
        : 0;
      const accuracy = calculateTextAccuracy(prev.prompt, prev.response);
      const charsPerMinute = Math.round((prev.response.trim().length / elapsedMs) * 60000);
      const completionRatio = Math.round((prev.response.trim().length / prev.prompt.length) * 100);

      let inference = "Balanced timed response";
      if (timedOut && completionRatio < 70) {
        inference = "May need extended processing time";
      } else if (averagePause >= 2200 || charsPerMinute < 55) {
        inference = "Slow and reflective processing pattern";
      } else if (prev.backspaceCount >= 6) {
        inference = "Careful but correction-heavy typing";
      } else if (accuracy >= 80 && charsPerMinute >= 90) {
        inference = "Comfortable timed typing";
      }

      return {
        ...prev,
        running: false,
        completed: true,
        finishedAt,
        remainingSeconds: 0,
        inference,
        accuracy,
        charsPerMinute,
        completionRatio,
        averagePause,
        timedOut,
      };
    });
  };

  const continueFromTimedChallenge = () => {
    if (!supportTasksCompleted) {
      setVoiceStatus("Please complete all support tasks before continuing.");
      return;
    }
    setPage("assessment");
  };

  const handleOrderingDragStart = (index) => {
    setOrderingTask((prev) => ({ ...prev, dragIndex: index }));
  };

  const handleOrderingDrop = (dropIndex) => {
    setOrderingTask((prev) => {
      if (prev.dragIndex === null || prev.dragIndex === dropIndex) return prev;
      const items = [...prev.items];
      const [movedItem] = items.splice(prev.dragIndex, 1);
      items.splice(dropIndex, 0, movedItem);
      return {
        ...prev,
        items,
        dragIndex: null,
      };
    });
  };

  const submitOrderingTask = () => {
    const correctPositions = orderingTask.items.filter((item, index) => item === orderingTarget[index]).length;
    setOrderingTask((prev) => ({
      ...prev,
      completed: true,
      attempts: prev.attempts + 1,
      score: Math.round((correctPositions / orderingTarget.length) * 100),
      dragIndex: null,
    }));
  };

  const startMemoryTask = () => {
    setMemoryTask({
      phase: "reveal",
      remainingSeconds: memoryRevealDuration,
      response: "",
      completed: false,
      score: 0,
      recalledWords: 0,
    });
  };

  const submitMemoryTask = () => {
    const recall = scoreKeywordRecall(memoryTask.response, memoryWords);
    setMemoryTask((prev) => ({
      ...prev,
      phase: "completed",
      completed: true,
      score: recall.score,
      recalledWords: recall.matches,
    }));
  };

  const playAudioPrompt = () => {
    setAudioTask((prev) => ({ ...prev, played: prev.played + 1 }));
    speakText(audioRecallContent.script, true);
  };

  const submitAudioTask = () => {
    const recall = scoreKeywordRecall(audioTask.response, audioRecallContent.keywords);
    setAudioTask((prev) => ({
      ...prev,
      completed: true,
      score: recall.score,
    }));
  };

  const selectComprehensionOption = (option) => {
    setComprehensionTask({
      selected: option,
      completed: true,
      score: option === comprehensionContent.correct ? 100 : 25,
    });
  };

  const analyzeResults = async () => {
    setLoadingPrediction(true);
    const payload = {
      ...answers,
      total_actions: (answers.video_actions || 0) + (answers.audio_actions || 0) + (answers.text_actions || 0),
      free_time: answers.free_time || 5,
    };
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          student_id: student.id,
          student_name: student.name,
        }),
      });
      let result;
      if (response.ok) {
        const data = await response.json();
        result = {
          prediction: data.prediction,
          confidence: typeof data.confidence === "number" ? data.confidence : mockPrediction(payload).confidence,
        };
      } else {
        result = mockPrediction(payload);
      }
      setAnswers(payload);
      setStudent((prev) => ({
        ...prev,
        learningStyle: result.prediction,
        confidence: Math.round(result.confidence * 100),
      }));
      setPage("dashboard");
      if (voiceEnabled) {
        speakText(`Your predicted learning style is ${result.prediction} with confidence ${Math.round(result.confidence * 100)} percent.`);
      }
    } catch {
      const result = mockPrediction(payload);
      setAnswers(payload);
      setStudent((prev) => ({
        ...prev,
        learningStyle: result.prediction,
        confidence: Math.round(result.confidence * 100),
      }));
      setPage("dashboard");
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    if (page !== "report" || !student.id) return;

    fetch("http://127.0.0.1:5000/save-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: student.id,
        student_name: student.name,
        report_summary: reportSummary,
        behavior_insights: behaviorInsights,
        support_check: supportCheckInsights,
        student_snapshot: {
          favoriteSubject: student.favoriteSubject,
          difficultSubject: student.difficultSubject,
          mathStyle: student.mathStyle,
          scienceStyle: student.scienceStyle,
          studyPreference: student.studyPreference,
          learningStyle: student.learningStyle,
          confidence: student.confidence,
        },
      }),
    }).catch(() => null);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (page !== "assessment" || !student.id) return;

    fetch("http://127.0.0.1:5000/behavior-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: student.id,
        student_name: student.name,
        page: "behavioral-and-timed-to-assessment",
        behavior_data: behaviorData,
        verification_data: behaviorVerification,
        support_check: supportCheckInsights,
      }),
    }).catch(() => null);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const featureRows = buildFeatureRows(answers);

  const reportSummary = buildReportSummary(student, answers, behaviorInsights, supportCheckInsights);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={adaptLearnLogo} alt="AdaptLearn logo" />
          <div>
            <h1>AdaptLearn</h1>
          </div>
        </div>
        <div className="progress-wrapper">
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <span>{progress}% complete</span>
        </div>
        <div className="profile-pill">
          <span className="profile-label">Student</span>
          <strong>{student.name || "Guest"}</strong>
        </div>
      </header>

      <main className="page">
        {page === "home" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.home, true)}>Listen</button></div>
            <div className="hero-layout">
              <div className="hero-panel">
                <span className="eyebrow">Machine Learning + Accessibility</span>
                <h2>ML-Based Adaptive Learning System for Neurodiverse Students</h2>
                <p className="hero-copy">
                  This React version makes the project feel more product-ready, modular, and suitable for demos,
                  viva explanations, and future extension.
                </p>
                <div className="hero-ribbon-row">
                  <span className="hero-ribbon">Predict</span>
                  <span className="hero-ribbon alt">Personalize</span>
                  <span className="hero-ribbon warm">Visualize</span>
                </div>
                <div className="hero-stats">
                  <div><strong>3</strong><span>Learning styles</span></div>
                  <div><strong>10</strong><span>Assessment signals</span></div>
                  <div><strong>1</strong><span>Personal dashboard</span></div>
                </div>
                <div className="cta-row">
                  <button className="primary-btn" onClick={() => setPage("login")}>Start Assessment</button>
                  <button className="secondary-btn" onClick={startContextMic}>Use Microphone</button>
                </div>
              </div>
              <div className="hero-side-stack">
                <div className="hero-side-card hero-side-card-main">
                  <p className="hero-side-kicker">Live system snapshot</p>
                  <div className="hero-side-grid">
                    <div>
                      <span className="hero-side-label">Frontend</span>
                      <strong>React + Vite</strong>
                    </div>
                    <div>
                      <span className="hero-side-label">Backend</span>
                      <strong>Flask API</strong>
                    </div>
                    <div>
                      <span className="hero-side-label">ML Core</span>
                      <strong>Random Forest</strong>
                    </div>
                    <div>
                      <span className="hero-side-label">Focus</span>
                      <strong>Accessibility</strong>
                    </div>
                  </div>
                </div>
                {heroHighlights.map((item) => (
                  <div className="hero-side-card" key={item.title}>
                    <span className="mini-eyebrow">{item.eyebrow}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="feature-grid">
              <FeatureCard title="Smart ML Detection" tone="blue" text="The system predicts whether visual, audio, or text-based support fits the learner best." />
              <FeatureCard title="Voice-Enabled UX" tone="orange" text="Microphone support works across login, assessment, subject selection, and page navigation." />
              <FeatureCard title="Presentation-Ready Dashboard" tone="green" text="The final dashboard and analytics view makes the project feel polished, intentional, and ready to present." />
            </div>
          </section>
        )}

        {page === "login" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.login, true)}>Listen</button></div>
            <div className="form-card">
              <div className="section-chip-row">
                <span className="section-chip">Step 1</span>
                <span className="section-chip ghost">Student onboarding</span>
              </div>
              <h2>Student Login</h2>
              <p>Enter your details to begin the adaptive learning assessment.</p>
              {behaviorInsights.supportHint && (
                <div className="support-banner">
                  <strong>Support tip:</strong> {behaviorInsights.supportHint}
                </div>
              )}
              <label className="field-label">Your Name</label>
              <div className="field-row">
                <input value={student.name} onChange={(e) => handleTrackedInputChange("name", e.target.value)} onFocus={() => handleFocusTrack("name")} placeholder="Enter your full name" />
                <button className="mic-btn" onClick={() => startVoiceInput("name")}>Mic</button>
              </div>
              <label className="field-label">Student ID</label>
              <div className="field-row">
                <input value={student.id} onChange={(e) => handleTrackedInputChange("id", e.target.value)} onFocus={() => handleFocusTrack("id")} placeholder="Enter your student ID" />
                <button className="mic-btn" onClick={() => startVoiceInput("id")}>Mic</button>
              </div>
              <div className="inline-actions"><button className="primary-btn full" onClick={startAssessment}>Begin Assessment</button></div>
            </div>
          </section>
        )}

        {page === "behavioral" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.behavioral, true)}>Listen</button></div>
            <div className="behavior-card">
              <div className="section-chip-row">
                <span className="section-chip">Step 2</span>
                <span className="section-chip ghost">Interaction assessment</span>
              </div>
              <h2>{currentInteractionLesson.topic}</h2>
              <p>{currentInteractionLesson.summary}</p>

              <div className="behavior-layout">
                <div className="behavior-media-card">
                  <div className="behavior-visual">{currentInteractionLesson.visual}</div>
                  <div className="behavior-video-frame">
                    {currentInteractionLesson.videoType === "video" ? (
                      <video
                        controls
                        preload="metadata"
                        onPlay={() => handleBehaviorMedia("play")}
                      >
                        <source src={currentInteractionLesson.videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        src={currentInteractionLesson.videoSrc}
                        title={`${currentInteractionLesson.topic} video`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="behavior-media-actions">
                    <button className="secondary-btn" onClick={() => handleBehaviorMedia("play")}>Mark Video Watched</button>
                    <button className="secondary-btn" onClick={() => handleBehaviorMedia("replay")}>Replay Support</button>
                    <button className="secondary-btn" onClick={() => handleBehaviorMedia("image")}>Inspect Visual</button>
                  </div>
                  <div className="behavior-mini-stats">
                    <span>Video plays: {behaviorVerification.videoPlays}</span>
                    <span>Replays: {behaviorVerification.videoReplays}</span>
                    <span>Visual clicks: {behaviorVerification.imageClicks}</span>
                  </div>
                </div>

                <div className="behavior-response-card">
                  <label className="field-label">{currentInteractionLesson.prompt}</label>
                  <textarea
                    className="behavior-textarea"
                    value={behaviorTaskResponse}
                    onChange={(e) => handleBehaviorTaskInput(e.target.value)}
                    placeholder="Type your understanding here..."
                    rows={6}
                  />
                  <div className="behavior-mini-stats">
                    <span>Task keystrokes: {behaviorVerification.taskKeystrokes.length}</span>
                    <span>Corrections: {behaviorVerification.taskBackspaces}</span>
                    <span>Inference: {behaviorVerification.inference}</span>
                  </div>
                </div>
              </div>

              <div className="inline-actions center">
                <button className="secondary-btn" onClick={() => setPage("login")}>Back</button>
                <button className="primary-btn" onClick={finalizeBehaviorVerification} disabled={!behaviorTaskResponse.trim()}>
                  {behaviorTaskIndex < interactionLessons.length - 1 ? "Next Verification Task" : "Continue To Main Assessment"}
                </button>
              </div>
            </div>
          </section>
        )}

        {page === "timed" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.timed, true)}>Listen</button></div>
            <div className="timed-header-card">
              <div>
                <div className="section-chip-row">
                  <span className="section-chip">Step 3</span>
                  <span className="section-chip ghost">Multi-task support check</span>
                </div>
                <h2>Multi-Task Behavioral Support Check</h2>
                <p>
                  These short tasks are not mark-based tests. They help the system observe processing pace,
                  ordering comfort, memory recall, listening recall, and short comprehension support needs.
                </p>
              </div>
              <div className={`timer-badge ${timedChallenge.running ? "running" : ""}`}>
                <span>Tasks Complete</span>
                <strong>{[timedChallenge.completed, orderingTask.completed, memoryTask.completed, audioTask.completed, comprehensionTask.completed].filter(Boolean).length}/5</strong>
              </div>
            </div>

            <div className="timed-layout">
              <div className="timed-card">
                <h3>Copy This Sentence</h3>
                <p className="timed-helper">Type the sentence below as accurately as you can before the timer ends.</p>
                <div className="timed-prompt-box">{timedChallenge.prompt}</div>
                <div className="inline-actions">
                  {!timedChallenge.running && !timedChallenge.completed && (
                    <button className="primary-btn" onClick={startTimedChallenge}>Start 45 Second Task</button>
                  )}
                  {timedChallenge.running && (
                    <button className="secondary-btn" onClick={() => finalizeTimedChallenge(false)}>Finish Now</button>
                  )}
                  {timedChallenge.completed && (
                    <button className="secondary-btn" onClick={startTimedChallenge}>Try Again</button>
                  )}
                </div>
              </div>

              <div className="timed-card">
                <h3>Student Response</h3>
                <textarea
                  className="behavior-textarea timed-textarea"
                  value={timedChallenge.response}
                  onChange={(e) => handleTimedChallengeInput(e.target.value)}
                  placeholder="Start the task, then type here..."
                  disabled={!timedChallenge.running}
                />
                <div className="behavior-mini-stats">
                  <span>Characters: {timedChallenge.response.trim().length}</span>
                  <span>Backspaces: {timedChallenge.backspaceCount}</span>
                  <span>Pauses: {timedChallenge.pauseDurations.length}</span>
                </div>
              </div>
            </div>

            <div className="timed-grid">
              <div className="timed-card">
                <h3>Drag And Drop Ordering</h3>
                <p className="timed-helper">Arrange the plant growth stages in the correct order by dragging the cards.</p>
                <div className="drag-list">
                  {orderingTask.items.map((item, index) => (
                    <div
                      key={item}
                      className="drag-item"
                      draggable
                      onDragStart={() => handleOrderingDragStart(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleOrderingDrop(index)}
                    >
                      <span className="drag-handle">::</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="inline-actions">
                  <button className="secondary-btn" onClick={() => setOrderingTask(createOrderingTask())}>Shuffle Again</button>
                  <button className="primary-btn" onClick={submitOrderingTask}>Check Order</button>
                </div>
                <div className="behavior-mini-stats">
                  <span>Score: {orderingTask.score}%</span>
                  <span>Status: {orderingTask.completed ? "Checked" : "Pending"}</span>
                </div>
              </div>

              <div className="timed-card">
                <h3>Memory Recall</h3>
                <p className="timed-helper">Look at the words, remember them, and then type the ones you recall.</p>
                {memoryTask.phase === "idle" && (
                  <button className="primary-btn" onClick={startMemoryTask}>Start Memory Task</button>
                )}
                {memoryTask.phase === "reveal" && (
                  <>
                    <div className="memory-word-grid">
                      {memoryWords.map((word) => <span key={word} className="memory-chip">{word}</span>)}
                    </div>
                    <div className="behavior-mini-stats">
                      <span>Memorize time left: {memoryTask.remainingSeconds}s</span>
                    </div>
                  </>
                )}
                {(memoryTask.phase === "answer" || memoryTask.phase === "completed") && (
                  <>
                    <textarea
                      className="behavior-textarea timed-textarea"
                      value={memoryTask.response}
                      onChange={(e) => setMemoryTask((prev) => ({ ...prev, response: e.target.value }))}
                      placeholder="Type the words you remember..."
                      disabled={memoryTask.completed}
                    />
                    {!memoryTask.completed && (
                      <div className="inline-actions">
                        <button className="primary-btn" onClick={submitMemoryTask} disabled={!memoryTask.response.trim()}>Submit Memory Recall</button>
                      </div>
                    )}
                  </>
                )}
                <div className="behavior-mini-stats">
                  <span>Remembered: {memoryTask.recalledWords}/{memoryWords.length}</span>
                  <span>Score: {memoryTask.score}%</span>
                </div>
              </div>

              <div className="timed-card">
                <h3>Audio Recall</h3>
                <p className="timed-helper">Listen carefully and type the key details you heard.</p>
                <div className="inline-actions">
                  <button className="secondary-btn" onClick={playAudioPrompt}>Play Audio Prompt</button>
                </div>
                <p className="timed-helper">{audioRecallContent.question}</p>
                <textarea
                  className="behavior-textarea timed-textarea"
                  value={audioTask.response}
                  onChange={(e) => setAudioTask((prev) => ({ ...prev, response: e.target.value }))}
                  placeholder="Type what you heard..."
                  disabled={audioTask.completed}
                />
                <div className="inline-actions">
                  <button className="primary-btn" onClick={submitAudioTask} disabled={!audioTask.response.trim()}>Submit Audio Recall</button>
                </div>
                <div className="behavior-mini-stats">
                  <span>Audio plays: {audioTask.played}</span>
                  <span>Score: {audioTask.score}%</span>
                </div>
              </div>

              <div className="timed-card">
                <h3>Short Comprehension</h3>
                <p className="timed-helper">{comprehensionContent.passage}</p>
                <label className="field-label">{comprehensionContent.question}</label>
                <div className="option-grid">
                  {comprehensionContent.options.map((option) => (
                    <button
                      key={option}
                      className={`option-card ${comprehensionTask.selected === option ? "selected" : ""}`}
                      onClick={() => selectComprehensionOption(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="behavior-mini-stats">
                  <span>Selected: {comprehensionTask.selected || "Pending"}</span>
                  <span>Score: {comprehensionTask.score}%</span>
                </div>
              </div>
            </div>

            <div className="timed-result-card">
              <div className="section-heading left">
                <span className="eyebrow">Support Check Insight</span>
                <h2>{supportCheckInsights.inference}</h2>
                <p>{supportCheckInsights.supportMessage}</p>
              </div>
              <div className="tile-grid">
                <MetricTile label="Typing" tone="blue" value={timedChallengeInsights.accuracy} />
                <MetricTile label="Ordering" tone="orange" value={orderingTask.score} />
                <MetricTile label="Memory" tone="green" value={memoryTask.score} />
                <MetricTile label="Audio Recall" tone="violet" value={audioTask.score} />
                <MetricTile label="Comprehension" tone="pink" value={comprehensionTask.score} />
              </div>
              <div className="support-banner subtle">
                <strong>Interpretation:</strong> {supportCheckInsights.diagnosticNote}
              </div>
            </div>

            <div className="inline-actions center">
              <button className="secondary-btn" onClick={() => setPage("behavioral")}>Back</button>
              <button className="primary-btn" onClick={continueFromTimedChallenge} disabled={!supportTasksCompleted}>
                Continue To Questionnaire
              </button>
            </div>
          </section>
        )}

        {page === "assessment" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.assessment, true)}>Listen</button></div>
            <div className="question-card">
              <div className="section-chip-row">
                <span className="section-chip">Step 4</span>
                <span className="section-chip ghost">Learning habits</span>
              </div>
              <span className="question-tag">Question {questionIndex + 1} of {questions.length}</span>
              <h2>{question.text}</h2>
              <p>Use the slider or microphone to choose the value that matches your experience.</p>
              {behaviorInsights.adaptivePrompt && (
                <div className="support-banner subtle">
                  <strong>Adaptive prompt:</strong> {behaviorInsights.adaptivePrompt}
                </div>
              )}
              <div className="range-value">{answers[question.id]}</div>
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={answers[question.id]}
                onChange={(e) => {
                  setBehaviorData((prev) => ({ ...prev, sliderAdjustments: prev.sliderAdjustments + 1 }));
                  setAnswers((prev) => ({ ...prev, [question.id]: Number(e.target.value) }));
                }}
              />
              <div className="range-labels">{question.labels.map((label) => <span key={label}>{label}</span>)}</div>
            </div>
            <div className="inline-actions center">
              <button className="secondary-btn" onClick={previousQuestion} disabled={questionIndex === 0}>Back</button>
              <button className="secondary-btn" onClick={startContextMic}>Answer by Voice</button>
              <button className="primary-btn" onClick={nextQuestion}>Next</button>
            </div>
          </section>
        )}

        {page === "subject" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.subject, true)}>Listen</button></div>
            <div className="form-card wide">
              <div className="section-chip-row">
                <span className="section-chip">Step 5</span>
                <span className="section-chip ghost">Preference tuning</span>
              </div>
              <h2>Subject Preferences</h2>
              <p>These preferences personalize the experience and help your project feel more student-centered.</p>
              {subjectGroups.map((group) => (
                <div className="subject-block" key={group.key}>
                  <label className="field-label">{group.label}</label>
                  <div className="option-grid">
                    {group.options.map((option) => (
                      <button
                        key={option}
                        className={`option-card ${student[group.key] === option ? "selected" : ""}`}
                        onClick={() => setStudent((prev) => ({ ...prev, [group.key]: option }))}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="inline-actions">
                <button className="secondary-btn" onClick={startContextMic}>Fill by Voice</button>
                <button className="primary-btn" onClick={analyzeResults} disabled={loadingPrediction}>
                  {loadingPrediction ? "Analyzing..." : "Analyze My Learning Style"}
                </button>
              </div>
            </div>
          </section>
        )}

        {page === "dashboard" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.dashboard, true)}>Listen</button></div>
            <div className="dashboard-hero">
              <div>
                <p className="dashboard-kicker">Learning Profile</p>
                <h2>{student.name || "Student"}'s Adaptive Learning Summary</h2>
                <p>{student.id ? `ID: ${student.id}` : "Student ID unavailable"}</p>
              </div>
              <div className="dashboard-hero-actions">
                <div className="dashboard-badge">
                  <span>Predicted focus</span>
                  <strong>{student.learningStyle || "Pending"}</strong>
                </div>
                <button className="secondary-btn" onClick={() => setPage("recommendation")}>View Recommendations</button>
              </div>
            </div>
            <div className="stats-grid">
              <StatCard title="Predicted Style" tone="blue" value={student.learningStyle || "-"} />
              <StatCard title="Confidence" tone="orange" value={`${student.confidence || 0}%`} />
              <div className="chart-card">
                <h3>Style Distribution</h3>
                <div className="chart-box"><canvas ref={styleChartRef} /></div>
              </div>
            </div>
            <div className="grid-two">
              <div className="info-card">
                <h3>Study Inputs</h3>
                <p>These indicators explain the student profile in plain language so teachers and parents can read it easily.</p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Indicator</th><th>Student Value</th><th>What It Shows</th><th>Interpretation</th></tr>
                    </thead>
                    <tbody>
                      {featureRows.map((row) => (
                        <tr key={row.key}>
                          <td>{row.label}</td>
                          <td>{row.value}</td>
                          <td>{row.focus}</td>
                          <td>{row.reading}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="info-card">
                <h3>Student Preferences</h3>
                <div className="mini-feature-list">
                  {subjectGroups.map((group) => (
                    <div className="mini-feature" key={group.key}>
                      <span>{group.label}</span>
                      <strong>{student[group.key] || "Not selected"}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "recommendation" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.recommendation, true)}>Listen</button></div>
            <div className="section-heading">
              <span className="eyebrow">Personalized Support</span>
              <h2>Recommendations for a {student.learningStyle || "Visual"} learner</h2>
              <p>These recommendations turn the prediction into practical study actions.</p>
            </div>
            <div className="feature-grid">
              {recommendations.map((item) => (
                <FeatureCard key={item.title} title={item.title} tone="violet" text={item.text} />
              ))}
            </div>
            <div className="toolkit-section">
              <div className="section-heading left">
                <span className="eyebrow">Direct Toolkit</span>
                <h2>Tools for {student.learningStyle || "Visual"} learners</h2>
                <p>These links open practical tools that match the recommended learning style so the student can start immediately.</p>
              </div>
              <div className="toolkit-grid">
                {toolkit.map((tool) => (
                  <a
                    key={tool.title}
                    className="tool-card"
                    href={tool.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setBehaviorData((prev) => ({ ...prev, toolClicks: prev.toolClicks + 1 }))}
                  >
                    <div className="tool-card-top">
                      <span className="tool-pill">Open Tool</span>
                    </div>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <span className="tool-link">Launch</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="inline-actions center">
              <button className="secondary-btn" onClick={() => setPage("dashboard")}>Back to Dashboard</button>
              <button className="primary-btn" onClick={() => setPage("analytics")}>View Analytics</button>
              <button className="secondary-btn" onClick={() => setPage("report")}>Open Report</button>
            </div>
          </section>
        )}

        {page === "analytics" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.analytics, true)}>Listen</button></div>
            <div className="section-heading">
              <span className="eyebrow">Feature Analytics</span>
              <h2>Learning Engagement Overview</h2>
              <p>The analytics page presents the core ML features in a clearer and more professional way.</p>
            </div>
            {datasetSummary && (
              <>
                <div className="section-heading left">
                  <span className="eyebrow">Dataset Dashboard</span>
                  <h2>Combined Final Dataset Overview</h2>
                  <p>A Power BI-style summary of the full dataset with KPI tiles and distribution charts.</p>
                </div>
                <div className="dataset-kpi-grid">
                  <div className="dataset-kpi-card blue">
                    <span>Total Students</span>
                    <strong>{datasetSummary.total_students}</strong>
                  </div>
                  <div className="dataset-kpi-card orange">
                    <span>High Grade Students</span>
                    <strong>{datasetSummary.performance_bands?.high_grade ?? 0}</strong>
                  </div>
                  <div className="dataset-kpi-card green">
                    <span>Medium Grade Students</span>
                    <strong>{datasetSummary.performance_bands?.medium_grade ?? 0}</strong>
                  </div>
                  <div className="dataset-kpi-card violet">
                    <span>Low Grade Students</span>
                    <strong>{datasetSummary.performance_bands?.low_grade ?? 0}</strong>
                  </div>
                </div>
                <div className="report-grid">
                  <div className="chart-card">
                    <h3>Learning Style Distribution</h3>
                    <div className="chart-box"><canvas ref={datasetStyleChartRef} /></div>
                  </div>
                  <div className="chart-card">
                    <h3>Average Dataset Metrics</h3>
                    <div className="chart-box"><canvas ref={datasetMetricChartRef} /></div>
                  </div>
                </div>
              </>
            )}
            <div className="tile-grid">
              <MetricTile label="Hand Raise" tone={metricThemes[0]} value={answers.hand_raise} />
              <MetricTile label="Resource Visits" tone={metricThemes[1]} value={answers.resource_visits} />
              <MetricTile label="Study Time" tone={metricThemes[2]} value={answers.study_time} />
              <MetricTile label="Video Actions" tone={metricThemes[3]} value={answers.video_actions} />
              <MetricTile label="Audio Actions" tone={metricThemes[4]} value={answers.audio_actions} />
              <MetricTile label="Text Actions" tone={metricThemes[5]} value={answers.text_actions} />
            </div>
            <div className="chart-card large">
              <h3>Feature Chart</h3>
              <div className="chart-box"><canvas ref={featureChartRef} /></div>
            </div>
            <div className="inline-actions center">
              <button className="secondary-btn" onClick={() => setPage("dashboard")}>Back to Dashboard</button>
              <button className="primary-btn" onClick={() => setPage("report")}>Generate Final Report</button>
            </div>
          </section>
        )}

        {page === "report" && (
          <section className="page-section">
            <div className="section-tools"><button className="audio-btn" onClick={() => speakText(pageIntro.report, true)}>Listen</button></div>
            <div className="report-header-card">
              <div>
                <span className="eyebrow">Parent And Teacher Report</span>
                <h2>{student.name || "Student"} Progress And Support Summary</h2>
                <p>
                  This final report highlights the student's likely learning condition, classroom needs,
                  and recommended support actions based on the assessment and ML result.
                </p>
              </div>
              <div className="report-score-card">
                <span>Support Priority</span>
                <strong>{reportSummary.priority}</strong>
                <small>{reportSummary.priorityNote}</small>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-panel">
                <h3>Student Snapshot</h3>
                <div className="report-list">
                  <div><span>Name</span><strong>{student.name || "Not entered"}</strong></div>
                  <div><span>Student ID</span><strong>{student.id || "Not entered"}</strong></div>
                  <div><span>Predicted Learning Style</span><strong>{student.learningStyle || "Pending"}</strong></div>
                  <div><span>Model Confidence</span><strong>{student.confidence || 0}%</strong></div>
                  <div><span>Favorite Subject</span><strong>{student.favoriteSubject || "Not selected"}</strong></div>
                  <div><span>Most Challenging Subject</span><strong>{student.difficultSubject || "Not selected"}</strong></div>
                  <div><span>Interaction Verification</span><strong>{behaviorVerification.inference}</strong></div>
                </div>
              </div>

              <div className="report-panel">
                <h3>Overall Condition</h3>
                <p className="report-lead">{reportSummary.condition}</p>
                <p>{reportSummary.interpretation}</p>
                <div className="report-badges">
                  <span className="report-badge blue">Engagement: {reportSummary.engagementLabel}</span>
                  <span className="report-badge orange">Study Routine: {reportSummary.studyRoutineLabel}</span>
                  <span className="report-badge green">Attendance Risk: {reportSummary.attendanceLabel}</span>
                </div>
              </div>
            </div>

            <div className="report-panel report-wide">
              <h3>Behavioral Interaction Insights</h3>
              <div className="report-list">
                <div><span>Typing activity</span><strong>{behaviorInsights.typingLevel}</strong></div>
                <div><span>Corrections / backspaces</span><strong>{behaviorData.backspaceCount}</strong></div>
                <div><span>Average pause duration</span><strong>{behaviorInsights.avgPauseMs} ms</strong></div>
                <div><span>Navigation pace</span><strong>{behaviorInsights.navigationStyle}</strong></div>
                <div><span>Voice support usage</span><strong>{behaviorData.voiceSessions}</strong></div>
                <div><span>Learning tool clicks</span><strong>{behaviorData.toolClicks}</strong></div>
              </div>
            </div>

            <div className="report-panel report-wide">
              <h3>Multi-Task Support Check</h3>
              <div className="report-list">
                <div><span>Overall result</span><strong>{supportCheckInsights.inference}</strong></div>
                <div><span>Typing accuracy</span><strong>{timedChallengeInsights.accuracy}%</strong></div>
                <div><span>Ordering score</span><strong>{orderingTask.score}%</strong></div>
                <div><span>Memory recall</span><strong>{memoryTask.score}%</strong></div>
                <div><span>Audio recall</span><strong>{audioTask.score}%</strong></div>
                <div><span>Comprehension score</span><strong>{comprehensionTask.score}%</strong></div>
                <div><span>Average typing pause</span><strong>{timedChallengeInsights.averagePause} ms</strong></div>
              </div>
              <p>{supportCheckInsights.supportMessage}</p>
            </div>

            <div className="report-grid three">
              <div className="report-panel">
                <h3>Strengths</h3>
                <ul className="report-points">
                  {reportSummary.strengths.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="report-panel">
                <h3>Areas Of Concern</h3>
                <ul className="report-points">
                  {reportSummary.concerns.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="report-panel">
                <h3>Recommended Actions</h3>
                <ul className="report-points">
                  {reportSummary.actions.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="report-panel report-wide">
              <h3>Teacher / Parent Note</h3>
              <p>
                {student.name || "The student"} appears to benefit most from <strong>{student.learningStyle || "structured"}</strong> learning support.
                Based on the current responses, the student may need <strong>{reportSummary.supportFocus}</strong>. A balanced approach with regular check-ins,
                short study targets, and subject-specific reinforcement in <strong>{student.difficultSubject || "more difficult areas"}</strong> is recommended.
              </p>
            </div>

            <div className="inline-actions center">
              <button className="secondary-btn" onClick={() => setPage("analytics")}>Back to Analytics</button>
              <button className="primary-btn" onClick={() => window.print()}>Print Report</button>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        {pageOrder.map((item) => (
          <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>
            {item}
          </button>
        ))}
      </nav>

      <button className={`voice-fab ${listening ? "listening" : ""}`} onClick={startContextMic}>Mic</button>
      <button
        className={`speech-toggle ${voiceEnabled ? "active" : ""}`}
        onClick={() => {
          setVoiceEnabled((prev) => {
            const next = !prev;
            if (next) speakText("Audio guidance has been turned on.", true);
            else window.speechSynthesis?.cancel();
            return next;
          });
        }}
      >
        {voiceEnabled ? "Voice Guidance On" : "Voice Guidance Off"}
      </button>
      <div className="voice-status-chip">{voiceStatus}</div>
    </div>
  );
}

function FeatureCard({ title, text, tone = "blue" }) {
  return (
    <article className={`feature-card ${tone}`}>
      <div className="feature-icon" />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function StatCard({ title, value, tone = "blue" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricTile({ label, value, tone = "blue" }) {
  const width = clamp(Number(value || 0), 0, 100);
  return (
    <div className={`metric-tile ${tone}`}>
      <div className="metric-head">
        <span>{label}</span>
        <strong>{Math.round(value || 0)}</strong>
      </div>
      <div className="metric-bar"><div style={{ width: `${width}%` }} /></div>
    </div>
  );
}

function buildReportSummary(student, answers, behaviorInsights, supportCheckInsights) {
  const engagementScore = Math.round(((answers.video_actions || 0) + (answers.audio_actions || 0) + (answers.text_actions || 0) + (answers.resource_visits || 0) + (answers.hand_raise || 0)) / 5);
  const studyRoutine = Math.round(((answers.study_time || 0) * 8) + ((answers.announcement_views || 0) * 0.35));
  const absenceRisk = answers.absences || 0;
  const grade = answers.final_grade || 0;

  let priority = "Moderate";
  let priorityNote = "Regular monitoring recommended";
  if (absenceRisk >= 10 || grade < 40 || engagementScore < 30) {
    priority = "High";
    priorityNote = "Needs close support and follow-up";
  } else if (engagementScore >= 70 && grade >= 60 && absenceRisk <= 4) {
    priority = "Low";
    priorityNote = "Current support level appears effective";
  }

  const strengths = [];
  const concerns = [];
  const actions = [];

  if (engagementScore >= 65) strengths.push("Shows healthy engagement with learning materials and classroom participation.");
  if (grade >= 60) strengths.push("Current academic performance suggests the student can manage core topics with the right support.");
  if ((answers.study_time || 0) >= 4) strengths.push("Maintains a fairly regular study routine.");
  if (student.learningStyle) strengths.push(`Responds well to ${student.learningStyle.toLowerCase()} learning methods.`);

  if (absenceRisk >= 6) concerns.push("Attendance level may be affecting continuity and classroom confidence.");
  if (grade < 50) concerns.push("Recent academic score suggests the student may need additional reinforcement.");
  if (engagementScore < 40) concerns.push("Engagement with learning materials appears limited.");
  if ((answers.study_time || 0) < 2) concerns.push("Daily study time appears low and may affect retention.");
  if (student.difficultSubject) concerns.push(`${student.difficultSubject} may need targeted intervention and simpler reinforcement.`); 
  if (behaviorInsights.backspaceRisk) concerns.push("Frequent corrections may indicate hesitation, uncertainty, or difficulty with text-heavy responses.");
  if (behaviorInsights.pauseRisk) concerns.push("Long pauses during interaction may suggest cognitive overload or the need for more processing time.");
  if (behaviorInsights.navigationRisk) concerns.push("Rapid page movement may indicate task-skipping, restlessness, or reduced sustained attention.");
  if (supportCheckInsights.processingRisk) concerns.push("The multi-task support check suggests the student may need extended processing time during written or structured tasks.");
  if (supportCheckInsights.accuracyRisk) concerns.push("Performance dropped under pressure across one or more short tasks, so calmer pacing may help.");
  if (supportCheckInsights.memoryRisk) concerns.push("Memory recall under short exposure may need reinforcement through repetition and chunking.");
  if (supportCheckInsights.audioRisk) concerns.push("Listening recall may need spoken repetition and slower verbal instruction.");

  actions.push(`Provide more ${student.learningStyle ? student.learningStyle.toLowerCase() : "personalized"} learning resources during revision.`);
  actions.push("Set short weekly goals and review progress consistently with the student.");
  actions.push("Use encouraging check-ins from teachers or parents to reduce stress and improve consistency.");
  if (student.difficultSubject) actions.push(`Plan extra support sessions for ${student.difficultSubject}.`);
  if (behaviorInsights.backspaceRisk) actions.push("Reduce long written demands and provide scaffolded prompts or sentence starters.");
  if (behaviorInsights.pauseRisk) actions.push("Allow more response time and break instructions into smaller, calmer steps.");
  if (behaviorInsights.navigationRisk) actions.push("Use guided task flow with clearer step markers and fewer distractions per screen.");
  if (supportCheckInsights.processingRisk) actions.push("Offer extra time for written responses and avoid treating slower completion as lack of understanding.");
  if (supportCheckInsights.accuracyRisk) actions.push("Use shorter copy tasks, chunked instructions, and low-pressure text verification activities.");
  if (supportCheckInsights.memoryRisk) actions.push("Use visual reminders, spaced repetition, and fewer items per step during recall-heavy tasks.");
  if (supportCheckInsights.audioRisk) actions.push("Repeat verbal instructions slowly and pair them with visual cues or short written supports.");

  if (!strengths.length) strengths.push("The student is still building consistent learning habits, and strengths may become clearer with repeated monitoring.");
  if (!concerns.length) concerns.push("No immediate major concern is visible from the current assessment, but periodic review is still advised.");

  return {
    priority,
    priorityNote,
    engagementLabel: engagementScore >= 70 ? "Strong" : engagementScore >= 40 ? "Moderate" : "Low",
    studyRoutineLabel: studyRoutine >= 60 ? "Stable" : studyRoutine >= 30 ? "Developing" : "Weak",
    attendanceLabel: absenceRisk <= 3 ? "Low" : absenceRisk <= 8 ? "Watch" : "High",
    condition: priority === "High"
      ? "The student may currently require structured academic and emotional support."
      : priority === "Low"
        ? "The student appears relatively stable with manageable support needs."
        : "The student shows mixed indicators and may benefit from guided support.",
    interpretation: `The profile suggests a ${student.learningStyle || "personalized"} learning preference, ${engagementScore >= 50 ? "fair engagement" : "reduced engagement"}, and ${absenceRisk <= 4 ? "acceptable attendance" : "attendance patterns that should be monitored"} .`,
    strengths,
    concerns,
    actions,
    supportFocus: priority === "High" ? "closer supervision, targeted remediation, and regular encouragement" : priority === "Low" ? "continued structured guidance and positive reinforcement" : "steady monitoring, clearer routines, and adaptive study strategies",
  };
}

function buildTimedChallengeInsights(timedChallenge) {
  const accuracy = timedChallenge.accuracy ?? calculateTextAccuracy(timedChallenge.prompt || "", timedChallenge.response || "");
  const completionRatio = timedChallenge.completionRatio ?? Math.round((((timedChallenge.response || "").trim().length) / Math.max(1, (timedChallenge.prompt || "").length)) * 100);
  const charsPerMinute = timedChallenge.charsPerMinute ?? 0;
  const averagePause = timedChallenge.averagePause ?? (
    timedChallenge.pauseDurations?.length
      ? Math.round(timedChallenge.pauseDurations.reduce((sum, item) => sum + item, 0) / timedChallenge.pauseDurations.length)
      : 0
  );
  const timedOut = Boolean(timedChallenge.timedOut);

  let inference = timedChallenge.inference || "Pending";
  if (inference === "Pending" && timedChallenge.completed) {
    if (timedOut && completionRatio < 70) inference = "May need extended processing time";
    else if (averagePause >= 2200 || charsPerMinute < 55) inference = "Slow and reflective processing pattern";
    else if (timedChallenge.backspaceCount >= 6) inference = "Careful but correction-heavy typing";
    else if (accuracy >= 80 && charsPerMinute >= 90) inference = "Comfortable timed typing";
    else inference = "Balanced timed response";
  }

  let supportMessage = "This task suggests the student can work with a normal writing pace and standard classroom prompts.";
  let diagnosticNote = "This is a functional classroom support signal, not a medical diagnosis.";

  if (inference === "May need extended processing time" || inference === "Slow and reflective processing pattern") {
    supportMessage = "The student may understand content better when given extra time, calmer pacing, and reduced writing pressure.";
    diagnosticNote = "The pattern looks like slower processing under time pressure. It should be treated as a support need, not as a label.";
  } else if (inference === "Careful but correction-heavy typing") {
    supportMessage = "The student appears engaged but may self-correct often, so supportive prompts and short writing chunks may help.";
  } else if (inference === "Comfortable timed typing") {
    supportMessage = "The student handled the timed writing task comfortably with good pace and stable accuracy.";
  }

  return {
    inference,
    accuracy,
    completionRatio: Math.min(completionRatio, 100),
    charsPerMinute,
    averagePause,
    timedOut,
    supportMessage,
    diagnosticNote,
    processingRisk: inference === "May need extended processing time" || inference === "Slow and reflective processing pattern",
    accuracyRisk: accuracy < 65,
  };
}

function buildSupportCheckInsights(timedChallengeInsights, orderingTask, memoryTask, audioTask, comprehensionTask) {
  const averageScore = Math.round(
    (
      timedChallengeInsights.accuracy +
      (orderingTask.score || 0) +
      (memoryTask.score || 0) +
      (audioTask.score || 0) +
      (comprehensionTask.score || 0)
    ) / 5
  );

  let inference = "Balanced classroom support profile";
  if (timedChallengeInsights.processingRisk || averageScore < 55) {
    inference = "May benefit from slower pacing and guided support";
  } else if ((memoryTask.score || 0) < 50) {
    inference = "Memory reinforcement may be helpful";
  } else if ((audioTask.score || 0) < 50) {
    inference = "Listening instructions may need reinforcement";
  } else if (averageScore >= 80) {
    inference = "Comfortable across mixed classroom tasks";
  }

  let supportMessage = "The student shows a fairly balanced response across the short support tasks.";
  let diagnosticNote = "These task results indicate classroom support needs and learning comfort, not a medical diagnosis.";

  if (inference === "May benefit from slower pacing and guided support") {
    supportMessage = "The student may perform better when tasks are broken into smaller steps with extra time and calmer pacing.";
    diagnosticNote = "The combined pattern suggests processing load under pressure. It should be used for support planning, not for diagnosis.";
  } else if (inference === "Memory reinforcement may be helpful") {
    supportMessage = "The student may benefit from repetition, review cues, and smaller recall chunks.";
  } else if (inference === "Listening instructions may need reinforcement") {
    supportMessage = "The student may understand spoken directions better when they are repeated slowly and paired with visuals or text.";
  } else if (inference === "Comfortable across mixed classroom tasks") {
    supportMessage = "The student handled the mixed tasks steadily and showed a healthy classroom support profile.";
  }

  return {
    inference,
    averageScore,
    supportMessage,
    diagnosticNote,
    processingRisk: timedChallengeInsights.processingRisk || averageScore < 55,
    accuracyRisk: timedChallengeInsights.accuracyRisk || (orderingTask.score || 0) < 50 || (comprehensionTask.score || 0) < 50,
    memoryRisk: (memoryTask.score || 0) < 50,
    audioRisk: (audioTask.score || 0) < 50,
  };
}

function buildBehaviorInsights(behaviorData) {
  const avgPause = behaviorData.pauseDurations.length
    ? Math.round(behaviorData.pauseDurations.reduce((sum, value) => sum + value, 0) / behaviorData.pauseDurations.length)
    : 0;

  const typingLevel = behaviorData.keystrokes.length > 30
    ? "High"
    : behaviorData.keystrokes.length > 10
      ? "Moderate"
      : "Low";

  const backspaceRisk = behaviorData.backspaceCount >= 5;
  const pauseRisk = avgPause >= 1800;
  const navigationRisk = behaviorData.rapidNavigationCount >= 3;

  let supportHint = "";
  if (backspaceRisk) {
    supportHint = "The student may benefit from simpler prompts, voice input, or reduced writing pressure.";
  } else if (pauseRisk) {
    supportHint = "Long pauses suggest that extra response time and calmer pacing may help.";
  }

  let adaptivePrompt = "";
  if (pauseRisk) adaptivePrompt = "Take your time. There is no time pressure here.";
  else if (backspaceRisk) adaptivePrompt = "Short answers are okay. You can also use the microphone if that feels easier.";

  return {
    avgPauseMs: avgPause,
    typingLevel,
    navigationStyle: navigationRisk ? "Very fast / inconsistent" : behaviorData.navigationDurations.length > 2 ? "Steady" : "Still building pattern",
    supportHint,
    adaptivePrompt,
    backspaceRisk,
    pauseRisk,
    navigationRisk,
  };
}
