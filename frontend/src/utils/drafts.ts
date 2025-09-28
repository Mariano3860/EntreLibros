export type DraftWithMeta<TDraft> = TDraft & { updatedAt?: number }

export const stripDraftMeta = <TDraft>(
  draft: DraftWithMeta<TDraft> | null
): TDraft | null => {
  if (!draft) return null
  const { updatedAt: _updatedAt, ...rest } = draft
  return rest
}
