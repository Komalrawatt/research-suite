import { API_CONFIG } from "../config/apiConfig";

const buildOpenAlexUrl = (params) => {
  const url = new URL(`${API_CONFIG.OPENALEX.BASE_URL}${API_CONFIG.OPENALEX.WORKS}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
};

const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  try {
    const words = [];
    Object.entries(invertedIndex).forEach(([word, positions]) => {
      if (Array.isArray(positions)) {
        positions.forEach((pos) => {
          words[pos] = word;
        });
      }
    });
    return words.filter(Boolean).join(" ");
  } catch {
    return "";
  }
};

const normalizeWork = (work) => {
  if (!work) return null;

  const authors = (work.authorships || [])
    .map((a) => a.author?.display_name || "")
    .filter(Boolean);

  const primaryLocation = work.primary_location || {};
  const url =
    work.open_access?.oa_url ||
    primaryLocation.landing_page_url ||
    work.id ||
    "";

  // Try topics first, then concepts, then keywords for the field
  const field =
    work.primary_topic?.display_name ||
    (work.topics || [])[0]?.display_name ||
    (work.concepts || [])[0]?.display_name ||
    (work.keywords || [])[0]?.display_name ||
    "General";

  return {
    id: work.id,
    title: work.title || work.display_name || "Untitled",
    authors,
    year: work.publication_year || null,
    field,
    url,
    summary: work.abstract_inverted_index
      ? reconstructAbstract(work.abstract_inverted_index)
      : work.abstract || "",
    source: "OpenAlex",
    institution:
      primaryLocation.source?.display_name ||
      (work.authorships || [])[0]?.institutions?.[0]?.display_name ||
      "Unknown institution",
  };
};

export const searchThesesOpenAlex = async (query, perPage = 12) => {
  const url = buildOpenAlexUrl({
    filter: "type:dissertation",
    search: query,
    "per-page": String(perPage),
    mailto: API_CONFIG.OPENALEX.MAILTO,
  });

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`OpenAlex error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return (data.results || []).map(normalizeWork).filter(Boolean);
};

export const searchCaseStudiesOpenAlex = async (query, perPage = 12) => {
  const search = query ? `case study ${query}` : "case study";
  const url = buildOpenAlexUrl({
    filter: "type:report",
    search,
    "per-page": String(perPage),
    mailto: API_CONFIG.OPENALEX.MAILTO,
  });

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`OpenAlex error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return (data.results || []).map(normalizeWork).filter(Boolean);
};
