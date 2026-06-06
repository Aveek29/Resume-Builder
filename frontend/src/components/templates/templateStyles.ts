import { templateStyles as importedStyles } from '../../types';
import { TemplateStyleConfig } from './types';

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * percent));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getAccentColor(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  if (r > 180 && g < 100 && b < 100) return '#D4A017';
  if (g > 150 && r < 100 && b < 100) return '#C9A84C';
  if (b > 150 && r < 100) return '#C9A84C';
  if (r > 200 && g > 150 && b < 100) return '#B8860B';
  if (r < 50 && g < 50 && b < 50) return '#C9A84C';
  if (r < 100 && g < 100 && b > 100) return '#D4AF37';

  const hue = Math.sqrt(r * r + g * g + b * b);
  if (hue > 200) return '#C9A84C';
  return '#D4A017';
}

const sectionStyleMap: Record<string, TemplateStyleConfig['sectionStyle']> = {
  tmpl_01: 'card',
  tmpl_10: 'card',
  tmpl_03: 'bordered',
  tmpl_05: 'bordered',
  tmpl_14: 'bordered',
  tmpl_07: 'minimal',
  tmpl_11: 'minimal',
};

const headerStyleMap: Record<string, TemplateStyleConfig['headerStyle']> = {
  tmpl_01: 'centered',
  tmpl_03: 'centered',
  tmpl_06: 'gradient',
  tmpl_13: 'gradient',
};

export const defaultStyle: TemplateStyleConfig = {
  primaryColor: '#1B2A4A',
  secondaryColor: '#4A5568',
  accentColor: '#C9A84C',
  fontFamily: "'Segoe UI', Tahoma, sans-serif",
  headerStyle: 'default',
  sectionStyle: 'default',
  name: 'Executive',
  description: 'Deep navy with gold accents',
  color: '#1B2A4A',
};

export function getStyleConfig(templateId: string): TemplateStyleConfig {
  const base = importedStyles[templateId];
  if (!base) {
    return { ...defaultStyle };
  }

  const primaryColor = base.color;
  const secondaryColor = lightenColor(primaryColor, 0.5);
  const accentColor = getAccentColor(primaryColor);
  const sectionStyle = sectionStyleMap[templateId] || 'default';
  const headerStyle = headerStyleMap[templateId] || 'default';

  let fontFamily: string;
  if (['tmpl_02', 'tmpl_08', 'tmpl_11'].includes(templateId)) {
    fontFamily = 'Georgia, "Times New Roman", serif';
  } else if (['tmpl_04', 'tmpl_12', 'tmpl_13', 'tmpl_20', 'tmpl_33'].includes(templateId)) {
    fontFamily = '"Inter", "Segoe UI", system-ui, sans-serif';
  } else {
    fontFamily = "'Segoe UI', Tahoma, sans-serif";
  }

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    fontFamily,
    headerStyle,
    sectionStyle,
    name: base.name,
    description: base.description,
    color: base.color,
  };
}
