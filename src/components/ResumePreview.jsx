import { Box, Typography, Divider } from '@mui/material';

// Inline styles to mimic the print CSS from resume-pdf project
const styles = {
  page: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    color: '#111',
    lineHeight: 1.25,
    fontSize: '10pt',
    backgroundColor: 'white',
    padding: '0.4in',
    minHeight: '11in',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  headerName: {
    fontSize: '20pt',
    fontWeight: 700,
    letterSpacing: '0.2px',
    marginBottom: '2px',
    lineHeight: 1.1
  },
  headerSubtitle: {
    color: '#444',
    fontWeight: 500,
    fontSize: '10pt',
    marginBottom: '4px'
  },
  contact: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    color: '#444',
    fontSize: '9pt',
    marginTop: '2px'
  },
  sectionHeader: {
    fontSize: '11pt',
    fontWeight: 700,
    marginTop: '10px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '2px',
    marginBottom: '4px',
    textTransform: 'uppercase'
  },
  summary: {
    marginTop: '4px',
    marginBottom: '8px'
  },
  roleHeadline: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontWeight: 600,
    fontSize: '10pt',
    marginTop: '8px'
  },
  dates: {
    color: '#444',
    fontSize: '9pt',
    textAlign: 'right'
  },
  company: {
    color: '#444',
    fontSize: '9.5pt',
    marginBottom: '2px',
    fontStyle: 'italic'
  },
  bulletList: {
    margin: '2px 0 0 16px',
    padding: 0,
  },
  bulletItem: {
    marginBottom: '2px'
  },
  kvGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '4px 10px',
    marginTop: '4px',
    fontSize: '9pt'
  }
};

function ResumePreview({ data }) {
  if (!data) return <Box sx={{ p: 4, color: 'text.secondary', textAlign: 'center' }}>No resume data loaded</Box>;

  return (
    <div style={styles.page} id="resume-preview">
      {/* Header */}
      <div>
        <div style={styles.headerName}>{data.name}</div>
        <div style={styles.headerSubtitle}>{data.tagline}</div>
        <div style={styles.contact}>
          {data.phone && <span>{data.phone}</span>}
          {data.email && <span>{data.email}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.website && <span>{data.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <div style={styles.sectionHeader}>SUMMARY</div>
          <div style={styles.summary}>{data.summary}</div>
        </div>
      )}

      {/* Open Source / Portfolio */}
      {data.portfolio && data.portfolio.length > 0 && (
        <div>
          <div style={styles.sectionHeader}>OPEN SOURCE PORTFOLIO</div>
          {data.portfolio.map((p, i) => (
            <div key={i}>
              <div style={styles.roleHeadline}>
                <div>{p.name} {p.url ? <span style={{fontWeight:'normal', fontSize:'9pt'}}>({p.url})</span> : ''}</div>
                <div style={styles.dates}>{p.dates}</div>
              </div>
              {p.subtitle && <div style={styles.company}>{p.subtitle}</div>}
              {p.bullets && (
                <ul style={styles.bulletList}>
                  {p.bullets.map((b, idx) => (
                    <li key={idx} style={styles.bulletItem}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <div style={styles.sectionHeader}>EXPERIENCE</div>
          {data.experience.map((role, i) => (
            <div key={i}>
              <div style={styles.roleHeadline}>
                <div>{role.title} — {role.company}</div>
                <div style={styles.dates}>{role.dates}</div>
              </div>
              {role.location && <div style={styles.company}>{role.location}</div>}
              {role.bullets && (
                <ul style={styles.bulletList}>
                  {role.bullets.map((b, idx) => (
                    <li key={idx} style={styles.bulletItem}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <div style={styles.sectionHeader}>SELECTED PROJECTS</div>
          {data.projects.map((p, i) => (
            <div key={i}>
              <div style={styles.roleHeadline}>
                <div>{p.name}</div>
                {p.dates && <div style={styles.dates}>{p.dates}</div>}
              </div>
              {p.subtitle && <div style={styles.company}>{p.subtitle}</div>}
              {p.bullets && (
                <ul style={styles.bulletList}>
                  {p.bullets.map((b, idx) => (
                    <li key={idx} style={styles.bulletItem}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <div style={styles.sectionHeader}>EDUCATION</div>
          <ul style={styles.bulletList}>
            {data.education.map((ed, i) => (
              <li key={i} style={styles.bulletItem}>
                <strong>{ed.degree}</strong> — {ed.school} {ed.year && `(${ed.year})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {data.core_skills && data.core_skills.length > 0 && (
        <div>
          <div style={styles.sectionHeader}>CORE SKILLS</div>
          <div style={styles.kvGrid}>
            {data.core_skills.map((skill, i) => (
              <div key={i}>{skill}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumePreview;
