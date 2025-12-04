-- DROP FUNCTION public.get_decision_metadata(int4);

CREATE OR REPLACE FUNCTION public.get_decision_metadata(p_id integer)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'decision_id', dm.decision_id,
        'language_metadata',dm.language_metadata,
        'prosecution_present', dm.prosecution_present,
        'parties', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'decision_id', dmp.decision_id,
                    'party_id', dmp.party_id,
                    'role_procedural', dmp.role_procedural,
                    'role_specific', dmp.role_specific,
                    'identity_name', dmp.identity_name,
                    'identity_type', dmp.identity_type,
                    'representation_type', dmp.representation_type,
                    'rep_name', dmp.rep_name,
					'rep_title',dmp.rep_title,
 					'rep_function', dmp.rep_function
                ) ORDER BY dmp.id
            ), '[]'::json)
            FROM public.decisions_metadata_parties dmp
            WHERE dmp.decision_id = p_id
        ),
        'officials', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'decision_id', dof.decision_id,
                    'officials_name', dof.officials_name,
                    'officials_function', dof.officials_function,
                    'officials_opinion', dof.officials_opinion,
                    'officials_position', dof.officials_position
                ) ORDER BY dof.id
            ), '[]'::json)
            FROM public.decision_officials dof
            WHERE dof.decision_id = p_id
        ),
        'judges', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'decision_id', dj.decision_id,
                    'judge_name', dj.judge_name,
                    'judge_title', dj.title
                ) ORDER BY dj.id
            ), '[]'::json)
            FROM public.decision_judges dj
            WHERE dj.decision_id = p_id
        ),
       'prosecutions', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'decision_id', pr.decision_id,
                    'pr_name', pr.pr_name,
                    'pr_function', pr.pr_function
                ) ORDER BY pr.id
            ), '[]'::json)
            FROM public.prosecution pr
            WHERE pr.decision_id = p_id
        ),
        'law_citations', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'decision_id', lc.decision_id,
                    'name', lc.law_citation_name,
                    'articles', lc.articles,
                    'enactment_date', lc.enactment_date,
                    'eli', lc.eli,
                    'url', lc.url
                ) ORDER BY lc.id
            ), '[]'::json)
            FROM public.law_citations lc
            WHERE lc.decision_id = p_id
        )
    ) INTO result
    FROM public.decisions_metadata dm
    WHERE dm.id = p_id;

    -- If no decision found, return NULL or an empty JSON object
    IF result IS NULL THEN
        result := json_build_object(
            'error', 'Decision not found',
            'decision_id', p_id
        );
    END IF;

    RETURN result;
END;
$function$
;
