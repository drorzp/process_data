"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDecision = updateDecision;
exports.insertRequests = insertRequests;
exports.insertArguments = insertArguments;
exports.insertParties = insertParties;
exports.insertCitedDecisions = insertCitedDecisions;
exports.insert_decisions_cited_provisions = insert_decisions_cited_provisions;
exports.insert_decision_related_citations = insert_decision_related_citations;
exports.insert_decision_related_citations_citations = insert_decision_related_citations_citations;
exports.insert_decision_legal_teachings = insert_decision_legal_teachings;
exports.insert_decisions_related_citations_legal_teachings = insert_decisions_related_citations_legal_teachings;
exports.insert_decisions_related_citations_legal_teachings_citations = insert_decisions_related_citations_legal_teachings_citations;
async function updateDecision(id, custom_keywords, micro_summary, citation_reference, facts, court_order, outcome, pool) {
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
        const result = await pool.query(query, [
            custom_keywords,
            micro_summary,
            citation_reference,
            facts,
            court_order,
            outcome,
            id
        ]);
        // Check if any rows were updated
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully updated decision with id: ${id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error updating decision with id ${id}:`, error);
        throw error;
    }
}
async function insertRequests(decision_id, party_id, requests, pool) {
    try {
        const query = `
            INSERT INTO decision_requests (decision_id, party_id, requests)
            VALUES ($1, $2, $3)
        `;
        const result = await pool.query(query, [
            decision_id,
            party_id,
            requests
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted requests for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting requests for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insertArguments(decision_id, party_id, argument, treatment, pool) {
    console.log(`Inserting arguments for decision with id: ${decision_id} ${party_id} ${argument} ${treatment}`);
    try {
        const query = `
            INSERT INTO decision_arguments (decision_id, party_id, argument, treatment)
            VALUES ($1, $2, $3, $4)
        `;
        const result = await pool.query(query, [
            decision_id,
            party_id,
            argument,
            treatment
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted requests for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting requests for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insertParties(decision_id, party_id, party_name, party_type, procedural_role, pool) {
    try {
        const query = `
            INSERT INTO decision_parties (decision_id, party_id, party_name, party_type, procedural_role)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const result = await pool.query(query, [
            decision_id,
            party_id,
            party_name,
            party_type,
            procedural_role
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insertCitedDecisions(decision_id, decision_sequence, court_jurisdiction_code, court_name, cited_date, case_number, ecli, treatment, cited_type, internal_decision_id, pool) {
    try {
        const query = `
            INSERT INTO cited_decisions(decision_id, decision_sequence, court_jurisdiction_code, court_name, cited_date, case_number, ecli, treatment, cited_type, internal_decision_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const result = await pool.query(query, [
            decision_id,
            decision_sequence,
            court_jurisdiction_code,
            court_name,
            cited_date,
            case_number,
            ecli,
            treatment,
            cited_type,
            internal_decision_id
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insert_decisions_cited_provisions(decision_id, provision_id, parent_act_id, internal_provision_id, internal_parent_act_id, provision_number, provision_number_key, parent_act_type, parent_act_name, parent_act_date, parent_act_number, provision_interpretation, relevant_factual_context, pool) {
    try {
        const query = `
            INSERT INTO decision_cited_provisions (decision_id, provision_id, parent_act_id, internal_provision_id, internal_parent_act_id, provision_number, provision_number_key, parent_act_type, parent_act_name, parent_act_date, parent_act_number, provision_interpretation, relevant_factual_context)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;
        const result = await pool.query(query, [
            decision_id,
            provision_id,
            parent_act_id,
            internal_provision_id,
            internal_parent_act_id,
            provision_number,
            provision_number_key,
            parent_act_type,
            parent_act_name,
            parent_act_date,
            parent_act_number,
            provision_interpretation,
            relevant_factual_context
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insert_decision_related_citations(decision_id, internal_provision_id, related_internal_provisions_id, related_internal_decisions_id, pool) {
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
        }
        else {
            console.log(`Failed to insert decision_related_citations for decision_id: ${decision_id}`);
            return -1;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insert_decision_related_citations_citations(decision_id, decision_related_citations_id, block_id, relevant_snippet, pool) {
    try {
        const query = `
            INSERT INTO decision_related_citations_citations (decision_id, decision_related_citations_id, block_id, relevant_snippet)
            VALUES ($1, $2, $3, $4)
        `;
        const result = await pool.query(query, [
            decision_id,
            decision_related_citations_id,
            block_id,
            relevant_snippet
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insert_decision_legal_teachings(decision_id, teaching_id, teaching_text, court_verbatim, court_verbatim_language, factual_trigger, relevant_factual_context, principle_type, legal_area, refines_parent_principle, refined_by_child_principles, exception_to_principle, excepted_by_principles, conflicts_with, court_level, teaching_binding, clarity, novel_principle, confirms_existing_doctrine, distinguishes_prior_case, related_legal_issues_id, related_cited_provisions_id, related_cited_decisions_id, source_author, pool) {
    try {
        const query = `
            INSERT INTO decision_legal_teachings (decision_id, teaching_id, teaching_text, court_verbatim, court_verbatim_language, factual_trigger, relevant_factual_context, principle_type, legal_area, refines_parent_principle, refined_by_child_principles, exception_to_principle, excepted_by_principles, conflicts_with, court_level, teaching_binding, clarity, novel_principle, confirms_existing_doctrine, distinguishes_prior_case, related_legal_issues_id, related_cited_provisions_id, related_cited_decisions_id, source_author)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        `;
        const result = await pool.query(query, [
            decision_id,
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
            source_author
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insert_decisions_related_citations_legal_teachings(decision_id, teaching_id, pool) {
    try {
        const query = `
            INSERT INTO decision_related_citations_legal_teachings (decision_id, teaching_id)
            VALUES ($1, $2)
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
        }
        else {
            console.log(`Failed to insert decision_related_citations for decision_id: ${decision_id}`);
            return -1;
        }
        ;
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
async function insert_decisions_related_citations_legal_teachings_citations(decision_id, decision_related_citations_legal_teachings_id, block_id, relevant_snippet, pool) {
    try {
        const query = `
          INSERT INTO decision_related_citations_legal_teachings_citations (decision_id, decision_related_citations_legal_teachings_id, block_id, relevant_snippet)
          VALUES ($1, $2, $3, $4)
      `;
        const result = await pool.query(query, [
            decision_id,
            decision_related_citations_legal_teachings_id,
            block_id,
            relevant_snippet
        ]);
        // Check if any rows were inserted
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Successfully inserted parties for decision with id: ${decision_id}`);
            return true;
        }
        else {
            console.log(`No decision found with id: ${decision_id}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error inserting parties for decision with id ${decision_id}:`, error);
        throw error;
    }
}
//# sourceMappingURL=updateDecisions.js.map