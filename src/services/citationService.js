// Format author names for APA (Last, F. M.)
const formatAuthorsAPA = (authors) => {
  if (!authors.length) return "";
  const formatted = authors.map(name => {
    const parts = name.split(" ");
    if (parts.length < 2) return name;
    const last = parts.pop();
    const initials = parts.map(p => p[0] + ".").join(" ");
    return `${last}, ${initials}`;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  if (formatted.length <= 20) {
    const allButLast = formatted.slice(0, -1).join(", ");
    return `${allButLast}, & ${formatted[formatted.length - 1]}`;
  }
  return `${formatted.slice(0, 19).join(", ")}, ... ${formatted[formatted.length - 1]}`;
};

// Format author names for MLA (Last, First)
const formatAuthorsMLA = (authors) => {
  if (!authors.length) return "";
  const formatted = authors.map((name, i) => {
    if (i === 0) {
      const parts = name.split(" ");
      if (parts.length < 2) return name;
      const last = parts.pop();
      return `${last}, ${parts.join(" ")}`;
    }
    return name;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, and ${formatted[1]}`;
  return `${formatted[0]}, et al.`;
};

// Format author names for Chicago (First Last)
const formatAuthorsChicago = (authors) => {
  if (!authors.length) return "";
  if (authors.length <= 3) {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]}, ${authors[1]}, and ${authors[2]}`;
  }
  return `${authors[0]} et al.`;
};

// Format author names for IEEE (I. Last)
const formatAuthorsIEEE = (authors) => {
  if (!authors.length) return "";
  const formatted = authors.map(name => {
    const parts = name.split(" ");
    if (parts.length < 2) return name;
    const last = parts.pop();
    const initials = parts.map(p => p[0] + ".").join("");
    return `${initials} ${last}`;
  });

  if (formatted.length <= 6) {
    if (formatted.length === 1) return formatted[0];
    const allButLast = formatted.slice(0, -1).join(", ");
    return `${allButLast}, and ${formatted[formatted.length - 1]}`;
  }
  return `${formatted[0]} et al.`;
};

// Generate APA citation (7th Ed)
const generateAPA = ({ title, authors = [], year, journal, doi, url }) => {
  const authorStr = formatAuthorsAPA(authors);
  const yearStr = year ? ` (${year})` : " (n.d.)";
  const titleStr = journal ? ` ${title}.` : ` *${title}*.`;
  const journalStr = journal ? ` *${journal}*.` : "";
  const doiStr = doi ? ` https://doi.org/${doi}` : url ? ` ${url}` : "";

  return `${authorStr}${yearStr}.${titleStr}${journalStr}${doiStr}`;
};

// Generate MLA citation (9th Ed)
const generateMLA = ({ title, authors = [], year, journal, doi, url }) => {
  const authorStr = formatAuthorsMLA(authors);
  const titleStr = journal ? `"${title}."` : `*${title}*.`;
  const journalStr = journal ? ` *${journal}*,` : "";
  const yearStr = year ? ` ${year},` : "";
  const doiStr = doi ? ` doi:${doi}.` : url ? ` ${url}.` : ".";

  return `${authorStr}. ${titleStr}${journalStr}${yearStr}${doiStr}`;
};

// Generate Chicago citation (17th Ed)
const generateChicago = ({ title, authors = [], year, journal, doi, url }) => {
  const authorStr = formatAuthorsChicago(authors);
  const titleStr = journal ? `"${title}."` : `*${title}*.`;
  const journalStr = journal ? ` *${journal}*` : "";
  const yearStr = year ? ` (${year})` : "";
  const doiStr = doi ? `. https://doi.org/${doi}` : url ? `. ${url}` : "";

  return `${authorStr}.${yearStr} ${titleStr}${journalStr}${doiStr}.`;
};

// Generate IEEE citation
const generateIEEE = ({ title, authors = [], year, journal, doi, url }) => {
  const authorStr = formatAuthorsIEEE(authors);
  const titleStr = ` "${title},"`;
  const journalStr = journal ? ` *${journal}*,` : "";
  const yearStr = year ? ` ${year}.` : "";
  const doiStr = doi ? ` doi: ${doi}.` : url ? ` [Online]. Available: ${url}` : "";

  return `${authorStr},${titleStr}${journalStr}${yearStr}${doiStr}`;
};

// Main citation generator
export const generateCitation = (paperData, style = "APA") => {
  const generators = {
    APA: generateAPA,
    MLA: generateMLA,
    Chicago: generateChicago,
    IEEE: generateIEEE,
  };

  const generator = generators[style] || generateAPA;
  return generator(paperData);
};

// Available citation styles
export const CITATION_STYLES = ["APA", "MLA", "Chicago", "IEEE"];
