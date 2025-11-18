
DROP TABLE IF EXISTS decision_legal_teachings;
DROP TABLE IF EXISTS decision_related_citations_legal_teachings_citations;
DROP TABLE IF EXISTS decision_related_citations_legal_teachings;
DROP TABLE IF EXISTS decision_related_citations_citations;
DROP TABLE IF EXISTS decision_related_citations;
DROP TABLE IF EXISTS decision_cited_provisions;
DROP TABLE IF EXISTS cited_decisions;
DROP TABLE IF EXISTS decision_arguments;
DROP TABLE IF EXISTS decision_requests;
DROP TABLE IF EXISTS decision_extracted_references;
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


