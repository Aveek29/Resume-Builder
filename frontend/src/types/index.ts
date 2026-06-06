export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface Education {
  degree: string;
  college: string;
  startYear: string;
  endYear: string;
  cgpa: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
}

export interface Skill {
  category: string;
  skills: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Resume {
  _id?: string;
  userId?: string;
  title: string;
  template: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const emptyResume: Resume = {
  title: 'Untitled Resume',
  template: 'tmpl_01',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  education: [{ degree: '', college: '', startYear: '', endYear: '', cgpa: '' }],
  experience: [],
  projects: [],
  skills: [
    { category: 'Programming', skills: [] },
    { category: 'Cloud', skills: [] },
    { category: 'DevOps', skills: [] },
    { category: 'Databases', skills: [] },
    { category: 'AI/ML', skills: [] },
    { category: 'Soft Skills', skills: [] },
  ],
  certifications: [],
  achievements: [],
};

export interface TemplateStyle {
  name: string;
  description: string;
  color: string;
}

export const templateStyles: Record<string, TemplateStyle> = {
  tmpl_01: { name: 'Executive', description: 'Deep navy with gold accents — authoritative and refined', color: '#1B2A4A' },
  tmpl_02: { name: 'Legacy Serif', description: 'Warm ivory background with bronze-toned serif elegance', color: '#2C2C2C' },
  tmpl_03: { name: 'Corporate Elite', description: 'Clean powerhouse with bright sky accent for impact', color: '#0A1929' },
  tmpl_04: { name: 'Indigo Professional', description: 'Slate paired with indigo — modern and credible', color: '#1E293B' },
  tmpl_05: { name: 'Naval Command', description: 'Dark navy with cobalt accents, commanding presence', color: '#0F2B46' },
  tmpl_06: { name: 'Burgundy Court', description: 'Rich burgundy with goldenrod — distinguished and bold', color: '#4A0E1B' },
  tmpl_07: { name: 'Airy Minimal', description: 'Maximum whitespace with whisper-gray accents', color: '#374151' },
  tmpl_08: { name: 'Heritage Brown', description: 'Warm brown tones with cream — traditional gravitas', color: '#3D2B1F' },
  tmpl_09: { name: 'Teal Command', description: 'Teal-blue depth with bright sky energy', color: '#0C4A6E' },
  tmpl_10: { name: 'Violet Card', description: 'Card-based sections with violet accents, modern depth', color: '#132337' },
  tmpl_11: { name: 'Sienna Serif', description: 'Sienna accents on warm paper for timeless appeal', color: '#2D2D2D' },
  tmpl_12: { name: 'Emerald Edge', description: 'Charcoal with emerald accents, sharp and decisive', color: '#111827' },
  tmpl_13: { name: 'Plum Royale', description: 'Deep plum with gold — creative yet commanding', color: '#3B0764' },
  tmpl_14: { name: 'Cobalt Precision', description: 'Cobalt blue with silver-gray — technical and crisp', color: '#1E3A5F' },
  tmpl_15: { name: 'Slate & Steel', description: 'Cool slate gray with steel-blue undertones', color: '#2D3748' },
  tmpl_16: { name: 'Forest Depth', description: 'Deep forest green with warm cream accents', color: '#1A2E1A' },
  tmpl_17: { name: 'Charcoal Edge', description: 'Bold charcoal with thin crimson accent lines', color: '#1F2937' },
  tmpl_18: { name: 'Sandstone', description: 'Earthy sandstone with warm terracotta notes', color: '#3D2B1F' },
  tmpl_19: { name: 'Twilight', description: 'Deep purple-blue gradient feel, elegant and modern', color: '#1E1B4B' },
  tmpl_20: { name: 'Obsidian', description: 'Near-black slate with minimal white text hierarchy', color: '#0F0F0F' },
  tmpl_21: { name: 'Oceanic', description: 'Deep teal and navy waves motif', color: '#0F2C3D' },
  tmpl_22: { name: 'Aurora', description: 'Dark base with subtle green-cyan aurora accents', color: '#0A1F1A' },
  tmpl_23: { name: 'Terracotta', description: 'Warm terracotta and clay tones', color: '#2C1810' },
  tmpl_24: { name: 'Stealth', description: 'Dark minimalist with subtle monochromatic hierarchy', color: '#1A1A1A' },
  tmpl_25: { name: 'Royal', description: 'Deep indigo and gold — traditional yet bold', color: '#191970' },
  tmpl_26: { name: 'Iron', description: 'Strong dark gray with cool blue-steel accents', color: '#1C1F26' },
  tmpl_27: { name: 'Sapphire', description: 'Rich sapphire blue with bright white contrast', color: '#0F2044' },
  tmpl_28: { name: 'Wine', description: 'Deep wine red with warm gold notes', color: '#2E0A1A' },
  tmpl_29: { name: 'Graphite', description: 'Smooth graphite gray with clean lines', color: '#2A2A2A' },
  tmpl_30: { name: 'Nordic', description: 'Clean Scandinavian-inspired dark minimal', color: '#1E1E2E' },
  tmpl_31: { name: 'Thunder', description: 'Stormy gray-blue with electric accent', color: '#1A1D23' },
  tmpl_32: { name: 'Coffee', description: 'Warm coffee brown with cream accents', color: '#2C1810' },
  tmpl_33: { name: 'Cyber', description: 'Dark tech aesthetic with neon accent potential', color: '#0D1117' },
  tmpl_34: { name: 'Prestige', description: 'Classic dark palette with refined gold trim', color: '#0A0A0A' },
};

export const templateList = Object.entries(templateStyles).map(([id, style]) => ({ id, ...style }));
