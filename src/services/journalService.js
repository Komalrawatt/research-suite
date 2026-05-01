// Journal Service — journal selector feature using Crossref API
import { API_CONFIG } from "../config/apiConfig";

// Sample journal database for the selector feature
// In production, this would be fetched from Firestore or a larger dataset
const JOURNAL_DATABASE = [
  { name: "Nature", domain: "Multidisciplinary", impactFactor: 64.8, indexing: ["SCI", "Scopus"], keywords: ["science", "research", "biology", "physics", "chemistry", "medicine"], reviewTime: "2-4 weeks", website: "https://www.nature.com", publisher: "Springer Nature" },
  { name: "Science", domain: "Multidisciplinary", impactFactor: 56.9, indexing: ["SCI", "Scopus"], keywords: ["science", "technology", "biology", "engineering"], reviewTime: "2-4 weeks", website: "https://www.science.org", publisher: "AAAS" },
  { name: "IEEE Transactions on Pattern Analysis and Machine Intelligence", domain: "Computer Science", impactFactor: 24.3, indexing: ["SCI", "Scopus", "IEEE"], keywords: ["machine learning", "computer vision", "deep learning", "artificial intelligence", "pattern recognition"], reviewTime: "4-8 weeks", website: "https://ieeexplore.ieee.org", publisher: "IEEE" },
  { name: "The Lancet", domain: "Medicine", impactFactor: 168.9, indexing: ["SCI", "Scopus", "PubMed"], keywords: ["medicine", "clinical", "health", "disease", "treatment", "public health"], reviewTime: "2-4 weeks", website: "https://www.thelancet.com", publisher: "Elsevier" },
  { name: "Journal of Machine Learning Research", domain: "Computer Science", impactFactor: 6.0, indexing: ["SCI", "Scopus"], keywords: ["machine learning", "deep learning", "neural networks", "statistics", "algorithms"], reviewTime: "8-16 weeks", website: "https://jmlr.org", publisher: "JMLR Inc." },
  { name: "Physical Review Letters", domain: "Physics", impactFactor: 9.2, indexing: ["SCI", "Scopus"], keywords: ["physics", "quantum", "condensed matter", "particle physics", "astrophysics"], reviewTime: "4-6 weeks", website: "https://journals.aps.org/prl", publisher: "APS" },
  { name: "Chemical Reviews", domain: "Chemistry", impactFactor: 62.1, indexing: ["SCI", "Scopus"], keywords: ["chemistry", "organic", "inorganic", "materials", "biochemistry"], reviewTime: "4-8 weeks", website: "https://pubs.acs.org/journal/chreay", publisher: "ACS" },
  { name: "Journal of Business Research", domain: "Business", impactFactor: 11.3, indexing: ["SSCI", "Scopus"], keywords: ["business", "marketing", "management", "strategy", "entrepreneurship", "finance"], reviewTime: "8-12 weeks", website: "https://www.journals.elsevier.com/journal-of-business-research", publisher: "Elsevier" },
  { name: "Computers & Education", domain: "Education", impactFactor: 12.0, indexing: ["SSCI", "Scopus"], keywords: ["education", "e-learning", "technology", "pedagogy", "online learning", "educational technology"], reviewTime: "8-16 weeks", website: "https://www.journals.elsevier.com/computers-and-education", publisher: "Elsevier" },
  { name: "Environmental Science & Technology", domain: "Environmental Science", impactFactor: 11.4, indexing: ["SCI", "Scopus"], keywords: ["environment", "pollution", "sustainability", "climate change", "water", "ecology"], reviewTime: "6-10 weeks", website: "https://pubs.acs.org/journal/esthag", publisher: "ACS" },
  { name: "Psychological Bulletin", domain: "Psychology", impactFactor: 23.0, indexing: ["SSCI", "Scopus"], keywords: ["psychology", "mental health", "behavior", "cognition", "therapy", "personality"], reviewTime: "4-8 weeks", website: "https://www.apa.org/pubs/journals/bul", publisher: "APA" },
  { name: "Econometrica", domain: "Economics", impactFactor: 6.5, indexing: ["SSCI", "Scopus"], keywords: ["economics", "econometrics", "game theory", "microeconomics", "macroeconomics", "finance"], reviewTime: "12-24 weeks", website: "https://www.econometricsociety.org/publications/econometrica", publisher: "Wiley" },
  { name: "Advanced Materials", domain: "Materials Science", impactFactor: 29.4, indexing: ["SCI", "Scopus"], keywords: ["materials", "nanotechnology", "polymers", "ceramics", "composites", "thin films"], reviewTime: "4-8 weeks", website: "https://onlinelibrary.wiley.com/journal/15214095", publisher: "Wiley" },
  { name: "ACM Computing Surveys", domain: "Computer Science", impactFactor: 16.6, indexing: ["SCI", "Scopus"], keywords: ["computing", "survey", "software", "algorithms", "databases", "networks", "security"], reviewTime: "12-20 weeks", website: "https://dl.acm.org/journal/csur", publisher: "ACM" },
  { name: "Journal of Cleaner Production", domain: "Environmental Science", impactFactor: 11.1, indexing: ["SCI", "Scopus"], keywords: ["sustainability", "clean production", "environment", "circular economy", "green technology", "waste management"], reviewTime: "6-12 weeks", website: "https://www.journals.elsevier.com/journal-of-cleaner-production", publisher: "Elsevier" },
  { name: "Annual Review of Psychology", domain: "Psychology", impactFactor: 24.1, indexing: ["SSCI", "Scopus"], keywords: ["psychology", "review", "cognition", "development", "social psychology", "clinical"], reviewTime: "Invited only", website: "https://www.annualreviews.org/journal/psych", publisher: "Annual Reviews" },
  { name: "MIS Quarterly", domain: "Information Systems", impactFactor: 7.0, indexing: ["SSCI", "Scopus"], keywords: ["information systems", "IT management", "digital transformation", "technology adoption", "cybersecurity"], reviewTime: "12-24 weeks", website: "https://misq.umn.edu/", publisher: "University of Minnesota" },
  { name: "Renewable and Sustainable Energy Reviews", domain: "Energy", impactFactor: 16.3, indexing: ["SCI", "Scopus"], keywords: ["renewable energy", "solar", "wind", "bioenergy", "energy storage", "sustainability"], reviewTime: "8-16 weeks", website: "https://www.journals.elsevier.com/renewable-and-sustainable-energy-reviews", publisher: "Elsevier" },
  { name: "Artificial Intelligence", domain: "Computer Science", impactFactor: 14.4, indexing: ["SCI", "Scopus"], keywords: ["artificial intelligence", "machine learning", "natural language processing", "robotics", "expert systems"], reviewTime: "8-16 weeks", website: "https://www.journals.elsevier.com/artificial-intelligence", publisher: "Elsevier" },
  { name: "Cell", domain: "Biology", impactFactor: 64.5, indexing: ["SCI", "Scopus", "PubMed"], keywords: ["biology", "cell biology", "genetics", "molecular biology", "genomics", "biotechnology"], reviewTime: "2-4 weeks", website: "https://www.cell.com/cell", publisher: "Elsevier" },
];

// Find matching journals based on user keywords/abstract
export const findJournals = (inputText, domain = null) => {
  const keywords = inputText.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  const scored = JOURNAL_DATABASE.map((journal) => {
    let score = 0;

    // Match keywords
    keywords.forEach((keyword) => {
      journal.keywords.forEach((jk) => {
        if (jk.includes(keyword) || keyword.includes(jk)) score += 2;
      });
      if (journal.domain.toLowerCase().includes(keyword)) score += 3;
      if (journal.name.toLowerCase().includes(keyword)) score += 3;
    });

    // Domain filter boost
    if (domain && journal.domain.toLowerCase() === domain.toLowerCase()) {
      score += 5;
    }

    return { ...journal, score };
  });

  return scored
    .filter((j) => j.score > 0)
    .sort((a, b) => b.score - a.score || b.impactFactor - a.impactFactor);
};

// Get all journals grouped by domain
export const getJournalsByDomain = () => {
  const grouped = {};
  JOURNAL_DATABASE.forEach((j) => {
    if (!grouped[j.domain]) grouped[j.domain] = [];
    grouped[j.domain].push(j);
  });
  return grouped;
};

// Get all unique domains
export const getDomains = () => {
  return [...new Set(JOURNAL_DATABASE.map((j) => j.domain))].sort();
};

// Search journals via Crossref Journals API
export const searchJournalsCrossref = async (query) => {
  try {
    const url = `${API_CONFIG.CROSSREF.BASE_URL}${API_CONFIG.CROSSREF.JOURNALS}?query=${encodeURIComponent(query)}&rows=10&mailto=${API_CONFIG.CROSSREF.MAILTO}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Crossref journals error: ${response.status}`);

    const data = await response.json();
    return (data.message?.items || []).map((item) => ({
      name: item.title,
      publisher: item.publisher,
      issn: item.ISSN?.[0] || "",
      subjects: item.subjects || [],
      website: item.URL || "",
    }));
  } catch (error) {
    console.error("Journal search error:", error);
    return [];
  }
};
