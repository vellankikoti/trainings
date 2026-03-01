-- 003_add_discussions.sql
-- Description: Add discussion/comment system for lesson-level discussions
-- Rollback: DROP TABLE IF EXISTS discussion_votes; DROP TABLE IF EXISTS discussions;

CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  parent_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  is_flagged BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- Row Level Security
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-deleted discussions"
  ON discussions FOR SELECT
  USING (is_deleted = FALSE);

CREATE POLICY "Users can create discussions"
  ON discussions FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can edit own discussions"
  ON discussions FOR UPDATE
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Anyone can view votes"
  ON discussion_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote"
  ON discussion_votes FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can change own votes"
  ON discussion_votes FOR DELETE
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discussions_lesson ON discussions(lesson_slug);
CREATE INDEX IF NOT EXISTS idx_discussions_parent ON discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_votes_discussion ON discussion_votes(discussion_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_discussion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_discussion_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_discussion_updated_at();
