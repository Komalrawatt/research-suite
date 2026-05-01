// Paper Search Service — integrates Semantic Scholar, OpenAlex, Crossref & CORE APIs
import { API_CONFIG } from "../config/apiConfig";

const proxyTargets = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

const fetchWithTimeout = async (targetUrl, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, { signal: controller.signal });
    if (response.status === 429) {
      throw new Error("Rate limit reached. Please wait and try again.");
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchJsonWithProxyFallback = async (url, timeoutMs = 12000) => {
  let lastError = null;
  const targets = [...proxyTargets.map((builder) => builder(url)), url];

  for (const target of targets) {
    try {
      return await fetchWithTimeout(target, timeoutMs);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch data.");
};

// ─── Semantic Scholar ────────────────────────────────────────────────
export const searchPapers = async (query, offset = 0, limit = 10, year = null, fieldsOfStudy = null) => {
  try {
    let url = `${API_CONFIG.SEMANTIC_SCHOLAR.BASE_URL}${API_CONFIG.SEMANTIC_SCHOLAR.PAPER_SEARCH}?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}&fields=${API_CONFIG.SEMANTIC_SCHOLAR.FIELDS}`;

    if (year) url += `&year=${year}`;
    if (fieldsOfStudy) url += `&fieldsOfStudy=${fieldsOfStudy}`;

    const data = await fetchJsonWithProxyFallback(url);
    return {
      papers: (data.data || []).map(normalizePaper),
      total: data.total || 0,
      offset: data.offset || 0,
    };
  } catch (error) {
    console.error("Paper search error:", error);
    throw error;
  }
};

// Get paper details by ID
export const getPaperDetails = async (paperId) => {
  try {
    const url = `${API_CONFIG.SEMANTIC_SCHOLAR.BASE_URL}${API_CONFIG.SEMANTIC_SCHOLAR.PAPER_DETAILS}/${paperId}?fields=${API_CONFIG.SEMANTIC_SCHOLAR.FIELDS},references,citations`;
    const data = await fetchJsonWithProxyFallback(url);
    return normalizePaper(data);
  } catch (error) {
    console.error("Paper details error:", error);
    throw error;
  }
};

// ─── Crossref ────────────────────────────────────────────────────────
export const searchCrossref = async (query, offset = 0, limit = 10, year = null, field = null) => {
  try {
    let url = `${API_CONFIG.CROSSREF.BASE_URL}${API_CONFIG.CROSSREF.WORKS}?query=${encodeURIComponent(query)}&rows=${limit}&offset=${offset}&mailto=${API_CONFIG.CROSSREF.MAILTO}&sort=relevance&order=desc`;

    // Crossref supports filter by publication year
    const filters = [];
    if (year) {
      filters.push(`from-pub-date:${year}-01-01`);
      filters.push(`until-pub-date:${year}-12-31`);
    }
    if (filters.length > 0) {
      url += `&filter=${filters.join(",")}`;
    }

    // If a field/subject is specified, append it to the query for better relevance
    if (field) {
      url = url.replace(
        `query=${encodeURIComponent(query)}`,
        `query=${encodeURIComponent(query + " " + field)}`
      );
    }

    const data = await fetchJsonWithProxyFallback(url);
    const items = data.message?.items || [];
    return {
      papers: items.map(normalizeCrossrefPaper),
      total: data.message?.["total-results"] || 0,
      offset,
    };
  } catch (error) {
    console.error("Crossref search error:", error);
    throw error;
  }
};

// ─── OpenAlex ────────────────────────────────────────────────────────
export const searchOpenAlex = async (query, page = 1, perPage = 10, year = null, field = null) => {
  try {
    let url = `${API_CONFIG.OPENALEX.BASE_URL}${API_CONFIG.OPENALEX.WORKS}?search=${encodeURIComponent(query)}&page=${page}&per-page=${perPage}&mailto=${API_CONFIG.OPENALEX.MAILTO}`;

    // OpenAlex supports structured filters
    const filters = [];
    if (year) {
      filters.push(`publication_year:${year}`);
    }
    if (field) {
      // OpenAlex uses concept.display_name for field filtering
      filters.push(`concepts.display_name:${field}`);
    }
    if (filters.length > 0) {
      url += `&filter=${filters.join(",")}`;
    }

    const data = await fetchJsonWithProxyFallback(url);
    return {
      papers: (data.results || []).map(normalizeOpenAlexPaper),
      total: data.meta?.count || 0,
      page: data.meta?.page || 1,
    };
  } catch (error) {
    console.error("OpenAlex search error:", error);
    throw error;
  }
};

// ─── CORE ────────────────────────────────────────────────────────────
export const searchCORE = async (query, limit = 10, year = null, field = null) => {
  try {
    if (!API_CONFIG.CORE.API_KEY) {
      console.warn("CORE API key missing, results may be limited or unavailable.");
    }
    const url = `${API_CONFIG.CORE.BASE_URL}${API_CONFIG.CORE.SEARCH}`;

    // Build enriched query for CORE
    let enrichedQuery = query;
    if (field) enrichedQuery += ` ${field}`;

    const body = { q: enrichedQuery, limit };
    // CORE supports year filter in the body
    if (year) {
      body.q += ` year:${year}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.CORE.API_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) throw new Error(`CORE API error: ${response.status}`);

    const data = await response.json();
    return {
      papers: (data.results || []).map(normalizeCorePaper),
      total: data.totalHits || 0,
    };
  } catch (error) {
    console.error("CORE search error:", error);
    throw error;
  }
};

// ─── ArXiv ───────────────────────────────────────────────────────────
export const searchArXiv = async (query, maxResults = 10) => {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const fetchXml = async (targetUrl) => {
      const response = await fetch(targetUrl);
      if (response.status === 429) {
        throw new Error("ArXiv rate limit reached. Please wait a moment and try again.");
      }
      if (!response.ok) throw new Error(`ArXiv API error: ${response.status}`);
      return response.text();
    };

    let responseText = "";
    try {
      responseText = await fetchXml(proxyUrl);
    } catch (proxyError) {
      responseText = await fetchXml(url);
    }
    // Basic XML parsing using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    
    const papers = Array.from(entries).map(entry => {
      const id = entry.getElementsByTagName("id")[0]?.textContent;
      const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\n/g, ' ').trim();
      const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\n/g, ' ').trim();
      const published = entry.getElementsByTagName("published")[0]?.textContent;
      const authors = Array.from(entry.getElementsByTagName("author")).map(a => a.getElementsByTagName("name")[0]?.textContent);
      const link = Array.from(entry.getElementsByTagName("link")).find(l => l.getAttribute("title") === "pdf")?.getAttribute("href") || id;
      
      return {
        id,
        title,
        abstract: summary,
        authors,
        year: published ? new Date(published).getFullYear() : null,
        journal: "arXiv Preprint",
        url: id,
        openAccessPdf: link,
        source: "arXiv",
      };
    });

    return { papers, total: papers.length };
  } catch (error) {
    console.error("ArXiv search error:", error);
    throw error;
  }
};

// ─── Normalizers ─────────────────────────────────────────────────────

// Normalize Semantic Scholar paper data
const normalizePaper = (paper) => ({
  id: paper.paperId,
  title: paper.title || "Untitled",
  abstract: paper.abstract || "",
  authors: (paper.authors || []).map((a) => a.name),
  year: paper.year,
  citationCount: paper.citationCount || 0,
  journal: paper.journal?.name || "",
  url: paper.url || "",
  openAccessPdf: paper.openAccessPdf?.url || null,
  fieldsOfStudy: paper.fieldsOfStudy || [],
  publicationDate: paper.publicationDate || null,
  source: "Semantic Scholar",
});

// Normalize Crossref paper data
const normalizeCrossrefPaper = (item) => ({
  id: item.DOI,
  title: item.title?.[0] || "Untitled",
  abstract: item.abstract ? item.abstract.replace(/<[^>]*>/g, "") : "",
  authors: (item.author || []).map((a) => `${a.given || ""} ${a.family || ""}`.trim()),
  year: item.published?.["date-parts"]?.[0]?.[0] || item.created?.["date-parts"]?.[0]?.[0] || null,
  citationCount: item["is-referenced-by-count"] || 0,
  journal: item["container-title"]?.[0] || "",
  url: item.URL || `https://doi.org/${item.DOI}`,
  doi: item.DOI,
  openAccessPdf: null,
  fieldsOfStudy: item.subject || [],
  publicationDate: null,
  source: "Crossref",
});

// Normalize OpenAlex paper data
const normalizeOpenAlexPaper = (work) => ({
  id: work.id,
  title: work.title || "Untitled",
  abstract: work.abstract_inverted_index
    ? reconstructAbstract(work.abstract_inverted_index)
    : "",
  authors: (work.authorships || []).map((a) => a.author?.display_name || ""),
  year: work.publication_year,
  citationCount: work.cited_by_count || 0,
  journal: work.primary_location?.source?.display_name || "",
  url: work.doi || work.id,
  doi: work.doi?.replace("https://doi.org/", "") || "",
  openAccessPdf: work.open_access?.oa_url || null,
  fieldsOfStudy: (work.concepts || []).slice(0, 3).map((c) => c.display_name),
  publicationDate: work.publication_date,
  source: "OpenAlex",
});

// Normalize CORE paper data
const normalizeCorePaper = (item) => ({
  id: item.id,
  title: item.title || "Untitled",
  abstract: item.abstract || "",
  authors: (item.authors || []).map(a => a.name),
  year: item.yearPublished,
  citationCount: item.citationCount || 0,
  journal: item.publisher || "",
  url: item.downloadUrl || item.identifiers?.find(id => id.startsWith('http')) || "",
  doi: item.doi,
  openAccessPdf: item.downloadUrl || null,
  fieldsOfStudy: item.subjects || [],
  publicationDate: null,
  source: "CORE",
});

// Reconstruct abstract from OpenAlex inverted index
const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex) return "";
  const words = [];
  Object.entries(invertedIndex).forEach(([word, positions]) => {
    positions.forEach((pos) => {
      words[pos] = word;
    });
  });
  return words.join(" ");
};

// Fields of study for filtering
export const FIELDS_OF_STUDY = [
  "Computer Science",
  "Medicine",
  "Biology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Engineering",
  "Environmental Science",
  "Psychology",
  "Economics",
  "Business",
  "Sociology",
  "Political Science",
  "Philosophy",
  "Geography",
  "History",
  "Art",
  "Education",
  "Law",
  "Materials Science",
];
