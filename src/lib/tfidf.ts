export type SimilarityDocument = {
  id: string
  title: string
  authors: string
  abstract: string
  keywords: string[]
  program: string
}

export type SimilarityResult = {
  id: string
  score: number
}

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'this',
  'to',
  'using',
  'with',
])

function normalizeToken(token: string) {
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3)
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2)
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2)
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

export function tokenize(text: string) {
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !stopWords.has(token))
    .map(normalizeToken)
}

function documentTokens(document: SimilarityDocument) {
  return tokenize(
    [
      document.title,
      document.title,
      document.title,
      document.keywords.join(' '),
      document.keywords.join(' '),
      document.abstract,
      document.authors,
      document.program,
    ].join(' '),
  )
}

function buildIDF(tokenSets: string[][]) {
  const documentCount = tokenSets.length
  const documentFrequency = new Map<string, number>()

  tokenSets.forEach((tokens) => {
    new Set(tokens).forEach((token) => {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    })
  })

  return new Map(
    [...documentFrequency].map(([token, frequency]) => [
      token,
      Math.log((documentCount + 1) / (frequency + 1)) + 1,
    ]),
  )
}

function vectorize(tokens: string[], idf: Map<string, number>) {
  const counts = new Map<string, number>()
  tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1))

  const vector = new Map<string, number>()
  const length = Math.max(tokens.length, 1)
  counts.forEach((count, token) => {
    const inverseDocumentFrequency = idf.get(token)
    if (inverseDocumentFrequency) {
      vector.set(token, (count / length) * inverseDocumentFrequency)
    }
  })
  return vector
}

export function cosineSimilarity(left: Map<string, number>, right: Map<string, number>) {
  let dotProduct = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  left.forEach((value, token) => {
    dotProduct += value * (right.get(token) ?? 0)
    leftMagnitude += value * value
  })
  right.forEach((value) => {
    rightMagnitude += value * value
  })

  if (!leftMagnitude || !rightMagnitude) return 0
  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
}

function buildVectors(documents: SimilarityDocument[]) {
  const tokenSets = documents.map(documentTokens)
  const idf = buildIDF(tokenSets)
  return {
    idf,
    vectors: tokenSets.map((tokens) => vectorize(tokens, idf)),
  }
}

export function rankStudies(documents: SimilarityDocument[], query: string): SimilarityResult[] {
  if (!query.trim() || documents.length === 0) return []

  const { idf, vectors } = buildVectors(documents)
  const queryVector = vectorize(tokenize(query), idf)

  return documents
    .map((document, index) => ({
      id: document.id,
      score: cosineSimilarity(queryVector, vectors[index]),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
}

export function buildRelatedStudyIndex(documents: SimilarityDocument[], limit = 3) {
  const { vectors } = buildVectors(documents)

  return Object.fromEntries(
    documents.map((document, documentIndex) => [
      document.id,
      documents
        .map((candidate, candidateIndex) => ({
          id: candidate.id,
          score:
            documentIndex === candidateIndex
              ? -1
              : cosineSimilarity(vectors[documentIndex], vectors[candidateIndex]),
        }))
        .filter((result) => result.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, limit),
    ]),
  )
}
