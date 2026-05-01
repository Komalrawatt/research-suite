// Conference Service — OpenAlex sources with sample data fallback
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { API_CONFIG } from "../config/apiConfig";

// Sample conference data (in production would come from Firestore or an API)
const SAMPLE_CONFERENCES = [
  { id: "1", name: "NeurIPS 2026", field: "Computer Science", location: "Vancouver, Canada", submissionDeadline: "2026-05-20", eventDate: "2026-12-08", mode: "hybrid", website: "https://neurips.cc", description: "Conference on Neural Information Processing Systems" },
  { id: "2", name: "ICML 2026", field: "Computer Science", location: "Honolulu, Hawaii", submissionDeadline: "2026-02-01", eventDate: "2026-07-21", mode: "offline", website: "https://icml.cc", description: "International Conference on Machine Learning" },
  { id: "3", name: "CVPR 2026", field: "Computer Science", location: "Nashville, USA", submissionDeadline: "2026-11-15", eventDate: "2026-06-15", mode: "hybrid", website: "https://cvpr.thecvf.com", description: "Conference on Computer Vision and Pattern Recognition" },
  { id: "4", name: "ACL 2026", field: "Computer Science", location: "Bangkok, Thailand", submissionDeadline: "2026-01-15", eventDate: "2026-08-10", mode: "hybrid", website: "https://www.aclweb.org", description: "Annual Meeting of the Association for Computational Linguistics" },
  { id: "5", name: "AAAI 2026", field: "Computer Science", location: "Philadelphia, USA", submissionDeadline: "2026-08-08", eventDate: "2027-02-22", mode: "hybrid", website: "https://aaai.org", description: "AAAI Conference on Artificial Intelligence" },
  { id: "6", name: "IEEE GLOBECOM 2026", field: "Engineering", location: "Madrid, Spain", submissionDeadline: "2026-07-01", eventDate: "2026-12-07", mode: "offline", website: "https://globecom2026.ieee-globecom.org", description: "IEEE Global Communications Conference" },
  { id: "7", name: "CHI 2026", field: "Human-Computer Interaction", location: "Yokohama, Japan", submissionDeadline: "2025-09-12", eventDate: "2026-04-26", mode: "hybrid", website: "https://chi2026.acm.org", description: "ACM Conference on Human Factors in Computing Systems" },
  { id: "8", name: "MICCAI 2026", field: "Medicine", location: "Marrakech, Morocco", submissionDeadline: "2026-03-01", eventDate: "2026-10-06", mode: "hybrid", website: "https://www.miccai.org", description: "Medical Image Computing and Computer Assisted Intervention" },
  { id: "9", name: "SIGMOD 2026", field: "Computer Science", location: "Berlin, Germany", submissionDeadline: "2025-10-15", eventDate: "2026-06-22", mode: "offline", website: "https://sigmod2026.org", description: "ACM SIGMOD International Conference on Management of Data" },
  { id: "10", name: "EMNLP 2026", field: "Computer Science", location: "Bali, Indonesia", submissionDeadline: "2026-06-01", eventDate: "2026-12-01", mode: "hybrid", website: "https://www.aclweb.org/emnlp", description: "Conference on Empirical Methods in Natural Language Processing" },
  { id: "11", name: "ECCV 2026", field: "Computer Science", location: "Zurich, Switzerland", submissionDeadline: "2026-03-07", eventDate: "2026-09-29", mode: "offline", website: "https://eccv2026.eu", description: "European Conference on Computer Vision" },
  { id: "12", name: "WWW 2026", field: "Computer Science", location: "Sydney, Australia", submissionDeadline: "2025-10-14", eventDate: "2026-04-13", mode: "hybrid", website: "https://www2026.thewebconf.org", description: "ACM Web Conference" },
];

// Get conferences — try OpenAlex /sources first, then Firestore, then sample data
export const getConferences = async ({ searchQuery = "", field = "" } = {}) => {
  try {
    const searchParts = [searchQuery, field].map((v) => v.trim()).filter(Boolean);
    const search = searchParts.join(" ").trim();

    // Use /sources endpoint (replaces deprecated /venues)
    const url = new URL(`${API_CONFIG.OPENALEX.BASE_URL}${API_CONFIG.OPENALEX.SOURCES || "/sources"}`);
    url.searchParams.set("filter", "type:conference");
    url.searchParams.set("per-page", "50");
    url.searchParams.set("page", "1");
    url.searchParams.set("mailto", API_CONFIG.OPENALEX.MAILTO);
    if (search) url.searchParams.set("search", search);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`OpenAlex sources error: ${response.status}`);

    const data = await response.json();
    const sources = data.results || [];

    if (sources.length > 0) {
      return sources.map(normalizeOpenAlexSource);
    }
    // If API returned empty results, fall back
    return getConferencesFromFirestoreOrSample();
  } catch (error) {
    console.error("Conference search error:", error);
    return getConferencesFromFirestoreOrSample();
  }
};

const normalizeOpenAlexSource = (source) => {
  const topics = source.topics || source.x_concepts || [];
  const field = topics[0]?.display_name || "General";
  const description = topics.slice(0, 3).map((c) => c.display_name).join(", ") || source.display_name;

  return {
    id: source.id || source.display_name,
    name: source.display_name || "Untitled Conference",
    field,
    location: "Location TBD",
    submissionDeadline: "N/A",
    eventDate: "N/A",
    mode: "offline",
    website: source.homepage_url || "",
    description,
  };
};

const getConferencesFromFirestoreOrSample = async () => {
  try {
    const q = query(collection(db, "conferences"), orderBy("eventDate", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return SAMPLE_CONFERENCES;
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return SAMPLE_CONFERENCES;
  }
};

// Filter conferences
export const filterConferences = (conferences, { field, mode, searchQuery }) => {
  return conferences.filter((conf) => {
    if (field && !conf.field.toLowerCase().includes(field.toLowerCase())) return false;
    if (mode && conf.mode !== mode) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        conf.name.toLowerCase().includes(q) ||
        conf.field.toLowerCase().includes(q) ||
        conf.location.toLowerCase().includes(q) ||
        (conf.description || "").toLowerCase().includes(q)
      );
    }
    return true;
  });
};

// Get unique fields from conferences
export const getConferenceFields = (conferences) => {
  return [...new Set(conferences.map((c) => c.field).filter(Boolean))].sort();
};
