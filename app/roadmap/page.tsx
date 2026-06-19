"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  BookOpen,
  Code,
  ShieldCheck,
  HelpCircle,
  Activity,
  User,
  Compass,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Database,
  Globe,
  Smartphone,
  Shield,
  Layers,
  Terminal,
  Cpu,
  Workflow,
  Sliders
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface InterviewRecord {
  _id: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  hiringRecommendation: string;
  createdAt: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: "completed" | "active" | "locked";
  icon: any;
  recommendations: string[];
  actionLabel: string;
  actionUrl: string;
  details: string;
}

interface TrackInfo {
  id: string;
  name: string;
  icon: any;
  description: string;
}

interface SyllabusMilestone {
  title: string;
  description: string;
  recommendations: string[];
  actionLabel: string;
  actionUrl: string;
  details: string;
  icon: any;
}

// 11 Career Tracks Info
const TRACKS: TrackInfo[] = [
  { id: "frontend", name: "Frontend Developer", icon: Globe, description: "Client-side UIs, web experiences, and state management frameworks" },
  { id: "backend", name: "Backend Developer", icon: Database, description: "Server logic, database architecture, caching, and scalable APIs" },
  { id: "fullstack", name: "Full-Stack Developer", icon: Layers, description: "End-to-end web architectures, client routing, and database integrations" },
  { id: "dsa", name: "DSA Mastery", icon: Cpu, description: "Core data structures, algorithms, time complexity, and coding puzzles" },
  { id: "data-analyst", name: "Data Analyst", icon: Sliders, description: "Data analytics, querying, aggregations, visualizations, and reporting" },
  { id: "data-scientist", name: "Data Scientist / AI", icon: Terminal, description: "Machine learning model pipelines, statistics, and LLM orchestration" },
  { id: "devops", name: "DevOps Engineer", icon: Workflow, description: "CI/CD pipelines, container orchestration, monitoring, and cloud IaC" },
  { id: "mobile", name: "Mobile App Developer", icon: Smartphone, description: "Native/cross-platform app compilation, notifications, and device sensors" },
  { id: "cybersecurity", name: "Cybersecurity Analyst", icon: Shield, description: "Network protocols, penetration audits, incident response, and compliance" },
  { id: "product-manager", name: "Product Manager", icon: Compass, description: "Agile sprints, wireframes, analytics metrics, and strategy roadmaps" },
  { id: "qa", name: "QA / Automation Testing", icon: CheckCircle2, description: "E2E scripts, manual test suites, API validations, and continuous testing" }
];

// Track Syllabi Mapping
const TRACK_SYLLABI: Record<string, SyllabusMilestone[]> = {
  frontend: [
    {
      title: "HTML5, CSS3 & Responsive UI",
      description: "Master modern layout techniques (Flexbox, Grid), semantic HTML, and Tailwind CSS.",
      recommendations: [
        "Create fluid layouts that adapt to multiple viewports.",
        "Ensure HTML follows semantic accessibility guidelines (ARIA labels).",
        "Build styling tokens and layouts using utility classes."
      ],
      actionLabel: "Analyze Resume for UI",
      actionUrl: "/resume-analyzer",
      details: "Client-facing designs start with semantic HTML and adaptive styles. Resume analyzer checks your front-end styling keywords.",
      icon: Globe
    },
    {
      title: "JavaScript ES6+ & Async flow",
      description: "Deep dive into JS engines, closures, async callbacks, promises, and Async/Await.",
      recommendations: [
        "Practice asynchronous programming scenarios using real API mocks.",
        "Master JS array operations (map, filter, reduce) and object references.",
        "Learn modular script architectures and ES module syntax."
      ],
      actionLabel: "Start Coding Prep",
      actionUrl: "/interview",
      details: "JavaScript is the core language of web client systems. Make sure you understand the call stack, event loop, and closures.",
      icon: Code
    },
    {
      title: "React & Next.js Components",
      description: "Learn client components, state triggers, standard React hooks, and Next.js routing.",
      recommendations: [
        "Optimize component re-rendering triggers with useMemo & useCallback.",
        "Master directory routing and server component boundaries in Next.js.",
        "Practice loading states, skeleton screens, and client-side error boundaries."
      ],
      actionLabel: "Enter Simulator",
      actionUrl: "/interview-simulator",
      details: "React components structure clean, modular UI pages. Next.js extends it with dynamic server-side page renders.",
      icon: Play
    },
    {
      title: "API State & Dynamic Data",
      description: "Integrate asynchronous queries using TanStack Query, REST requests, and caching logic.",
      recommendations: [
        "Handle pagination, caching, and background synchronization tags.",
        "Manage optimistic updates for seamless user responsiveness.",
        "Review JWT token headers and CORS restrictions on fetching."
      ],
      actionLabel: "Practice Fetching",
      actionUrl: "/interview",
      details: "Dynamic applications require syncing state with remote backends securely without constant manual page refreshes.",
      icon: Database
    },
    {
      title: "Frontend Auditing & Optimization",
      description: "Audit layouts via Lighthouse, minimize bundle footprints, and implement unit tests.",
      recommendations: [
        "Identify and fix layout shifts (CLS) and speed indexes.",
        "Write component test suites using Vitest and React Testing Library.",
        "Practice lazy loading and asset image compression."
      ],
      actionLabel: "Review Test Suites",
      actionUrl: "/interview",
      details: "Performance directly dictates user conversion metrics. Master debugging bundle sizes, third-party script delays, and layout reflows.",
      icon: Activity
    },
    {
      title: "Frontend Technical Interview Mock",
      description: "Simulate a live front-end engineer screening round reviewing systems and mock coding.",
      recommendations: [
        "Discuss state management trade-offs (Redux vs Context API).",
        "Code real-time UI widgets under time constraints.",
        "Explain CSS rendering critical paths clearly."
      ],
      actionLabel: "Launch Mock Interview",
      actionUrl: "/interview-simulator",
      details: "The final step to proving front-end competency. The AI simulates mock panel rounds analyzing UI engineering concepts.",
      icon: Award
    }
  ],
  backend: [
    {
      title: "Language & Server Basics",
      description: "Learn Node.js/Express, Python/FastAPI, or Java Spring Boot and HTTP mechanics.",
      recommendations: [
        "Handle HTTP requests, status codes, query inputs, and JSON payloads.",
        "Manage asynchronous event handling and multithreading processes.",
        "Organize controller-service-repository project layouts."
      ],
      actionLabel: "Analyze Backend CV",
      actionUrl: "/resume-analyzer",
      details: "Backend roles require absolute clarity on server life-cycles, HTTP headers, routing middlewares, and logging protocols.",
      icon: Terminal
    },
    {
      title: "Database Design & Queries",
      description: "Design relational SQL schemas and document-based NoSQL database collections.",
      recommendations: [
        "Practice joining tables, writing subqueries, and window functions.",
        "Define database indices to optimize fetch query latencies.",
        "Analyze ACID transaction properties and schema migrations."
      ],
      actionLabel: "Practice Database Querying",
      actionUrl: "/interview",
      details: "Databases are the core layer of data persistence. Query design directly impacts API speed and throughput under stress.",
      icon: Database
    },
    {
      title: "Secure API Architecture",
      description: "Secure data gateways with authentication tokens, encryption, and validation rules.",
      recommendations: [
        "Implement JSON Web Tokens (JWT) and OAuth2 security flows.",
        "Add input sanitization and Zod schemas to block injection attacks.",
        "Define role-based access controls (RBAC) across endpoints."
      ],
      actionLabel: "Launch API Simulation",
      actionUrl: "/interview-simulator",
      details: "Security is non-negotiable. Protect routes from data leakage, unauthorized editing, and automated parameter abuse.",
      icon: Play
    },
    {
      title: "System Caching & Message Queues",
      description: "Integrate Redis cache systems, BullMQ/RabbitMQ messaging, and Docker containers.",
      recommendations: [
        "Implement key-value lookups to cache database query results.",
        "Decouple time-intensive worker tasks using queues.",
        "Deploy and run local backend services containerized in Docker."
      ],
      actionLabel: "Analyze System Scenarios",
      actionUrl: "/interview",
      details: "Scaling database connections requires caching layers. Decoupled tasks ensure main server threads stay free for clients.",
      icon: Layers
    },
    {
      title: "CI/CD & Integration Testing",
      description: "Write integration tests, mock external APIs, and automate cloud pipelines.",
      recommendations: [
        "Create API suite checks with Supertest or Jest.",
        "Configure automated pipelines using GitHub Actions.",
        "Manage application credentials securely using environment key vaults."
      ],
      actionLabel: "Review DevOps Tools",
      actionUrl: "/interview",
      details: "Automated pipelines block broken updates from entering staging. Testing gives confidence for rapid production deployments.",
      icon: Workflow
    },
    {
      title: "Backend Technical Interview Mock",
      description: "Simulate a live backend screening round on algorithms, database structure, and scale.",
      recommendations: [
        "Explain load balancing and DB replication schemas.",
        "Resolve algorithmic puzzles within server runtime bounds.",
        "Design scalable system interfaces on the fly."
      ],
      actionLabel: "Launch Backend Mock",
      actionUrl: "/interview-simulator",
      details: "The final simulator. Test your ability to design robust backend architectures and code endpoints under inspection.",
      icon: Award
    }
  ],
  fullstack: [
    {
      title: "Full-Stack Layouts & Clients",
      description: "Design responsive front-end pages utilizing Tailwind CSS and components.",
      recommendations: [
        "Organize client-side layouts using component blocks.",
        "Implement semantic tagging for accessible screen reading.",
        "Analyze keywords like Full-Stack, Next.js, and DB on your CV."
      ],
      actionLabel: "Review Resume Keywords",
      actionUrl: "/resume-analyzer",
      details: "Fullstack engineering begins at the interface. Master layout design systems before binding server actions.",
      icon: Globe
    },
    {
      title: "Server Actions & API Bindings",
      description: "Create server actions, database triggers, and client-server request routes.",
      recommendations: [
        "Connect client submission forms directly to server API handlers.",
        "Manage server-side validation and parsing parameters.",
        "Review CORS policies and dynamic routing rules."
      ],
      actionLabel: "Start Full-Stack Code",
      actionUrl: "/interview",
      details: "Linking UI pages to API scripts is crucial. Next.js handles this via unified directories or API endpoints.",
      icon: Terminal
    },
    {
      title: "Database Models & Relations",
      description: "Define object schemas using Mongoose/Prisma and connect databases.",
      recommendations: [
        "Design schemas to host relational data collections.",
        "Optimize Mongoose indexing or query lookups.",
        "Practice database migrations and seed scripts."
      ],
      actionLabel: "Practice Data Modeling",
      actionUrl: "/interview",
      details: "A unified database model holds frontend inputs and serves clean records to backend routes efficiently.",
      icon: Database
    },
    {
      title: "Unified App Routing & Session Auth",
      description: "Implement unified session verification using NextAuth or JWT keys.",
      recommendations: [
        "Secure pages and components by checking session tokens.",
        "Manage middleware routing redirections for logged-in accounts.",
        "Handle social login callbacks (Google/GitHub integrations)."
      ],
      actionLabel: "Test Session Flow",
      actionUrl: "/interview-simulator",
      details: "Access control ensures users can view only their own records. Implement clean, secure session management.",
      icon: Play
    },
    {
      title: "Docker Container Deployments",
      description: "Deploy apps in containers to Vercel, AWS servers, or Docker hubs.",
      recommendations: [
        "Build clean Dockerfiles, minimizing layer caches.",
        "Deploy frontend scripts to serverless hosting platforms.",
        "Audit site security and SSL certificate setups."
      ],
      actionLabel: "Explore Deployment",
      actionUrl: "/interview",
      details: "Shipping full-stack apps requires packaging dependencies. Containers compile identically everywhere.",
      icon: Workflow
    },
    {
      title: "Full-Stack Mock Interview Simulator",
      description: "Test your full-stack capabilities across server architecture, coding, and UX.",
      recommendations: [
        "Explain end-to-end data lifecycle from input to DB save.",
        "Code full-stack functions resolving real bugs in mock tests.",
        "Evaluate database index benefits in live scenarios."
      ],
      actionLabel: "Launch Fullstack Mock",
      actionUrl: "/interview-simulator",
      details: "This mock round reviews both database operations and frontend component architecture in a unified session.",
      icon: Award
    }
  ],
  dsa: [
    {
      title: "Big O Analysis & Linear Storage",
      description: "Analyze code space and time complexity, arrays, strings, and hash tables.",
      recommendations: [
        "Calculate worst-case, best-case, and average-case runtimes.",
        "Practice two-pointer and sliding-window array techniques.",
        "Master hash table lookups for constant-time complexity."
      ],
      actionLabel: "Verify CV Algorithm Terms",
      actionUrl: "/resume-analyzer",
      details: "Optimal complexity keeps algorithms fast. Ensure your resume mentions Big O, algorithms, and complexity.",
      icon: Cpu
    },
    {
      title: "Stacks, Queues & Linked Lists",
      description: "Master list structures, pointer alterations, stack lifos, and queue operations.",
      recommendations: [
        "Reverse linked lists and resolve loops using slow-fast pointers.",
        "Utilize stacks for brackets parsing and recursion mocks.",
        "Build ring buffers and deque structures."
      ],
      actionLabel: "Practice Linked Lists",
      actionUrl: "/interview",
      details: "Linear memory layouts are vital. Managing references and pointers directly tests debugging capability.",
      icon: Code
    },
    {
      title: "Recursion & Binary Search Trees",
      description: "Understand recursion trees, tree heights, and binary search operations.",
      recommendations: [
        "Write correct base cases for recursive calls to prevent overflows.",
        "Practice tree traversals (pre-order, in-order, post-order).",
        "Perform depth-first (DFS) and breadth-first (BFS) searches."
      ],
      actionLabel: "Simulate Binary Trees",
      actionUrl: "/interview-simulator",
      details: "Trees organize nested data. Binary Search Trees enable O(log N) searches when balanced properly.",
      icon: Play
    },
    {
      title: "Graph Algorithms & BFS/DFS",
      description: "Represent graphs using lists/matrices, traverse nodes, and check cycles.",
      recommendations: [
        "Practice cycle detection in directed and undirected graphs.",
        "Implement Dijkstra's shortest path algorithm.",
        "Evaluate topological sorting in dependency graphs."
      ],
      actionLabel: "Practice Graph Coding",
      actionUrl: "/interview",
      details: "Graphs represent connections like networks or roads. Algorithms resolve routing challenges.",
      icon: Layers
    },
    {
      title: "Dynamic Programming & Backtracking",
      description: "Identify subproblems, build memoization tables, and check combinations.",
      recommendations: [
        "Recognize overlapping subproblems and optimal substructures.",
        "Master the transition from top-down memoization to bottom-up tabular.",
        "Solve backtracking puzzles like Sudoku and N-Queens."
      ],
      actionLabel: "Practice Hard DSA",
      actionUrl: "/interview",
      details: "Dynamic programming replaces exponential recursive paths with linear or quadratic lookups.",
      icon: Activity
    },
    {
      title: "DSA Mock Coding Assessment",
      description: "Simulate a live, timed technical interview round on algorithms and complexity.",
      recommendations: [
        "Discuss multiple code implementations with trade-offs.",
        "Solve Leetcode Medium-Hard problems in under 35 minutes.",
        "Dry run your algorithm using simple test cases first."
      ],
      actionLabel: "Launch DSA Mock",
      actionUrl: "/interview-simulator",
      details: "The ultimate algorithm test. Solve complex data challenges under AI observation and dry-run code blocks.",
      icon: Award
    }
  ],
  "data-analyst": [
    {
      title: "Data Manipulation in Excel",
      description: "Learn advanced spreadsheet formulas, data cleaning, and pivot calculations.",
      recommendations: [
        "Clean null fields and normalize text columns.",
        "Master conditional formatting and index-match functions.",
        "Construct pivot charts explaining key metrics."
      ],
      actionLabel: "Scan Data Analyst CV",
      actionUrl: "/resume-analyzer",
      details: "Spreadsheets remain highly popular for business reviews. Structuring sheets is the first step.",
      icon: Sliders
    },
    {
      title: "SQL Querying & Data Aggregation",
      description: "Write queries to filter, aggregate, group, and join business records.",
      recommendations: [
        "Practice inner, left, right, and outer SQL joins.",
        "Utilize window functions (ROW_NUMBER, RANK, LEAD, LAG).",
        "Construct Common Table Expressions (CTEs) for readable scripts."
      ],
      actionLabel: "Start SQL Prep",
      actionUrl: "/interview",
      details: "Data analysts fetch raw transaction logs from tables daily. Aggregation converts logs into charts.",
      icon: Database
    },
    {
      title: "Python Data Analysis (Pandas)",
      description: "Use Pandas and NumPy libraries to clean datasets and run computations.",
      recommendations: [
        "Read CSV, JSON, and database sources into Pandas DataFrames.",
        "Handle missing data using fill or drop operations.",
        "Group records and calculate rolling statistics."
      ],
      actionLabel: "Simulate Pandas Scripting",
      actionUrl: "/interview-simulator",
      details: "Python outperforms Excel when handling large datasets. Pandas makes data operations fast and reproducible.",
      icon: Terminal
    },
    {
      title: "BI Dashboards & Visualization",
      description: "Build interactive visual reports in Tableau, PowerBI, or Matplotlib.",
      recommendations: [
        "Select correct chart types (bar charts, heatmaps, scatter plots).",
        "Design visual grids displaying clear, high-level business goals.",
        "Practice dashboard publishing and security settings."
      ],
      actionLabel: "Practice Visualization",
      actionUrl: "/interview",
      details: "Visual reports communicate insights to executives. Choose clean, readable designs over cluttered charts.",
      icon: Activity
    },
    {
      title: "Statistics & A/B Testing Models",
      description: "Evaluate data distribution patterns, averages, variances, and hypotheses.",
      recommendations: [
        "Understand normal distributions, p-values, and statistical power.",
        "Design A/B testing protocols checking metrics changes.",
        "Examine correlation coefficients vs direct causation patterns."
      ],
      actionLabel: "Review A/B Testing",
      actionUrl: "/interview",
      details: "Statistics prevents analysts from making conclusions based on random chance. Ensure findings are mathematically sound.",
      icon: Compass
    },
    {
      title: "Data Case Study Mock Interview",
      description: "Demonstrate data synthesis, cohort analysis, and presentation skills to a panel.",
      recommendations: [
        "Structure business findings into structured summaries.",
        "Explain metrics movements using user activity steps.",
        "Resolve sql parsing problems during mock challenges."
      ],
      actionLabel: "Launch Case Interview",
      actionUrl: "/interview-simulator",
      details: "Case rounds evaluate if you can translate raw datasets into business strategy. The AI judges your reasoning.",
      icon: Award
    }
  ],
  "data-scientist": [
    {
      title: "Probability & Mathematical ML",
      description: "Master linear algebra vectors, calculus optimization, and probability.",
      recommendations: [
        "Calculate dot products, matrix eigenvalues, and gradients.",
        "Understand Bayes' Theorem and statistical distributions.",
        "Examine optimization algorithms like Gradient Descent."
      ],
      actionLabel: "Audit ML Resume",
      actionUrl: "/resume-analyzer",
      details: "Machine learning relies on mathematical formulas. Resume checks ensure your skills list highlights ML math.",
      icon: Terminal
    },
    {
      title: "Machine Learning Classifiers",
      description: "Train regressions, Decision Trees, SVMs, and Clustering algorithms.",
      recommendations: [
        "Split datasets into train, test, and validation sets.",
        "Handle overfitting using regularization methods (L1/L2).",
        "Evaluate models using Precision, Recall, and F1 scores."
      ],
      actionLabel: "Start ML Training",
      actionUrl: "/interview",
      details: "Supervised classifiers resolve business decisions. Knowing which model fits a dataset is critical.",
      icon: Code
    },
    {
      title: "Deep Learning & NLP Engines",
      description: "Build neural network layers using PyTorch or TensorFlow frameworks.",
      recommendations: [
        "Configure forward and backward propagation loops.",
        "Understand tokens, embeddings, and self-attention layers.",
        "Fine-tune pre-trained models on specialized text datasets."
      ],
      actionLabel: "Simulate Deep Learning",
      actionUrl: "/interview-simulator",
      details: "Neural networks process complex unstructured data like images and text. Transformers are key to modern AI.",
      icon: Play
    },
    {
      title: "LLM APIs & Prompt Systems",
      description: "Implement LangChain apps, vector databases, and prompt systems.",
      recommendations: [
        "Build Retrieval-Augmented Generation (RAG) system pipelines.",
        "Store data embeddings in Pinecone or Chroma vector databases.",
        "Write system prompts that prevent output hallucinations."
      ],
      actionLabel: "Test LLM Integration",
      actionUrl: "/interview",
      details: "Integrating Large Language Models into products requires vector retrievers to supply relevant context.",
      icon: Layers
    },
    {
      title: "MLOps Pipelines & Airflow Orchestration",
      description: "Deploy machine learning models, manage models, and monitor predictions.",
      recommendations: [
        "Package models into Docker containers behind API gateways.",
        "Orchestrate training schedules with Apache Airflow.",
        "Track model prediction drift and trigger automated re-training."
      ],
      actionLabel: "Explore MLOps",
      actionUrl: "/interview",
      details: "ML models are useful only when deployed to production. MLOps automates the pipeline from data collection to active prediction.",
      icon: Workflow
    },
    {
      title: "AI System Design Mock Interview",
      description: "Design a complete AI system at scale, reviewing data collections and model selection.",
      recommendations: [
        "Architect a recommendations engine system at scale.",
        "Discuss model throughput, caching vectors, and latency limits.",
        "Resolve code issues during system design simulations."
      ],
      actionLabel: "Launch AI System Mock",
      actionUrl: "/interview-simulator",
      details: "Design rounds focus on scalability, offline training, and serving predictions fast. The AI evaluates your system architecture.",
      icon: Award
    }
  ],
  devops: [
    {
      title: "Linux Administration & Bash Scripts",
      description: "Configure system permissions, handle logs, and write automated bash scripts.",
      recommendations: [
        "Master file permissions (chmod/chown) and package managers.",
        "Write bash scripts containing functions, inputs, and error handles.",
        "Analyze background processes, CPU loads, and port routing."
      ],
      actionLabel: "Scan DevOps CV",
      actionUrl: "/resume-analyzer",
      details: "DevOps engineers live in the CLI. Linux knowledge is the baseline requirement. Verify DevOps keywords on your CV.",
      icon: Terminal
    },
    {
      title: "Docker Container Configurations",
      description: "Build efficient Docker images, configure volumes, and setup local networks.",
      recommendations: [
        "Write clean, multi-stage Dockerfiles to minimize final image sizes.",
        "Mount external volumes to containers to persist application logs.",
        "Connect multiple services using Docker Compose."
      ],
      actionLabel: "Containerize Services",
      actionUrl: "/interview",
      details: "Containers isolate application environments, ensuring the app runs identically across development and cloud servers.",
      icon: Layers
    },
    {
      title: "Kubernetes Pod Orchestration",
      description: "Manage pods, deployments, services, and ingress configurations in Kubernetes.",
      recommendations: [
        "Write YAML configurations for deployments and replica-sets.",
        "Expose container ports to external traffic using Services and Ingress.",
        "Manage application credentials securely using Kubernetes Secrets."
      ],
      actionLabel: "Simulate Kubernetes Clusters",
      actionUrl: "/interview-simulator",
      details: "Kubernetes orchestrates container distributions, automating self-healing, rolling updates, and scaling.",
      icon: Play
    },
    {
      title: "Infrastructure as Code (Terraform)",
      description: "Provision cloud infrastructure on AWS/GCP using Terraform configurations.",
      recommendations: [
        "Write declarative configurations mapping VPCs, databases, and servers.",
        "Manage state files securely using remote S3 block locks.",
        "Deploy modular configurations that are reusable across environments."
      ],
      actionLabel: "Provision Mock Cloud",
      actionUrl: "/interview",
      details: "IaC eliminates manual console setup. Code version control tracks exactly what servers are live.",
      icon: Workflow
    },
    {
      title: "CI/CD & Monitoring Dashboards",
      description: "Automate build checks in GitHub Actions and monitor stats via Grafana.",
      recommendations: [
        "Build automated deployment flows checking code on git push.",
        "Collect server runtime metrics using Prometheus agents.",
        "Design visual alerts in Grafana tracking server memory and errors."
      ],
      actionLabel: "Test CI/CD Pipeline",
      actionUrl: "/interview",
      details: "Continuous integration ensures code quality before delivery. Monitoring alerts you to production issues before users complain.",
      icon: Activity
    },
    {
      title: "Cloud Infrastructure Mock Interview",
      description: "Design and present a secure, scalable cloud network topology to an expert interviewer.",
      recommendations: [
        "Explain high-availability, multi-region disaster recovery setups.",
        "Resolve server failover and scaling bugs in mock logs.",
        "Present cost optimization strategies for cloud resources."
      ],
      actionLabel: "Launch DevOps Mock",
      actionUrl: "/interview-simulator",
      details: "The final step. Present an automated infrastructure design that balances cost, speed, and security under AI evaluation.",
      icon: Award
    }
  ],
  mobile: [
    {
      title: "Mobile App Framework Basics",
      description: "Master React Native JS or Flutter Dart basics and app component flows.",
      recommendations: [
        "Understand the mobile thread model and app rendering engine.",
        "Organize mobile pages utilizing custom navigator routes.",
        "Audit mobile keywords (React Native, Flutter, APK) on your CV."
      ],
      actionLabel: "Scan Mobile Developer CV",
      actionUrl: "/resume-analyzer",
      details: "Mobile apps must be lightweight and quick to render. Master framework foundations before binding device sensors.",
      icon: Smartphone
    },
    {
      title: "Native UI & Gestures",
      description: "Design smooth, touch-sensitive mobile screens with high-performance animations.",
      recommendations: [
        "Handle list rendering using memory-saving infinite scroll loaders.",
        "Build custom swipe and drag animations using native drivers.",
        "Provide consistent designs across iOS and Android screen resolutions."
      ],
      actionLabel: "Design Screen Layout",
      actionUrl: "/interview",
      details: "Mobile users expect smooth animations. Sluggish scroll layouts can lead to quick app uninstalls.",
      icon: Globe
    },
    {
      title: "Global State & Local Storage",
      description: "Manage offline data storage, caching systems, and state sync.",
      recommendations: [
        "Persist session tokens and user settings in secure device storage.",
        "Sync local offline data logs with remote DB servers on connection reconnect.",
        "Manage global state changes without over-rendering parent nodes."
      ],
      actionLabel: "Simulate Session Sync",
      actionUrl: "/interview-simulator",
      details: "Mobile devices often experience connection drops. Caching data locally ensures the app remains usable offline.",
      icon: Play
    },
    {
      title: "Native Hardware APIs",
      description: "Access phone sensors, GPS location coordinates, camera inputs, and push services.",
      recommendations: [
        "Request user permissions gracefully following platform guidelines.",
        "Connect app scripts to background GPS tracking triggers.",
        "Configure push notification payloads and certificate keys."
      ],
      actionLabel: "Test Device API",
      actionUrl: "/interview",
      details: "Hardware triggers enhance app functionality. Managing async callbacks and device permissions is a core mobile skill.",
      icon: Database
    },
    {
      title: "App Publishing & Fastlane CI",
      description: "Deploy apps to Google Play Console and iOS App Store via Fastlane.",
      recommendations: [
        "Generate signing certificates, keystores, and provisioning profiles.",
        "Automate app screenshots and build uploads using Fastlane scripts.",
        "Configure beta test pools in TestFlight and Google Play Console."
      ],
      actionLabel: "Prepare App Build",
      actionUrl: "/interview",
      details: "App store submission requires managing certificates, assets, and metadata. Automating this process saves hours of manual work.",
      icon: Workflow
    },
    {
      title: "Mobile Technical Mock Interview",
      description: "Simulate a live mobile developer screening on app lifecycles, memory, and performance.",
      recommendations: [
        "Explain native rendering differences and thread models.",
        "Resolve memory leaks and image rendering bugs in mock code.",
        "Discuss mobile offline database sync schemas."
      ],
      actionLabel: "Launch Mobile Mock",
      actionUrl: "/interview-simulator",
      details: "The final simulator. Code responsive screen functions and answer core mobile lifecycle questions under inspection.",
      icon: Award
    }
  ],
  cybersecurity: [
    {
      title: "Network Protocols & Packet Captures",
      description: "Analyze network traffic packets, ports, and protocols via Wireshark.",
      recommendations: [
        "Master the TCP/IP and OSI model layers.",
        "Filter packet capture dumps for cleartext passwords and anomalies.",
        "Understand DNS query loops, routing paths, and firewall rules."
      ],
      actionLabel: "Scan Security CV",
      actionUrl: "/resume-analyzer",
      details: "Security begins on the wire. Master packet sniffing and protocol anomalies. Verify security keywords on your resume.",
      icon: Shield
    },
    {
      title: "OS Hardening & Access Control (IAM)",
      description: "Configure Linux server security settings, IAM roles, and key policies.",
      recommendations: [
        "Implement Least Privilege access policies across users.",
        "Audit SSH setups, disable passwords, and require key authentications.",
        "Manage file systems encryption and secure audit log paths."
      ],
      actionLabel: "Secure Mock System",
      actionUrl: "/interview",
      details: "Unused ports and overly broad permissions are main entry points for attacks. Restrict access paths.",
      icon: Terminal
    },
    {
      title: "Penetration Testing & OWASP Top 10",
      description: "Identify and exploit web vulnerabilities like XSS, SQLi, and CSRF.",
      recommendations: [
        "Scan endpoints for input sanitization bypass bugs.",
        "Understand how parameterized queries prevent SQL injections.",
        "Examine cookie attributes (HttpOnly, Secure) protecting session tokens."
      ],
      actionLabel: "Simulate Pen-Test Check",
      actionUrl: "/interview-simulator",
      details: "Penetration testing evaluates system vulnerabilities from an attacker's perspective. Resolving OWASP bugs is critical.",
      icon: Play
    },
    {
      title: "SIEM & Log File Auditing",
      description: "Set up security monitoring dashboards using Splunk, ELK, or Wazuh.",
      recommendations: [
        "Correlate event logs across web servers, databases, and firewall routers.",
        "Write custom SIEM rules to alert on repeated login failures.",
        "Perform log investigations to trace the origin of simulated attacks."
      ],
      actionLabel: "Analyze System Logs",
      actionUrl: "/interview",
      details: "Monitoring detects active intrusions. Finding anomalous access attempts early limits potential data breach damage.",
      icon: Activity
    },
    {
      title: "Cryptography & Compliance Rules",
      description: "Implement SSL, data-at-rest encryption, and audit systems for SOC2/GDPR.",
      recommendations: [
        "Configure secure SSL/TLS ciphers and database cell encryptions.",
        "Audit network databases against GDPR privacy guidelines.",
        "Write corporate security documentation detailing incident paths."
      ],
      actionLabel: "Review Security Policies",
      actionUrl: "/interview",
      details: "Encryption protects data from physical theft. Compliance frameworks verify security practices for external stakeholders.",
      icon: Compass
    },
    {
      title: "Incident Response Mock Interview",
      description: "Simulate a live security incident review, detailing how to isolate and resolve a breach.",
      recommendations: [
        "Describe immediate steps to isolate compromised database nodes.",
        "Analyze malware traces and identify attack vectors in mock logs.",
        "Explain access policies clearly under pressure."
      ],
      actionLabel: "Launch Security Mock",
      actionUrl: "/interview-simulator",
      details: "This mock round reviews your theoretical security foundations, command line agility, and stress management during breaches.",
      icon: Award
    }
  ],
  "product-manager": [
    {
      title: "Product Strategy & Product Market Fit",
      description: "Analyze competitor feature maps, identify target customer personas, and define product value.",
      recommendations: [
        "Write clean customer personas mapping concrete frustrations.",
        "Identify feature voids in competitor products.",
        "Define target metrics for successful product launch."
      ],
      actionLabel: "Scan Product Manager CV",
      actionUrl: "/resume-analyzer",
      details: "Product managers align engineering with business goals. Validate PM, Agile, and roadmap keywords on your CV.",
      icon: Sliders
    },
    {
      title: "Agile Sprints & User Stories",
      description: "Write clear feature tickets, define acceptance criteria, and manage backlog grooming.",
      recommendations: [
        "Structure stories following: 'As a user, I want X so that Y'.",
        "Define clear, testable acceptance criteria checking edge conditions.",
        "Prioritize developer sprint queues during grooming meetings."
      ],
      actionLabel: "Write User Story",
      actionUrl: "/interview",
      details: "Clear requirements prevent engineering team confusion and speed up feature shipping.",
      icon: Workflow
    },
    {
      title: "Product Analytics & Funnel Metrics",
      description: "Set up tracking tags, analyze conversion funnels, and monitor user churn.",
      recommendations: [
        "Identify core North Star metrics for user engagement.",
        "Map user conversion funnels to find drop-off points.",
        "Analyze daily active users (DAU) and monthly active users (MAU) ratios."
      ],
      actionLabel: "Simulate Metric Review",
      actionUrl: "/interview-simulator",
      details: "Product decisions must be backed by user data, not just intuition. Funnel charts show where users get stuck.",
      icon: Play
    },
    {
      title: "UX Wireframes & Customer Journeys",
      description: "Design high-level layout mockups in Figma and map user flows.",
      recommendations: [
        "Draw simple layout wireframes prioritizing feature visibility.",
        "Write user journey maps tracing clicks to checkout.",
        "Conduct user feedback interviews to identify navigation roadblocks."
      ],
      actionLabel: "Draft Product Flow",
      actionUrl: "/interview",
      details: "Visual mockups align design, engineering, and business teams on how features should function.",
      icon: Compass
    },
    {
      title: "Feature Prioritization Roadmaps",
      description: "Prioritize features using RICE (Reach, Impact, Confidence, Effort) scoring models.",
      recommendations: [
        "Calculate prioritization scores comparing different feature tickets.",
        "Define quarterly release targets (Minimum Viable Product vs v2).",
        "Explain prioritization trade-offs clearly to design leads."
      ],
      actionLabel: "Plan Product Roadmap",
      actionUrl: "/interview",
      details: "Roadmaps ensure resources are focused on high-impact items first, preventing feature bloat.",
      icon: Layers
    },
    {
      title: "Product PM Case Study Mock Interview",
      description: "Present product vision, solve estimation challenges, and describe product strategies.",
      recommendations: [
        "Structure your answers using frameworks like CIRCLES.",
        "Estimate market sizes or user volumes using simple math.",
        "Explain priority pivots constructively when questioned by the AI."
      ],
      actionLabel: "Launch PM Case Mock",
      actionUrl: "/interview-simulator",
      details: "The ultimate PM evaluation. Respond to mock estimation, design, and analytics cases under AI assessment.",
      icon: Award
    }
  ],
  qa: [
    {
      title: "Software QA Foundations",
      description: "Write structured test cases, report bug traces, and understand testing cycles.",
      recommendations: [
        "Write reproducible steps to repeat bug triggers.",
        "Distinguish between severe blocking bugs and styling issues.",
        "Review test coverage mapping documentation."
      ],
      actionLabel: "Scan QA Specialist CV",
      actionUrl: "/resume-analyzer",
      details: "Quality assurance prevents bugs from reaching production. Clear defect reports accelerate developer fixes.",
      icon: CheckCircle2
    },
    {
      title: "Automation Scripting Basics",
      description: "Write automated tests in Python/JS checking browser elements.",
      recommendations: [
        "Select DOM selectors reliably using ID and data attributes.",
        "Write automation test scripts handling browser cookies.",
        "Implement page object design patterns in test suites."
      ],
      actionLabel: "Write Test Script",
      actionUrl: "/interview",
      details: "Automated browser tests eliminate repetitive manual verification of basic features.",
      icon: Code
    },
    {
      title: "API Endpoint Validations",
      description: "Verify backend routes using Postman, checking JSON data values and status codes.",
      recommendations: [
        "Assert API response values match database records.",
        "Validate JSON schemas and API performance under load.",
        "Test edge case inputs like empty fields and invalid tokens."
      ],
      actionLabel: "Simulate API Test",
      actionUrl: "/interview-simulator",
      details: "API tests verify backend reliability independently of the frontend, ensuring data integrity.",
      icon: Play
    },
    {
      title: "E2E Testing (Cypress / Playwright)",
      description: "Write end-to-end user checks in Cypress or Playwright frameworks.",
      recommendations: [
        "Simulate full user flows from registration to checkout.",
        "Run cross-browser tests checking safari, chrome, and firefox rendering.",
        "Handle dynamic API load times with robust wait assertions."
      ],
      actionLabel: "Run E2E Suite",
      actionUrl: "/interview",
      details: "E2E suites run tests against a deployed app, catching regressions across front-and-backend interactions.",
      icon: Database
    },
    {
      title: "Continuous Testing in CI/CD",
      description: "Integrate test suites into GitHub Actions, triggering tests on new pull requests.",
      recommendations: [
        "Trigger test suites automatically on code push.",
        "Generate HTML reports showing failed test step screenshots.",
        "Block deployments if any integration tests fail."
      ],
      actionLabel: "Explore CI Testing",
      actionUrl: "/interview",
      details: "Continuous testing prevents buggy features from passing code reviews. Jenkins and GitHub Actions run these test suites.",
      icon: Workflow
    },
    {
      title: "QA Automation Architecture Mock",
      description: "Design a scalable testing framework and present it to an expert interviewer.",
      recommendations: [
        "Design testing frameworks from scratch explaining design patterns.",
        "Solve test synchronization and database state cleanup bugs.",
        "Explain assertions strategy for web apps clearly."
      ],
      actionLabel: "Launch QA Mock",
      actionUrl: "/interview-simulator",
      details: "The final simulator. Test your ability to design robust QA architectures and write automation scripts under review.",
      icon: Award
    }
  ]
};

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("frontend");
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (status !== "authenticated" || !session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/interview/history?email=${encodeURIComponent(session.user.email)}`
        );
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to load history.");
        }
        setHistory(json.history || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, status]);

  // Construct roadmap nodes by combining Track Syllabus and User History Intelligence
  const getRoadmapNodes = (trackId: string): RoadmapNode[] => {
    const syllabus = TRACK_SYLLABI[trackId] || TRACK_SYLLABI.frontend;
    const hasInterviews = history.length > 0;
    const lastInterview = hasInterviews ? history[0] : null;

    // Compile weaknesses from history
    const weaknessesList = lastInterview ? [...lastInterview.weaknesses, ...lastInterview.improvements] : [];
    const weaknessesStr = weaknessesList.join(" ").toLowerCase();

    const avgScore = hasInterviews
      ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / history.length)
      : 0;

    return syllabus.map((milestone, idx) => {
      let status: "completed" | "active" | "locked" = "active";
      let subtitle = `Step ${idx + 1}`;
      let customRecs = [...milestone.recommendations];

      // Overlay status logic
      if (idx === 0) {
        status = hasInterviews ? "completed" : "active";
        if (hasInterviews) subtitle = "Completed";
      } else if (idx === 5) {
        // Final Assessment Mock node
        status = hasInterviews ? "completed" : "active";
        if (hasInterviews) {
          subtitle = `Highest Score: ${avgScore}%`;
        }
      } else {
        // Lock advanced design/architecture/scaling nodes unless baseline technical score is >= 75%
        const isAdvancedNode =
          milestone.title.toLowerCase().includes("design") ||
          milestone.title.toLowerCase().includes("scale") ||
          milestone.title.toLowerCase().includes("architect") ||
          milestone.title.toLowerCase().includes("orchestration");

        if (isAdvancedNode) {
          status = avgScore >= 75 ? "active" : "locked";
          subtitle = avgScore >= 75 ? "Active Target" : "Locked Node";
        } else {
          status = "active";
        }
      }

      // HISTORY INTELLIGENCE INJECTION:
      // 1. Coding & DSA checks
      const isCodingNode =
        milestone.title.toLowerCase().includes("code") ||
        milestone.title.toLowerCase().includes("algorithm") ||
        milestone.title.toLowerCase().includes("structure") ||
        milestone.title.toLowerCase().includes("javascript") ||
        milestone.title.toLowerCase().includes("script") ||
        milestone.title.toLowerCase().includes("programming");

      if (isCodingNode && hasInterviews) {
        const hasDSAWeakness =
          weaknessesStr.includes("complexity") ||
          weaknessesStr.includes("array") ||
          weaknessesStr.includes("recursion") ||
          weaknessesStr.includes("sorting") ||
          weaknessesStr.includes("hashmap") ||
          weaknessesStr.includes("tree") ||
          weaknessesStr.includes("graph") ||
          weaknessesStr.includes("optimization") ||
          weaknessesStr.includes("loop");

        if (hasDSAWeakness) {
          subtitle = "AI Alert: Optimization Gaps";
          const codeWeaknesses = weaknessesList.filter((w) => {
            const low = w.toLowerCase();
            return (
              low.includes("complexity") ||
              low.includes("array") ||
              low.includes("recursion") ||
              low.includes("sort") ||
              low.includes("hash") ||
              low.includes("tree") ||
              low.includes("graph") ||
              low.includes("loop") ||
              low.includes("optimi")
            );
          });
          if (codeWeaknesses.length > 0) {
            customRecs = [
              `⚠️ AI Alert: Practice focus - "${codeWeaknesses[0]}"`,
              ...customRecs
            ];
          }
        }
      }

      // 2. Database checks
      const isDbNode =
        milestone.title.toLowerCase().includes("db") ||
        milestone.title.toLowerCase().includes("database") ||
        milestone.title.toLowerCase().includes("sql") ||
        milestone.title.toLowerCase().includes("query") ||
        milestone.title.toLowerCase().includes("mongoose") ||
        milestone.title.toLowerCase().includes("schema");

      if (isDbNode && hasInterviews) {
        const hasDbWeakness =
          weaknessesStr.includes("database") ||
          weaknessesStr.includes("sql") ||
          weaknessesStr.includes("query") ||
          weaknessesStr.includes("schema") ||
          weaknessesStr.includes("mongoose");

        if (hasDbWeakness) {
          subtitle = "AI Alert: Database Queries";
          customRecs = [
            "⚠️ AI Alert: Focus on database query design, joins, and indexing structures.",
            ...customRecs
          ];
        }
      }

      // 3. Communication/Behavioral checks
      const isBehavioralNode =
        milestone.title.toLowerCase().includes("behavioral") ||
        milestone.title.toLowerCase().includes("soft") ||
        milestone.title.toLowerCase().includes("mastery") ||
        milestone.title.toLowerCase().includes("communication") ||
        milestone.title.toLowerCase().includes("story");

      if (isBehavioralNode && hasInterviews) {
        const hasCommWeakness =
          weaknessesStr.includes("communication") ||
          weaknessesStr.includes("articulation") ||
          weaknessesStr.includes("pace") ||
          weaknessesStr.includes("confidence") ||
          weaknessesStr.includes("filler") ||
          weaknessesStr.includes("star");

        if (hasCommWeakness) {
          subtitle = "AI Alert: Communication Gaps";
          customRecs = [
            "⚠️ AI Alert: Practice answering with STAR format. Watch your speech speed and filler words.",
            ...customRecs
          ];
        }
      }

      return {
        id: `${trackId}_node_${idx + 1}`,
        title: milestone.title,
        subtitle,
        description: milestone.description,
        status,
        icon: milestone.icon,
        recommendations: customRecs,
        actionLabel: milestone.actionLabel,
        actionUrl: milestone.actionUrl,
        details: milestone.details
      };
    });
  };

  const activeNodes = getRoadmapNodes(selectedTrackId);

  // Sync selected node when activeNodes or track changes
  useEffect(() => {
    if (activeNodes.length > 0) {
      setSelectedNode(activeNodes[0]);
    }
  }, [selectedTrackId, history]);

  const selectedTrackInfo = TRACKS.find((t) => t.id === selectedTrackId) || TRACKS[0];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Decorative background glow */}
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-900/50 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles size={14} className="animate-pulse" />
            <span>Interactive Skill Trees</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 animate-fade-in">
            AI-Driven <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Career Roadmap</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Choose your career path. SkillSync overlays your mock interview reports to dynamically highlight your weaknesses, lock advanced nodes, and recommend custom learning tasks.
          </p>
        </div>

        {/* Status Notification for Preview Mode */}
        {status !== "authenticated" && (
          <div className="max-w-3xl mx-auto bg-blue-950/20 border border-blue-900/30 rounded-2xl p-5 mb-10 flex items-start gap-4">
            <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <span className="font-bold text-white block mb-1">Preview Mode</span>
              <span className="text-zinc-400">
                You are viewing the baseline roadmaps.{" "}
                <Link href="/Login" className="text-blue-400 underline hover:text-blue-300 font-semibold">
                  Log in
                </Link>{" "}
                to inject your real mock interview metrics and automatically tailor these timelines.
              </span>
            </div>
          </div>
        )}

        {/* Career Track Selector (Dropdown for mobile, Grid Cards for desktop) */}
        <div className="mb-12 relative z-10">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">
            Select Your Target Career Track
          </h3>

          {/* Desktop Grid Selector */}
          <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {TRACKS.map((track) => {
              const TrackIcon = track.icon;
              const isSelected = track.id === selectedTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between h-32 hover:-translate-y-0.5 active:scale-98 ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/5"
                      : "bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900/70 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                      <TrackIcon size={18} />
                    </div>
                    <span className="font-bold text-sm leading-tight text-zinc-100">{track.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                    {track.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile Scrollable Dropdown */}
          <div className="md:hidden max-w-sm mx-auto px-4">
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 px-4 outline-none focus:border-blue-500"
            >
              {TRACKS.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Track Status Bar */}
        <div className="max-w-6xl mx-auto mb-10 p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400">
              <selectedTrackInfo.icon size={22} />
            </div>
            <div>
              <h3 className="font-black text-lg">{selectedTrackInfo.name}</h3>
              <p className="text-xs text-zinc-400">{selectedTrackInfo.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-850">
            <Activity size={12} className="text-blue-500" />
            <span>6 Milestone Nodes</span>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Left Column - Vertical Timeline */}
          <div className="lg:col-span-7 space-y-6 relative">
            {/* Timeline connectors */}
            <div className="absolute left-[39px] top-6 bottom-6 w-0.5 border-l border-dashed border-zinc-800" />

            {activeNodes.map((node, index) => {
              const NodeIcon = node.icon;
              const isSelected = selectedNode?.id === node.id;
              const isCompleted = node.status === "completed";
              const isActive = node.status === "active";
              const isLocked = node.status === "locked";

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex items-start gap-6 p-5 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-zinc-900 border-blue-500 shadow-lg shadow-blue-500/5"
                      : "bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900/80 hover:border-zinc-800"
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Status Indicator circle */}
                  <div className="relative z-10 flex items-center justify-center mt-1 shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md">
                        <CheckCircle2 size={20} />
                      </div>
                    ) : isActive ? (
                      <div className="w-10 h-10 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center text-blue-400 relative">
                        <div className="absolute inset-0 rounded-full border border-blue-500 animate-ping opacity-35" />
                        <NodeIcon size={18} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                        <Lock size={16} />
                      </div>
                    )}
                  </div>

                  {/* Title & info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-base md:text-lg font-bold truncate ${isLocked ? "text-zinc-500" : "text-white"}`}>
                        {node.title}
                      </h3>
                      <span
                        className={`text-2xs md:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                          isCompleted
                            ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-400"
                            : isActive
                            ? "bg-blue-950/40 border-blue-900/50 text-blue-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {node.subtitle}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs md:text-sm mt-1.5 line-clamp-2">
                      {node.description}
                    </p>
                  </div>

                  <div className="shrink-0 self-center">
                    <ChevronRight
                      size={18}
                      className={`transition-transform ${isSelected ? "text-blue-400 translate-x-1" : "text-zinc-600"}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column - Workbook Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {selectedNode && (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      selectedNode.status === "completed"
                        ? "bg-emerald-500"
                        : selectedNode.status === "active"
                        ? "bg-blue-500"
                        : "bg-zinc-700"
                    }`}
                  />

                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        selectedNode.status === "completed"
                          ? "bg-emerald-950 text-emerald-400"
                          : selectedNode.status === "active"
                          ? "bg-blue-950 text-blue-400"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {selectedNode.status === "locked" ? (
                        <Lock size={20} />
                      ) : (
                        <selectedNode.icon size={20} />
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">
                        Milestone Detail
                      </span>
                      <h4 className="text-lg md:text-xl font-black">{selectedNode.title}</h4>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                    {selectedNode.details}
                  </p>

                  <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800/40 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={16} className="text-blue-400" />
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                        AI Recommended Checklist
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {selectedNode.recommendations.map((rec, i) => {
                        const isWarning = rec.startsWith("⚠️");
                        return (
                          <li key={i} className="flex items-start gap-2 text-xs md:text-sm leading-relaxed">
                            <span className={`${isWarning ? "text-amber-500" : "text-blue-500"} mt-1 shrink-0`}>•</span>
                            <span className={isWarning ? "text-amber-400 font-medium" : "text-zinc-400"}>
                              {rec}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {selectedNode.status !== "locked" ? (
                    <Link href={selectedNode.actionUrl}>
                      <Button variant="default" size="default" className="w-full py-6 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 group transition active:scale-95">
                        {selectedNode.actionLabel}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="default" size="default" className="w-full py-6 text-base font-bold bg-zinc-800 text-zinc-500 border border-zinc-700 rounded-xl flex items-center justify-center gap-2" disabled>
                      <Lock size={16} /> Locked Module
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
