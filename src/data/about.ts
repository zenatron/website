/** Content for /about, lifted out of the deleted React section components. */

const currentYear = new Date().getFullYear();

export const TIMELINE = [
  {
    year: `${currentYear}`,
    title: "Embedded, AI & game development",
    description: "Building AI tools and indie games",
    kind: "work",
  },
  {
    year: "2023–Present",
    title: "Full-stack engineering",
    description: "Web apps, containers, and embedded",
    kind: "work",
  },
  {
    year: "2022–2025",
    title: "UNC Charlotte",
    description: "BS, Computer Science",
    kind: "education",
  },
  {
    year: "2019",
    title: "First lines of code",
    description: "Self-taught coding journey begins",
    kind: "milestone",
  },
] as const;

export const NOW = [
  {
    heading: "Building",
    items: [
      { name: "Performant FLAC library organizer", status: "in progress" },
      { name: "Tools for card games", status: "planning" },
      { name: "This portfolio (always)", status: "deployed" },
    ],
  },
  {
    heading: "Learning",
    items: [
      { name: "Embedded systems & RTOS", status: "exploring" },
      { name: "Game design patterns", status: "exploring" },
      { name: "Rust", status: "exploring" },
    ],
  },
  {
    heading: "Reading",
    items: [
      { name: "Designing Data-Intensive Applications", status: "reference" },
      { name: "Game Programming Patterns", status: "reference" },
    ],
  },
] as const;

/** The whole essay in four lines. Full version at /blog/principles. */
export const PRINCIPLES = [
  "Build smarter.",
  "Walk with purpose.",
  "Never stop learning.",
  "Be kind.",
];

export const MACHINES = [
  {
    name: "macbook",
    fields: [
      ["OS", "macOS 27"],
      ["Kernel", "arm64 (Apple Silicon)"],
      ["CPU", "Apple M5 Max (18-core)"],
      ["GPU", "Apple M5 Max (40-core)"],
      ["Memory", "48GB unified"],
      ["Storage", "2TB NVMe"],
      ["Display", '14.2" Liquid Retina XDR (120Hz)'],
      ["Shell", "zsh + oh-my-zsh"],
      ["PM", "brew"],
      ["Editor", "VS Code, nvim"],
      ["Emulator", "cmux"],
    ],
  },
  {
    name: "desktop",
    fields: [
      ["OS", "CachyOS (Arch btw)"],
      ["Kernel", "x86_64 Linux"],
      ["CPU", "AMD Ryzen 9 7950X (32-thread)"],
      ["GPU", "NVIDIA RTX 4070 Ti (12GB)"],
      ["Memory", "64GB DDR5"],
      ["Storage", "4TB NVMe"],
      ["Display", '2x 27" 2K QHD (144Hz)'],
      ["Shell", "zsh + oh-my-zsh"],
      ["PM", "paru"],
      ["Editor", "VS Code, nvim"],
      ["Emulator", "Konsole"],
    ],
  },
] as const;
