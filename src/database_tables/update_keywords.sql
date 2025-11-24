CREATE OR REPLACE PROCEDURE public.update_custom_keywords()
LANGUAGE plpgsql
AS $procedure$
DECLARE
    rows_updated INT;
    sample_id BIGINT;
    sample_length INT;
BEGIN
    -- Update decisions where custom_keywords IS NULL and they have keywords
    WITH keyword_arrays AS (
        SELECT
            d.decision_id,
            ARRAY_AGG(DISTINCT LEFT(k.keyword, 255) ORDER BY LEFT(k.keyword, 255)) as keywords  -- Added DISTINCT
        FROM decisions_summaries_keywords d
        INNER JOIN keywords1 k ON d.keyword_id = k.id
        WHERE k.keyword IS NOT NULL
        GROUP BY d.decision_id
    )
    UPDATE decisions1
    SET custom_keywords_s = ka.keywords
    FROM keyword_arrays ka
    WHERE decisions1.id = ka.decision_id
    AND decisions1.custom_keywords IS NULL;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;

    RAISE NOTICE 'Updated % decisions with keywords', rows_updated;

    -- Check a sample to verify it worked
    SELECT id, array_length(custom_keywords_s, 1)
    INTO sample_id, sample_length
    FROM decisions1
    WHERE custom_keywords_s IS NOT NULL
    AND custom_keywords IS NULL
    LIMIT 1;

    RAISE NOTICE 'Sample check - Decision %: array length = %', sample_id, sample_length;

    COMMIT;
END;                             