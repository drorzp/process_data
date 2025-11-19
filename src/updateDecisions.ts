import { Pool } from 'pg';

function truncate(value: string | null, maxLength: number): string | null {
  if (value === null || value === undefined) {
    return value;
  }
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
function sanitizeText(value: string | null): string | null {
  if (value === null || value === undefined) {
    return value;
  }
  // Remove any NUL characters which PostgreSQL does not accept in text
  return value.replace(/\u0000/g, '');
}

export async function updateDecision(
  id: number,
  custom_keywords: string[],
  micro_summary: string,
  citation_reference: string,
  facts: string,
  court_order: string,
  outcome: string,
  pool: Pool
): Promise<boolean> {
  try {


    const query = `
      UPDATE decisions1 
      SET 
        custom_keywords = $1,
        micro_summary = $2,
        citation_reference = $3,
        facts = $4,
        court_order = $5,
        outcome = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;
    
    const sanitized_facts = sanitizeText(facts);
    const sanitized_court_order = sanitizeText(court_order);
    const sanitized_outcome = sanitizeText(outcome);
    const sanitized_micro_summary = sanitizeText(micro_summary);
    const sanitized_citation_reference = sanitizeText(citation_reference);
    const result = await pool.query(query, [
      custom_keywords,
      sanitized_micro_summary,
      sanitized_citation_reference,
      sanitized_facts,
      sanitized_court_order,
      sanitized_outcome,
      id
    ]);
    
    // Check if any rows were updated
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Successfully updated decision with id: ${id}`);
      return true;
    } else {
      console.log(`No decision found with id: ${id}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating decision with id ${id}:`, error);
    throw error;
  }
}

export async function insertRequests(decision_id: number, party_id: string, requests: string, pool: Pool): Promise<boolean> {
    try {
        const query = `
            INSERT INTO decision_requests (decision_id, party_id, requests)
            VALUES ($1, $2, $3)
        `;
        
        const sanitized_requests = sanitizeText(requests);
        const result = await pool.query(query, [
           decision_id,
            party_id,
            sanitized_requests
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted requests for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting requests for decision with id ${decision_id}:`, error);
        throw error;
    }
}

export async function insertArguments(decision_id: number, party_id: string, argument: string, treatment: string, pool: Pool): Promise<boolean> {
  console.log(`Inserting arguments for decision with id: ${decision_id} ${party_id} ${argument} ${treatment}`);
    try {
        const query = `
            INSERT INTO decision_arguments (decision_id, party_id, argument, treatment)
            VALUES ($1, $2, $3, $4)
        `;
        const sanitized_argument = sanitizeText(argument);
        const sanitized_treatment = sanitizeText(treatment);
        const result = await pool.query(query, [
           decision_id,
            party_id,
            sanitized_argument,
            sanitized_treatment
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted requests for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting decision_arguments for decision with id ${decision_id}:`, error);
        throw error;
    }
}

export async function insertParties(decision_id: number, party_id: string, party_name: string, party_type: string, procedural_role: string, pool: Pool): Promise<boolean> {
    try {
        const query = `
            INSERT INTO decision_parties (decision_id, party_id, party_name, party_type, procedural_role)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const sanitized_party_name = sanitizeText(party_name);
        const sanitized_procedural_role = sanitizeText(procedural_role);
        const result = await pool.query(query, [
           decision_id,
            party_id,
            sanitized_party_name,
            party_type,
            sanitized_procedural_role
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}

export async function insertCitedDecisions(
                decision_id: number,
                decision_sequence: number,
                court_jurisdiction_code: string, 
                court_name: string,
                cited_date: Date, 
                case_number: string| null,  
                ecli: string | null, 
                treatment: string, 
                cited_type: string, 
                internal_decision_id: string,
                pool: Pool
): Promise<boolean> {
    try {
           const query = `
            INSERT INTO cited_decisions(decision_id, decision_sequence, court_jurisdiction_code, court_name, cited_date, case_number, ecli, treatment, cited_type, internal_decision_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const sanitized_court_name = sanitizeText(court_name);
        const sanitized_court_jurisdiction_code = sanitizeText(court_jurisdiction_code);
        const sanitized_cited_type = sanitizeText(cited_type);
        const sanitized_treatment = sanitizeText(treatment);
        const result = await pool.query(query, [
           decision_id,
            decision_sequence,
            sanitized_court_jurisdiction_code,
            sanitized_court_name,
            cited_date,
            case_number,
            ecli,
            sanitized_treatment,
            sanitized_cited_type,
            internal_decision_id
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting cited_decisions for decision with id ${decision_id}:`, error);
        throw error;
    }
}


export async function insert_extracted_references(decision_id:number,url_eu:string[], url_be:string[], reference_eu_extracted:string[], reference_be_verified:string[], reference_be_extracted:string[], reference_be_verified_numac:string[], reference_be_verified_fileNumber:string[], pool: Pool): Promise<boolean> {
try {
        const query = `
            INSERT INTO decision_extracted_references (decision_id, url_eu, url_be, reference_eu_extracted, reference_be_verified, reference_be_extracted, reference_be_verified_numac, reference_be_verified_fileNumber)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const result = await pool.query(query, [
           decision_id,
            url_eu,
            url_be,
            reference_eu_extracted,
            reference_be_verified,
            reference_be_extracted,
            reference_be_verified_numac,
            reference_be_verified_fileNumber
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}

export async function insert_decisions_cited_provisions(
  decision_id: number, 
  provision_id: string | null, 
  parent_act_id: string | null,
  internal_provision_id: string | null,
  internal_parent_act_id: string | null,
  provision_number: string | null,
  provision_number_key: string | null,
  parent_act_type: string | null,
  parent_act_name: string | null,
  parent_act_date: Date | null,
  parent_act_number: string | null,
  provision_interpretation: string | null,
  relevant_factual_context: string | null,
  pool: Pool): Promise<boolean> {
    try {
        const query = `
            INSERT INTO decision_cited_provisions (decision_id, provision_id, parent_act_id, internal_provision_id, internal_parent_act_id, provision_number, provision_number_key, parent_act_type, parent_act_name, parent_act_date, parent_act_number, provision_interpretation, relevant_factual_context)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;
        
        const sanitized_provision_interpretation = sanitizeText(provision_interpretation);
        const sanitized_relevant_factual_context = sanitizeText(relevant_factual_context);
        const sanitized_parent_act_name = sanitizeText(parent_act_name);
        const sanitized_parent_act_number = sanitizeText(parent_act_number);
        const sanitized_provision_number = sanitizeText(provision_number);
        const sanitized_provision_number_key = sanitizeText(provision_number_key);
        const sanitized_parent_act_type = sanitizeText(parent_act_type);

        const result = await pool.query(query, [
           decision_id,
            provision_id,
            parent_act_id,
            internal_provision_id,
            internal_parent_act_id,
            sanitized_provision_number,
            sanitized_provision_number_key,
            sanitized_parent_act_type,
            sanitized_parent_act_name,
            parent_act_date,
            sanitized_parent_act_number,
            sanitized_provision_interpretation,
            sanitized_relevant_factual_context
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.log(parent_act_number)
        console.error(`Error inserting decisions_cited_provisions for decision with id ${decision_id}:`, error);
        throw error;
    }
}

export async function insert_decision_related_citations(
  decision_id: number, 
  internal_provision_id: string | null, 
  related_internal_provisions_id: string[] | null, 
  related_internal_decisions_id: string[] | null,
  pool: Pool): Promise<number> {
    try {
        const query = `
            INSERT INTO decision_related_citations (decision_id, internal_provision_id, related_internal_provisions_id, related_internal_decisions_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        
        const result = await pool.query(query, [
           decision_id,
            internal_provision_id,
            related_internal_provisions_id,
            related_internal_decisions_id
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            const newId = result.rows[0].id;
            console.log(`Successfully inserted decision_related_citations with id: ${newId}`);
            return newId;
        } else {
            console.log(`Failed to insert decision_related_citations for decision_id: ${decision_id}`);
            return -1;
        }
    } catch (error) {
        console.error(`Error inserting decision_related_citations for decision with id ${decision_id}:`, error);
        throw error;
    }
}


export async function insert_decision_related_citations_citations(
  decision_id: number, 
  decision_related_citations_id: number, 
  block_id: string | null, 
  relevant_snippet: string | null,
  pool: Pool): Promise<boolean> {
    try {
        const query = `
            INSERT INTO decision_related_citations_citations (decision_id, decision_related_citations_id, block_id, relevant_snippet)
            VALUES ($1, $2, $3, $4)
        `;

        const safe_relevant_snippet = sanitizeText(relevant_snippet);
        
        const result = await pool.query(query, [
           decision_id,
            decision_related_citations_id,
            block_id,
            safe_relevant_snippet
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting decision_related_citations_citations for decision with id ${decision_id}:`, error);
        throw error;
    }
}


export async function insert_decision_legal_teachings(
  decision_id: number,  
  teaching_id: string, 
  teaching_text: string | null, 
  court_verbatim: string | null,  
  court_verbatim_language: string | null, 
  factual_trigger: string | null,   
  relevant_factual_context: string | null, 
  principle_type: string | null, 
  legal_area: string | null,
  refines_parent_principle: string | null,
  refined_by_child_principles: string[] | null,
  exception_to_principle: string | null,
  excepted_by_principles: string[] | null,
  conflicts_with: string[] | null,
  court_level: string | null,
  teaching_binding: boolean | null,
  clarity: string | null,
  novel_principle: boolean | null,
  confirms_existing_doctrine: boolean | null,
  distinguishes_prior_case: boolean | null,
  related_legal_issues_id: string[] | null,
  related_cited_provisions_id: string[] | null,
  related_cited_decisions_id: string[] | null,
  source_author: string | null,
  pool: Pool): Promise<boolean> {
    try {
        const query = `
            INSERT INTO decision_legal_teachings (decision_id, 
            teaching_id, 
            teaching_text, 
            court_verbatim, 
            court_verbatim_language, 
            factual_trigger, 
            relevant_factual_context, 
            principle_type, 
            legal_area, 
            refines_parent_principle, 
            refined_by_child_principles, 
            exception_to_principle, 
            excepted_by_principles, 
            conflicts_with, 
            court_level, 
            teaching_binding, 
            clarity, 
            novel_principle, 
            confirms_existing_doctrine, 
            distinguishes_prior_case, 
            related_legal_issues_id, 
            related_cited_provisions_id,
             related_cited_decisions_id, 
             source_author)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        `;
        const sanitized_relevant_factual_context = sanitizeText(relevant_factual_context);
        const sanitized_teaching_text = sanitizeText(teaching_text);
        const sanitized_court_verbatim = sanitizeText(court_verbatim);  
        const sanitized_factual_trigger = sanitizeText(factual_trigger);  
        const sanitized_clarity = sanitizeText(clarity);  
        const sanitized_source_author = sanitizeText(source_author);
  
      const result = await pool.query(query, [
         decision_id,
         teaching_id,
          sanitized_teaching_text,
          sanitized_court_verbatim,
          court_verbatim_language,
          sanitized_factual_trigger,
          sanitized_relevant_factual_context,
          principle_type,
          legal_area,
          refines_parent_principle,
          refined_by_child_principles,
          exception_to_principle,
          excepted_by_principles,
          conflicts_with,
          court_level,
          teaching_binding,
          sanitized_clarity,
          novel_principle,
          confirms_existing_doctrine,
          distinguishes_prior_case,
          related_legal_issues_id,
          related_cited_provisions_id,
          related_cited_decisions_id,
          sanitized_source_author    
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        } else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    } catch (error) {
        console.error(`Error inserting decision_legal_teachings for decision with id ${decision_id}:`, error);
        throw error;
    }
}

export async function insert_decisions_related_citations_legal_teachings(  
  decision_id: number, 
  teaching_id: string, 
  pool: Pool): Promise<number> {
    try {
        const query = `
            INSERT INTO decision_related_citations_legal_teachings (decision_id, teaching_id)
            VALUES ($1, $2)
            RETURNING id
        `;
        
        const result = await pool.query(query, [
           decision_id,
            teaching_id
        ]);
        
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            const newId = result.rows[0].id;
            console.log(`Successfully inserted decision_related_citations with id: ${newId}`);
            return newId;
        } else {
            console.log(`Failed to insert decision_related_citations for decision_id: ${decision_id}`);
            return -1;
        };
        
    } catch (error) {
        console.error(`Error inserting decisions_related_citations_legal_teachings for decision with id ${decision_id}:`, error);
        throw error;
    }
}


export async function insert_decisions_related_citations_legal_teachings_citations(
  decision_id: number, 
  decision_related_citations_legal_teachings_id: number, 
  block_id: string | null, 
  relevant_snippet: string | null,
  pool: Pool): Promise<boolean> {
  try {
      const query = `
          INSERT INTO decision_related_citations_legal_teachings_citations (decision_id, decision_related_citations_legal_teachings_id, block_id, relevant_snippet)
          VALUES ($1, $2, $3, $4)
      `;
      const safe_relevant_snippet = sanitizeText(relevant_snippet);
      const result = await pool.query(query, [
          decision_id,
          decision_related_citations_legal_teachings_id,
          block_id,
          safe_relevant_snippet
      ]);
      
      // Check if any rows were inserted
      if (result.rowCount && result.rowCount > 0) {
          console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
          return true;
      } else {
          console.log(`No decision found with id: ${decision_id}`);
          return false;
      }
  } catch (error) {
      console.error(`Error inserting decisions_related_citations_legal_teachings_citations with id ${decision_id}:`, error);
      throw error;
  }
}
          