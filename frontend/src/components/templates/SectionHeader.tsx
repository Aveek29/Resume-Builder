import React from 'react';
import { TemplateStyleConfig } from './types';

interface SectionHeaderProps {
  title: string;
  style: TemplateStyleConfig;
  children: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, style, children }) => {
  const { primaryColor, accentColor, sectionStyle = 'default' } = style;

  const renderTitle = () => {
    switch (sectionStyle) {
      case 'bordered':
        return (
          <div
            style={{
              border: `2px solid ${primaryColor}`,
              padding: '6px 12px',
              marginBottom: '10px',
              display: 'inline-block',
            }}
          >
            <h3
              style={{
                margin: 0,
                textTransform: 'uppercase',
                color: primaryColor,
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              {title}
            </h3>
          </div>
        );
      case 'card':
        return (
          <div
            style={{
              backgroundColor: primaryColor,
              padding: '8px 14px',
              marginBottom: '10px',
              borderRadius: '4px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </h3>
          </div>
        );
      case 'minimal':
        return (
          <h3
            style={{
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: primaryColor,
              fontSize: '12px',
              fontWeight: 600,
              borderBottom: `1px solid ${accentColor}`,
              paddingBottom: '5px',
              margin: '0 0 10px 0',
            }}
          >
            {title}
          </h3>
        );
      default:
        return (
          <h3
            style={{
              color: primaryColor,
              fontSize: '15px',
              fontWeight: 700,
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '4px',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </h3>
        );
    }
  };

  return (
    <div style={{ marginBottom: '18px' }}>
      {renderTitle()}
      <div>{children}</div>
    </div>
  );
};

export default SectionHeader;
