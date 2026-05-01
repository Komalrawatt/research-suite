// API Configuration for Research Suite
// All third-party academic API endpoints and keys

export const API_CONFIG = {
  // Semantic Scholar API (free, no key required for basic use)
  SEMANTIC_SCHOLAR: {
    BASE_URL: "https://api.semanticscholar.org/graph/v1",
    PAPER_SEARCH: "/paper/search",
    PAPER_DETAILS: "/paper",
    AUTHOR_SEARCH: "/author/search",
    FIELDS: "paperId,title,abstract,year,citationCount,authors,journal,url,openAccessPdf,fieldsOfStudy,publicationDate",
  },

  // Crossref API (free, no key required)
  CROSSREF: {
    BASE_URL: "https://api.crossref.org",
    WORKS: "/works",
    JOURNALS: "/journals",
    MAILTO: "research-suite@example.com", // polite pool
  },

  // OpenAlex API (free, no key required)
  OPENALEX: {
    BASE_URL: "https://api.openalex.org",
    WORKS: "/works",
    VENUES: "/venues",
    SOURCES: "/sources",
    AUTHORS: "/authors",
    MAILTO: "research-suite@example.com",
  },

  // CORE API (requires free API key)
  CORE: {
    BASE_URL: "https://api.core.ac.uk/v3",
    SEARCH: "/search/works",
    API_KEY: import.meta.env.VITE_CORE_API_KEY || "",
  },

  // OSF Preprints API (free, no key required for basic use)
  OSF: {
    BASE_URL: "https://api.osf.io",
    PREPRINT_PROVIDERS: "/preprints/providers/",
  },

  // Preprint servers (static links)
  PREPRINT_SERVERS: [
    { name: "arXiv", url: "https://arxiv.org", field: "Physics, Math, CS, Biology", description: "Open-access archive for scholarly articles in STEM fields" },
    { name: "bioRxiv", url: "https://www.biorxiv.org", field: "Biology", description: "Preprint server for biological sciences" },
    { name: "medRxiv", url: "https://www.medrxiv.org", field: "Medical Sciences", description: "Preprint server for health sciences" },
    { name: "SSRN", url: "https://www.ssrn.com", field: "Social Sciences, Economics, Law", description: "Social Science Research Network" },
    { name: "ChemRxiv", url: "https://chemrxiv.org", field: "Chemistry", description: "Preprint server for chemistry" },
    { name: "TechRxiv", url: "https://www.techrxiv.org", field: "Engineering, Technology", description: "Preprint server for engineering and technology" },
    { name: "EarthArXiv", url: "https://eartharxiv.org", field: "Earth Sciences", description: "Preprint server for earth sciences" },
    { name: "PsyArXiv", url: "https://psyarxiv.com", field: "Psychology", description: "Preprint server for psychological sciences" },
  ],
};
