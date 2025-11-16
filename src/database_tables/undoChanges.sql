-- ============================================
-- ROLLBACK SCRIPT - Undo all database changes
-- ============================================
-- Execute this script to reverse all changes made by the original migration
-- WARNING: This will delete all data in the affected tables and columns

-- Drop all created tables (in reverse order)
DROP TABLE IF EXISTS decision_legal_teachings;
DROP TABLE IF EXISTS decision_related_citations_legal_teachings_citations;
DROP TABLE IF EXISTS decision_related_citations_legal_teachings;
DROP TABLE IF EXISTS decision_related_citations_citations;
DROP TABLE IF EXISTS decision_related_citations;
DROP TABLE IF EXISTS decision_cited_provisions;
DROP TABLE IF EXISTS cited_decisions;
DROP TABLE IF EXISTS decision_arguments;
DROP TABLE IF EXISTS decision_requests;
DROP TABLE IF EXISTS decision_parties;

-- Remove columns added to decisions1
ALTER TABLE decisions1 
DROP COLUMN IF EXISTS outcome;

ALTER TABLE decisions1 
DROP COLUMN IF EXISTS court_order;

ALTER TABLE decisions1 
DROP COLUMN IF EXISTS facts;

ALTER TABLE decisions1 
DROP COLUMN IF EXISTS citation_reference;

ALTER TABLE decisions1 
DROP COLUMN IF EXISTS micro_summary;

ALTER TABLE decisions1 
DROP COLUMN IF EXISTS custom_keywords;

ALTER TABLE decisions_metadata 
ADD COLUMN court_order TEXT;

ALTER TABLE decisions_metadata 
ADD COLUMN decision_outcome VARCHAR(30);

ALTER TABLE decisions_metadata 
DROP COLUMN IF EXISTS decision_recap;


-- NOTE: The following columns were DROPPED from decisions_metadata in the original script.
-- They cannot be automatically restored without knowing their original definitions.
-- If you need to restore these columns, you must manually define them:
-- 
-- ALTER TABLE decisions_metadata ADD COLUMN decision_recap TEXT; -- (adjust type as needed)
-- ALTER TABLE decisions_metadata ADD COLUMN court_order TEXT; -- (adjust type as needed)
-- ALTER TABLE decisions_metadata ADD COLUMN decision_outcome VARCHAR(50); -- (adjust type as needed)