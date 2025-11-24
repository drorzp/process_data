-- DROP FUNCTION public.get_decision_json1(int4);

CREATE OR REPLACE FUNCTION public.get_decision_json1(p_id integer)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    result_json JSON;
    decisionIdHelper TEXT;  
BEGIN
    -- Return NULL if decision doesn't exist
    SELECT decision_id INTO decisionIdHelper
    FROM decisions1 
    WHERE id = p_id;
    
    -- Return NULL if decision doesn't exist
    IF decisionIdHelper IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Build the complete JSON structure
    SELECT (
        decision_data::jsonb ||
        jsonb_build_object(
            'summaries', summaries_data,
            'articles', articles_data,
            'similair', similair_data,
            'similar_keywords', similar_keywords_data,
            'fullHtml', fulltext_data
        )
    )::json
    INTO result_json
    FROM (
        -- Get decision data
        SELECT json_build_object(
            'id', d.id,
            'decision_id', d.decision_id,
            'file_name', d.file_name,
            'url_official_publication', d.url_official_publication,
            'language_metadata', d.language_metadata,
            'court_ecli_code', d.court_ecli_code,
            'decision_type_ecli_code', d.decision_type_ecli_code,
            'decision_date', d.decision_date,
            'versions', d.versions,
            'url_pdf', d.url_pdf,
            'rol_number',d.rol_number,
            'case',d.case,
            'chamber',d.chamber,
            'field_of_law',d.field_of_law,
            'opinion_public_attorney',d.opinion_public_attorney,
            'precedent',d.precedent,
            'cited_in',d.cited_in,
            'see_more_recently',d.see_more_recently,
            'preceded_by',d.preceded_by,
            'followed_by',d.followed_by,
            'rectification',d.rectification,
            'related_case',d.related_case,
            'source',d.source,
            'jurisdiction',d.jurisdiction,
            'citing',d.citing,
            'court_fr',d.courtfr,
            'court_nl', d.courtnl,
            'court_category', d.court_category,
            'decision_type_fr', d.decision_type_fr,
            'decision_type_nl', d.decision_type_nl,
 			'micro_summary',d.micro_summary,
  			'citation_reference',d.citation_reference,
    		'facts',d.facts,
   			'court_order',d.court_order,
			'keywords' ,d.keywords
        ) AS decision_data
        FROM vw_decisions d
        WHERE d.id = p_id
    ) d
    CROSS JOIN (
        -- Summaries
        SELECT COALESCE(
            json_agg(
                json_build_object(
                    'decision_id', decision_id,
                    'summary', summary,
                    'legalbasis', legalbasis,
                    'keywordsfree', keywordsfree
                )
            ),
            '[]'::json
        ) AS summaries_data
        FROM (
            SELECT decision_id, summary, legalbasis, keywordsfree
            FROM summaries 
            WHERE decision_id = p_id 
            LIMIT 8
        ) s
    ) s
    CROSS JOIN (
        -- Similar decisions with articles
        SELECT COALESCE(
            json_agg(
                json_build_object(
                    'id', sub.id,
                    'source_decisions_id', sub.source_decisions_id,
                    'matched_decisions_id', sub.matched_decisions_id,
                    'grade', sub.grade,
                    'matched_decision_details', json_build_object(
                        'court_fr', sub.court_fr,
						'court_nl', sub.court_nl,
                        'decision_date', sub.decision_date,
                        'decision_type_fr', sub.decision_type_fr,
						'decision_type_nl', sub.decision_type_nl,
                        'decision_id', sub.decision_id
                    ),
                    'articles', sub.articles
                )
            ),
            '[]'::json
        ) AS similair_data
        FROM (
            SELECT dx.id, dx.source_decisions_id, dx.matched_decisions_id, dx.grade,
                   md.courtfr AS court_fr,md.courtnl AS court_nl, md.decision_date, md.decision_type_fr,md.decision_type_nl, md.decision_id,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', da.id,
                               'decision_id', da.decision_id,
                               'summary_id', da.summary_id,
                               'edge', da.edge,
                               'legal_act_type', da.legal_act_type,
                               'article_number', da.article_number,
                               'url_text', da.url_text,
                               'url_justel', da.url_justel,
                               'law_document_id', da.law_document_id,
                               'created_at', da.created_at,
                               'article_link_number', da.article_link_number
                           )
                       ) FILTER (WHERE da.id IS NOT NULL),
                       '[]'::json
                   ) AS articles
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY matched_decisions_id ORDER BY grade DESC) as rn
                FROM similair_decisions1 
                WHERE source_decisions_id = p_id  
   
            ) dx
            LEFT JOIN vw_decisions md ON dx.matched_decisions_id = md.id  -- Changed to md.id since target_decision_id is INTEGER
            LEFT JOIN decision_articles da ON md.decision_id = da.decision_id AND da.language='FR'  -- Using md.decision_id (TEXT) for articles
            WHERE dx.rn = 1
            GROUP BY dx.id, dx.source_decisions_id, dx.matched_decisions_id, dx.grade,
                     md.courtfr,md.courtnl, md.decision_date, md.decision_type_fr, md.decision_type_nl, md.decision_id
            ORDER BY dx.grade DESC
            LIMIT 10
        ) AS sub
    ) x
CROSS JOIN (
    -- Articles with document title
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', da.id,
                'summary_id', da.summary_id,
                'edge', da.edge,
                'legal_act_type', da.legal_act_type,
                'article_number', da.article_number,
                'url_text', da.url_text,
                'url_justel', da.url_justel,
                'law_document_id', da.law_document_id,
                'created_at', da.created_at,
                'article_link_number', da.article_link_number,
                'document_title', d.title,  -- Added document title here
                'status', CASE
                    WHEN ac.id IS NOT NULL THEN 'Valid'
                    ELSE 'Expired'
                END
            )
        ),
        '[]'::json
    ) AS articles_data
    FROM decision_articles da
    LEFT JOIN public.article_contents ac
        ON da.law_document_id = ac.document_number
        AND da.article_link_number = ac.article_number
    LEFT JOIN public.documents d
        ON da.law_document_id = d.document_number  -- Join to get document title
    WHERE da.decision_id = decisionIdHelper
        AND da.language = 'FR'
) a

    CROSS JOIN (
        -- Keywords for similar decisions
        SELECT COALESCE(
            json_object_agg(
                keyword_groups.matched_decisions_id,
                json_build_object(
                    'target_decision_id', keyword_groups.matched_decisions_id,
                    'keywords', keyword_groups.keyword_list
                )
            ),
            '{}'::json
        ) AS similar_keywords_data
        FROM (
            SELECT
                dx.matched_decisions_id,
                json_agg(
                    DISTINCT jsonb_build_object(
                        'keyword_type', k.keyword_type,
                        'keyword', k.keyword
                    )
                ) AS keyword_list
            FROM similair_decisions1 dx
            INNER JOIN decisions_summaries_keywords kd ON dx.matched_decisions_id = kd.decision_id  -- target_decision_id (INT) matches kd.decision_id (INT)
            LEFT JOIN keywords1 k ON kd.keyword_id = k.id
            WHERE dx.source_decisions_id = p_id  -- Using p_id (INTEGER) since source_decision_id is INTEGER
            GROUP BY dx.matched_decisions_id
        ) keyword_groups
    ) sk
    CROSS JOIN (
        -- Fulltext - simplified version
        SELECT COALESCE(
            TRIM(full_html),
            ''
        ) AS fulltext_data
        FROM public.decision_fulltext1
        WHERE decision_id = p_id  -- Assuming this uses the integer ID
    ) ft;
    
    RETURN result_json;
END;
$function$
;
