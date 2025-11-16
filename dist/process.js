"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFile = processFile;
exports.findById = findById;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const updateDecisions_1 = require("./updateDecisions");
// Type definitions for Legal Decision JSON structure
async function processFile(fileName, pool) {
    try {
        console.log(`Processing file: ${fileName}`);
        // Read the JSON file
        const filePath = path_1.default.join(__dirname, 'imported_files', fileName);
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        // Parse JSON content into an object
        const jsonData = JSON.parse(fileContent);
        console.log(`Parsed JSON for ${fileName}:`, jsonData.decision_id);
        const decisionId = await findById(jsonData.decision_id, pool);
        console.log(` decision id: ${decisionId}`);
        if (decisionId === -1) {
            console.log(`Decision not found in database: ${jsonData.decision_id}. Copying to errors folder.`);
            // Create errors directory if it doesn't exist
            const errorsDir = path_1.default.join(__dirname, 'errors');
            if (!fs_1.default.existsSync(errorsDir)) {
                fs_1.default.mkdirSync(errorsDir, { recursive: true });
            }
            // Copy file to errors folder
            const errorFilePath = path_1.default.join(errorsDir, fileName);
            fs_1.default.copyFileSync(filePath, errorFilePath);
            console.log(`File copied to: ${errorFilePath}`);
            return; // Skip to next file
        }
        await (0, updateDecisions_1.updateDecision)(decisionId, jsonData.customKeywords, jsonData.microSummary, jsonData.citation_reference, jsonData.currentInstance.facts, jsonData.currentInstance.courtOrder, jsonData.currentInstance.outcome, pool);
        jsonData.currentInstance.requests.forEach(async (request) => {
            await (0, updateDecisions_1.insertRequests)(decisionId, request.partyId, request.requests, pool);
        });
        jsonData.currentInstance.arguments.forEach(async (argument) => {
            await (0, updateDecisions_1.insertArguments)(decisionId, argument.partyId, argument.argument, argument.treatment, pool);
        });
        jsonData.parties.forEach(async (party) => {
            await (0, updateDecisions_1.insertParties)(decisionId, party.id, party.name, party.type, party.proceduralRole, pool);
        });
        jsonData.citedDecisions.forEach(async (citedDecision) => {
            await (0, updateDecisions_1.insertCitedDecisions)(decisionId, decisionId, citedDecision.decision_sequence, citedDecision.court_jurisdiction_code, citedDecision.court_name, citedDecision.cited_date, citedDecision.case_number, citedDecision.ecli, citedDecision.treatment, citedDecision.cited_type, citedDecision.internal_decision_id, pool);
        });
        jsonData.citedProvisions.forEach(async (citedProvision) => {
            await (0, updateDecisions_1.insert_decisions_cited_provisions)(decisionId, citedProvision.provision_id, citedProvision.parent_act_id, citedProvision.internal_provision_id, citedProvision.internal_parent_act_id, citedProvision.provision_number, citedProvision.provision_number_key, citedProvision.parent_act_type, citedProvision.parent_act_name, citedProvision.parent_act_date, citedProvision.parent_act_number, citedProvision.provision_interpretation, citedProvision.relevant_factual_context, pool);
        });
        jsonData.relatedCitationsLegalProvisions.citedProvisions.forEach(async (citedProvision) => {
            const decisionRelatedCitationsId = await (0, updateDecisions_1.insert_decision_related_citations)(decisionId, citedProvision.internal_provision_id, citedProvision.relatedInternal_provisions_id, citedProvision.related_internal_decisions_id, pool);
            citedProvision.citations.forEach(async (citation) => {
                await (0, updateDecisions_1.insert_decision_related_citations_citations)(decisionId, decisionRelatedCitationsId, citation.block_id, citation.relevant_snippet, pool);
            });
        });
        jsonData.legalTeachings.forEach(async (legalTeaching) => {
            await (0, updateDecisions_1.insert_decision_legal_teachings)(decisionId, legalTeaching.teaching_id, legalTeaching.teaching_text, legalTeaching.court_verbatim, legalTeaching.court_verbatim_language, legalTeaching.factual_trigger, legalTeaching.relevant_factual_context, legalTeaching.principle_type, legalTeaching.legal_area, legalTeaching.hierarchical_relationships.refines_parent_principle, legalTeaching.hierarchical_relationships.refined_byChild_principles, legalTeaching.hierarchical_relationships.exception_to_principle, legalTeaching.hierarchical_relationships.excepted_by_principles, legalTeaching.hierarchical_relationships.conflicts_with, legalTeaching.precedential_weight.court_level, legalTeaching.precedential_weight.binding, legalTeaching.precedential_weight.clarity, legalTeaching.precedential_weight.novel_principle, legalTeaching.precedential_weight.confirms_existing_doctrine, legalTeaching.precedential_weight.distinguishes_prior_case, legalTeaching.related_legal_issues_id, legalTeaching.related_cited_provisions_id, legalTeaching.related_cited_decisions_id, legalTeaching.source_author, pool);
        });
        jsonData.relatedCitationsLegalTeachings.legalTeachings.forEach(async (legalTeachings) => {
            const decision_related_citations_legal_teachings_id = await (0, updateDecisions_1.insert_decisions_related_citations_legal_teachings)(decisionId, legalTeachings.teaching_id, pool);
            legalTeachings.citations.forEach(async (citation) => {
                await (0, updateDecisions_1.insert_decisions_related_citations_legal_teachings_citations)(decisionId, decision_related_citations_legal_teachings_id, citation.block_id, citation.relevant_snippet, pool);
            });
        });
    }
    catch (error) {
        console.error(`Error processing file ${fileName}:`, error);
        throw error;
    }
}
async function findById(decision_id, pool) {
    try {
        const query = 'SELECT id FROM decisions1 WHERE decision_id = $1';
        const result = await pool.query(query, [decision_id]);
        if (result.rows.length > 0) {
            return result.rows[0].id;
        }
        else {
            return -1;
        }
    }
    catch (error) {
        console.error(`Error finding decision_id ${decision_id}:`, error);
        throw error;
    }
}
//# sourceMappingURL=process.js.map