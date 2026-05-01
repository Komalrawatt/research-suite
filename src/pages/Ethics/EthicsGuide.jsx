import { FiShield, FiCheckCircle, FiAlertTriangle, FiBookOpen } from "react-icons/fi";

const EthicsGuide = () => {
  const sections = [
    {
      title: "Plagiarism Prevention",
      icon: <FiShield />,
      color: "var(--accent)",
      content: "Plagiarism is the practice of taking someone else's work or ideas and passing them off as one's own. It is a serious academic offense that can damage your career.",
      tips: [
        "Always cite the original source when using an idea, data, or text that is not yours.",
        "Use quotation marks for direct quotes and provide a proper citation.",
        "Paraphrase effectively by rewriting the idea in your own words while still giving credit.",
        "Be aware of self-plagiarism—reusing your own previously published work without disclosure."
      ]
    },
    {
      title: "Proper Citation Practices",
      icon: <FiCheckCircle />,
      color: "var(--success)",
      content: "Citations serve two main purposes: to give credit to other researchers and to allow readers to locate the original source of information.",
      tips: [
        "Follow the specific style guide (APA, MLA, IEEE) required by your institution or journal.",
        "Ensure consistency throughout your document.",
        "Cite during the writing process, not just at the end, to avoid missing references.",
        "Use reference managers like Zotero or Mendeley to organize and automate your bibliography."
      ]
    },
    {
      title: "Data Integrity & Honesty",
      icon: <FiAlertTriangle />,
      color: "var(--warning)",
      content: "Researchers must report their findings honestly. Falsification (manipulating research materials) and fabrication (making up data) are unacceptable.",
      tips: [
        "Maintain accurate and detailed records of your experimental procedures and raw data.",
        "Report both positive and negative results—negative results are also valuable to science.",
        "Disclose any potential conflicts of interest in your publications.",
        "Follow ethical guidelines for research involving human or animal subjects."
      ]
    }
  ];

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Research Ethics & Integrity Guide</h1>
        <p className="section-subtitle">A comprehensive guide to responsible research and academic honesty</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
        {sections.map((section, idx) => (
          <div key={idx} className="card animate-in" style={{animationDelay: `${idx * 0.1}s`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px'}}>
              <div style={{
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: `rgba(${section.color === 'var(--accent)' ? '37, 99, 235' : section.color === 'var(--success)' ? '16, 185, 129' : '245, 158, 11'}, 0.15)`,
                color: section.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {section.icon}
              </div>
              <h2 style={{fontSize: '1.5rem', color: 'var(--text-primary)'}}>{section.title}</h2>
            </div>

            <p style={{color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.7', fontSize: '1.05rem'}}>
              {section.content}
            </p>

            <div style={{background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
              <h4 style={{marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FiBookOpen /> Best Practices & Tips
              </h4>
              <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {section.tips.map((tip, tIdx) => (
                  <li key={tIdx} style={{display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
                    <span style={{color: section.color, fontWeight: 'bold'}}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default EthicsGuide;
