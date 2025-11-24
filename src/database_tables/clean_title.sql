CREATE OR REPLACE FUNCTION clean_law_title(raw text)
RETURNS text
LANGUAGE sql
AS $$
  WITH removed_dates AS (
    SELECT regexp_replace(
             raw,
             -- connector + day + month + year
             '\s*(van|du|de|des|le|la|vom)\s+[0-9]{1,2}\s+' ||
             '(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|' ||  -- NL
             'janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre|' || -- FR
             'januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)' ||  -- DE (case-insensitive)
             '\s+[0-9]{4}',
             '',
             'gi'
           ) AS s
  )
  SELECT
    CASE
      -- after removing the date, if it’s just "wet" or "octrooiwet" etc., blank it
      WHEN lower(trim(s)) IN ('wet', 'octrooiwet') THEN ''
      ELSE trim(s)
    END
  FROM removed_dates;
$$;