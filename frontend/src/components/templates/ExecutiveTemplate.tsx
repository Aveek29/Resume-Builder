import React from 'react';
import { Resume } from '../../types';
import { TemplateStyleConfig } from './types';
import SectionHeader from './SectionHeader';

interface ExecutiveTemplateProps {
  resume: Resume;
  style: TemplateStyleConfig;
}

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '40px 48px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
};

const ExecutiveTemplate: React.FC<ExecutiveTemplateProps> = ({ resume, style }) => {
  const { personalInfo, summary, education, experience, projects, skills, certifications, achievements } = resume;
  const { primaryColor, secondaryColor, accentColor, fontFamily, headerStyle = 'default' } = style;

  const sectionFont: React.CSSProperties = {
    fontFamily,
    fontSize: '12px',
    lineHeight: 1.5,
    color: secondaryColor,
  };

  const renderContact = () => {
    const items: { label: string; value: string }[] = [];
    if (personalInfo.email) items.push({ label: 'Email', value: personalInfo.email });
    if (personalInfo.phone) items.push({ label: 'Phone', value: personalInfo.phone });
    if (personalInfo.address) items.push({ label: 'Address', value: personalInfo.address });
    if (personalInfo.linkedin) items.push({ label: 'LinkedIn', value: personalInfo.linkedin });
    if (personalInfo.github) items.push({ label: 'GitHub', value: personalInfo.github });
    if (personalInfo.portfolio) items.push({ label: 'Portfolio', value: personalInfo.portfolio });

    if (items.length === 0) return null;

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          justifyContent: headerStyle === 'centered' ? 'center' : 'flex-start',
          fontSize: '11px',
          color: secondaryColor,
        }}
      >
        {items.map((item, i) => (
          <span key={i}>
            {item.value}
            {i < items.length - 1 && (
              <span style={{ margin: '0 8px', color: accentColor }}>|</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ ...containerStyle, fontFamily }}>
      <div
        style={{
          textAlign: headerStyle === 'centered' ? 'center' : 'left',
          marginBottom: '24px',
        }}
      >
        {headerStyle === 'gradient' && (
          <div
            style={{
              height: '4px',
              background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
              marginBottom: '16px',
              borderRadius: '2px',
            }}
          />
        )}
        <h1
          style={{
            margin: '0 0 2px 0',
            fontSize: '28px',
            fontWeight: 700,
            color: primaryColor,
            letterSpacing: '0.5px',
          }}
        >
          {personalInfo.fullName || 'Your Name'}
        </h1>
        {resume.title && (
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: accentColor,
              fontWeight: 500,
            }}
          >
            {resume.title}
          </p>
        )}
        {renderContact()}
      </div>

      {summary && (
        <div style={sectionFont}>
          <SectionHeader title="Summary" style={style}>
            <p style={{ margin: 0, textAlign: 'justify' }}>{summary}</p>
          </SectionHeader>
        </div>
      )}

      {education.length > 0 && (
        <div style={sectionFont}>
          <SectionHeader title="Education" style={style}>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: i < education.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ color: primaryColor, fontSize: '13px' }}>{edu.degree}</strong>
                  <span style={{ fontSize: '11px', color: secondaryColor, whiteSpace: 'nowrap' }}>
                    {edu.startYear} – {edu.endYear}
                  </span>
                </div>
                <div style={{ fontSize: '11px', marginTop: '1px' }}>
                  {edu.college}
                  {edu.cgpa && <span> | CGPA: {edu.cgpa}</span>}
                </div>
              </div>
            ))}
          </SectionHeader>
        </div>
      )}

      {experience.length > 0 && (
        <div style={sectionFont}>
          <SectionHeader title="Experience" style={style}>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experience.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ color: primaryColor, fontSize: '13px' }}>{exp.position}</strong>
                  <span style={{ fontSize: '11px', color: secondaryColor, whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: accentColor, fontWeight: 600, marginTop: '1px' }}>
                  {exp.company}
                </div>
                {exp.description && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', textAlign: 'justify' }}>{exp.description}</p>
                )}
              </div>
            ))}
          </SectionHeader>
        </div>
      )}

      {projects.length > 0 && (
        <div style={sectionFont}>
          <SectionHeader title="Projects" style={style}>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: i < projects.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ color: primaryColor, fontSize: '13px' }}>{proj.name}</strong>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'none' }}>GitHub</a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'none' }}>Live</a>
                    )}
                  </div>
                </div>
                {proj.description && (
                  <p style={{ margin: '2px 0 4px 0', fontSize: '11.5px', textAlign: 'justify' }}>{proj.description}</p>
                )}
                {proj.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {proj.technologies.map((tech, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: '10px',
                          padding: '1px 7px',
                          borderRadius: '3px',
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                          border: `1px solid ${primaryColor}30`,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </SectionHeader>
        </div>
      )}

      {skills.length > 0 && (
        <div style={sectionFont}>
          <SectionHeader title="Skills" style={style}>
            {skills.map((skillGroup, i) => {
              if (skillGroup.skills.length === 0) return null;
              return (
                <div key={i} style={{ marginBottom: i < skills.length - 1 ? '6px' : 0, display: 'flex' }}>
                  <strong style={{ color: primaryColor, fontSize: '11.5px', minWidth: '110px', flexShrink: 0 }}>
                    {skillGroup.category}:
                  </strong>
                  <span style={{ fontSize: '11.5px' }}>{skillGroup.skills.join(', ')}</span>
                </div>
              );
            })}
          </SectionHeader>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={sectionFont}>
          <SectionHeader title="Certifications" style={style}>
            {certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: i < certifications.length - 1 ? '6px' : 0, display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <strong style={{ color: primaryColor }}>{cert.name}</strong>
                  {cert.issuer && <span> – {cert.issuer}</span>}
                </span>
                {cert.date && <span style={{ fontSize: '11px', color: secondaryColor, whiteSpace: 'nowrap' }}>{cert.date}</span>}
              </div>
            ))}
          </SectionHeader>
        </div>
      )}

      {achievements.length > 0 && (
        <div style={sectionFont}>
          <SectionHeader title="Achievements" style={style}>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              {achievements.map((item, i) => (
                <li key={i} style={{ marginBottom: '4px', fontSize: '11.5px' }}>{item}</li>
              ))}
            </ul>
          </SectionHeader>
        </div>
      )}
    </div>
  );
};

export default ExecutiveTemplate;
