delete from documents d 
where title like '%Coordination officieuse en langue allemande%'


delete from article_contents
WHERE document_number IN (
    SELECT document_number
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
    
    delete from article_contents_saver
WHERE document_number IN (
    SELECT document_number
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
        
    delete from document_modified_by
WHERE document_id IN (
    SELECT  id::text
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
    delete from document_versions
WHERE document_id IN (
    SELECT  id::text
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
    
delete from hierarchy_elements
WHERE document_id IN (
    SELECT  id::text
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
delete from external_links
WHERE document_id IN (
    SELECT  id::text
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
delete from extraction_metadata em 
WHERE document_id IN (
    SELECT  id::text
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
    
delete from keyword_matches
WHERE source_decision_id  IN (
    SELECT  id
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
delete from law_citations
WHERE decision_id  IN (
    SELECT  id
    FROM documents d
    WHERE title LIKE '%Coordination officieuse en langue allemande%')
    
    
    
    
    