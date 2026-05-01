// User Model — defines the structure for user data in Firestore
export const createUserModel = ({
  uid,
  email,
  displayName = "",
  university = "",
  role = "Researcher",
  researchInterests = [],
  photoURL = "",
}) => ({
  uid,
  email,
  displayName,
  university,
  role, // "PhD Scholar", "Researcher", "Academician"
  researchInterests,
  photoURL,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Saved Paper Model
export const createSavedPaperModel = ({
  paperId,
  title,
  authors = [],
  year = null,
  journal = "",
  doi = "",
  citationCount = 0,
  abstract = "",
  url = "",
  openAccessPdf = null,
  userId,
}) => ({
  paperId,
  title,
  authors,
  year,
  journal,
  doi,
  citationCount,
  abstract,
  url,
  openAccessPdf,
  userId,
  savedAt: new Date().toISOString(),
});

// Citation Model
export const createCitationModel = ({
  paperId = "",
  title,
  authors = [],
  year = null,
  journal = "",
  doi = "",
  url = "",
  style = "APA",
  formattedCitation = "",
  userId,
}) => ({
  paperId,
  title,
  authors,
  year,
  journal,
  doi,
  url,
  style,
  formattedCitation,
  userId,
  createdAt: new Date().toISOString(),
});

// Activity Model
export const createActivityModel = ({
  userId,
  type = "general",
  title,
  detail = "",
}) => ({
  userId,
  type,
  title,
  detail,
  createdAt: new Date().toISOString(),
});

// Journal Model
export const createJournalModel = ({
  name,
  domain = "",
  impactFactor = 0,
  indexing = [],
  scopeKeywords = [],
  reviewTime = "",
  website = "",
  publisher = "",
}) => ({
  name,
  domain,
  impactFactor,
  indexing,
  scopeKeywords,
  reviewTime,
  website,
  publisher,
  addedAt: new Date().toISOString(),
});

// Conference Model
export const createConferenceModel = ({
  name,
  field = "",
  location = "",
  submissionDeadline = "",
  eventDate = "",
  mode = "offline",
  website = "",
  description = "",
}) => ({
  name,
  field,
  location,
  submissionDeadline,
  eventDate,
  mode, // "online", "offline", "hybrid"
  website,
  description,
  addedAt: new Date().toISOString(),
});

// Thesis / Case Study Model
export const createThesisModel = ({
  title,
  author = "",
  university = "",
  field = "",
  abstract = "",
  fileUrl = "",
  type = "thesis",
}) => ({
  title,
  author,
  university,
  field,
  abstract,
  fileUrl,
  type, // "thesis" or "case_study"
  addedAt: new Date().toISOString(),
});
