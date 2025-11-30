CREATE OR REPLACE FUNCTION public.strip_before_first_year(raw text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
    m text[];
    first_year_pos int;
    result text;
BEGIN
    -- Find first year: 1000–2999
    SELECT regexp_matches(raw, '(1[0-9]{3}|2[0-9]{3})')
    INTO m;

    -- No year found → return as-is
    IF m IS NULL THEN
        RETURN raw;
    END IF;

    -- Position of the first year
    first_year_pos := strpos(raw, m[1]);

    -- Year not found or outside first 35 chars → return original
    IF first_year_pos = 0 OR first_year_pos > 35 THEN
        RETURN raw;
    END IF;

    -- Strip everything before + including the year
    result := ltrim(substr(raw, first_year_pos + 4));

    -- Remove leading ')'
    IF result LIKE ')%' THEN
        result := ltrim(substr(result, 2));
    END IF;

    -- Empty result → return ''
    IF result IS NULL OR btrim(result) = '' THEN
        RETURN '';
    END IF;

    RETURN result;
END;
$function$;
