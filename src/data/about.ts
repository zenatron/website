/** Content for /about, lifted out of the deleted React section components. */

/**
 * The experience timeline, newest first, as on LinkedIn. `title` is the
 * place, `role` what Phil did there; `links` sit under the description.
 */
export interface TimelineEntry {
  year: string;
  title: string;
  role?: string;
  description: string;
  kind: "work" | "founder" | "internship" | "education" | "milestone";
  links?: { label: string; href: string }[];
}

export const TIMELINE: TimelineEntry[] = [
  {
    year: "2026–Present",
    title: "RTX",
    role: "Software Engineer",
    description: "Software for internal and external customers.",
    kind: "work",
  },
  {
    year: "2020–Present",
    title: "Underscore Games",
    role: "Co-founder & developer",
    description:
      "Made Cubicle: The Improv Office Party in a Box. Took second in a startup pitch challenge for $11,000 in grants, and ran design, development and marketing, bringing cost-per-lead down 78%.",
    kind: "founder",
    links: [
      { label: "underscore.games", href: "https://underscore.games" },
      { label: "Cubicle, on the desk", href: "#setup" },
    ],
  },
  {
    year: "2025–2026",
    title: "Shortlist",
    role: "Software Engineer · remote",
    description: "SEO for client websites.",
    kind: "work",
  },
  {
    year: "2025",
    title: "CEM Corporation",
    role: "Software Engineer Intern",
    description:
      "A Rust TCP server that automates device testing across Windows, Linux and ARM, used by 30+ engineers. JSON test sequences that run 10× faster, and C++ Modbus control for stepper motors that cut manual calibration time by 95%.",
    kind: "internship",
  },
  {
    year: "2022–2025",
    title: "UNC Charlotte",
    description: "BS, Computer Science, 4.0 GPA",
    kind: "education",
  },
  {
    year: "2020–2022",
    title: "Izar Wellness Institute",
    role: "Technical Support Specialist · contract",
    description: "Hardware and software support for the clinic, and its equipment and security.",
    kind: "work",
  },
  {
    year: "2019",
    title: "Enventys Partners",
    role: "Computer Engineer Intern",
    description:
      "Object detection in Python and OpenCV at 99.98% accuracy, and PCB assembly and reflow for contracts over $400,000.",
    kind: "internship",
  },
  {
    year: "2019",
    title: "First lines of code",
    description: "Self-taught coding journey begins",
    kind: "milestone",
  },
];

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
  {
    name: "homelab",
    fields: [
      ["OS", "Unraid Pro"],
      ["Kernel", "x86_64 Linux"],
      ["CPU", "AMD Ryzen 5 7600X (6-core)"],
      ["GPU", "RTX 3060: transcoding, local AI"],
      ["Memory", "64GB DDR5"],
      ["Storage", "4x 12TB in ZFS, 36TB usable"],
      ["Parity", "1 drive"],
      ["DNS", "AdGuard Home"],
      ["Services", "Docker, all of them"],
      ["Uptime", "99.99%"],
    ],
  },
] as const;
