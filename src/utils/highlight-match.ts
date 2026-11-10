export interface TextPart {
  text: string
  /** The letters that match the search query. Shown bold. */
  match: boolean
}

/**
 * Splits `text` around the first place `query` appears, ignoring case (Ukrainian too).
 * Returns plain text parts, so the caller renders them as text and never as HTML.
 */
export function highlightMatch(text: string, query: string): TextPart[] {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) {
    return [{ text, match: false }]
  }

  // Compare slices of the original text, so the indexes stay right even if lower-casing changes a length.
  for (let start = 0; start + needle.length <= text.length; start++) {
    const candidate = text.slice(start, start + needle.length)
    if (candidate.toLocaleLowerCase() === needle) {
      const end = start + needle.length
      return [
        { text: text.slice(0, start), match: false },
        { text: candidate, match: true },
        { text: text.slice(end), match: false },
      ].filter(part => part.text)
    }
  }

  return [{ text, match: false }]
}
