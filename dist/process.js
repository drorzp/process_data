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
        for (const request of jsonData.currentInstance.requests) {
            await (0, updateDecisions_1.insertRequests)(decisionId, request.partyId, request.requests, pool);
        }
        for (const argument of jsonData.currentInstance.arguments) {
            await (0, updateDecisions_1.insertArguments)(decisionId, argument.partyId, argument.argument, argument.treatment, pool);
        }
        for (const party of jsonData.parties) {
            await (0, updateDecisions_1.insertParties)(decisionId, party.id, party.name, party.type, party.proceduralRole, pool);
        }
        for (const citedDecision of jsonData.citedDecisions) {
            await (0, updateDecisions_1.insertCitedDecisions)(decisionId, citedDecision.decisionSequence, citedDecision.courtJurisdictionCode, citedDecision.courtName, citedDecision.date, citedDecision.caseNumber, citedDecision.ecli, citedDecision.treatment, citedDecision.type, citedDecision.internalDecisionId, pool);
        }
        for (const citedProvision of jsonData.citedProvisions) {
            await (0, updateDecisions_1.insert_decisions_cited_provisions)(decisionId, citedProvision.provisionId, citedProvision.parentActId, citedProvision.internalProvisionId, citedProvision.internalParentActId, citedProvision.provisionNumber, citedProvision.provisionNumberKey, citedProvision.parentActType, citedProvision.parentActName, citedProvision.parentActDate, citedProvision.parentActNumber, citedProvision.provisionInterpretation, citedProvision.relevantFactualContext, pool);
        }
        await (0, updateDecisions_1.insert_extracted_references)(decisionId, jsonData.extractedReferences.url_eu, jsonData.extractedReferences.url_be, jsonData.extractedReferences.reference_eu_extracted, jsonData.extractedReferences.reference_be_verified, jsonData.extractedReferences.reference_be_extracted, jsonData.extractedReferences.reference_be_verified_numac, jsonData.extractedReferences.reference_be_verified_fileNumber, pool);
        for (const citedProvision of jsonData.relatedCitationsLegalProvisions.citedProvisions) {
            const decisionRelatedCitationsId = await (0, updateDecisions_1.insert_decision_related_citations)(decisionId, citedProvision.internalProvisionId, citedProvision.relatedInternalProvisionsId, citedProvision.relatedInternalDecisionsId, pool);
            for (const citation of citedProvision.citations) {
                await (0, updateDecisions_1.insert_decision_related_citations_citations)(decisionId, decisionRelatedCitationsId, citation.blockId, citation.relevantSnippet, pool);
            }
        }
        for (const legalTeaching of jsonData.legalTeachings) {
            await (0, updateDecisions_1.insert_decision_legal_teachings)(decisionId, legalTeaching.teachingId, legalTeaching.text, legalTeaching.courtVerbatim, legalTeaching.courtVerbatimLanguage, legalTeaching.factualTrigger, legalTeaching.relevantFactualContext, legalTeaching.principleType, legalTeaching.legalArea, legalTeaching.hierarchicalRelationships.refinesParentPrinciple, legalTeaching.hierarchicalRelationships.refinedByChildPrinciples, legalTeaching.hierarchicalRelationships.exceptionToPrinciple, legalTeaching.hierarchicalRelationships.exceptedByPrinciples, legalTeaching.hierarchicalRelationships.conflictsWith, legalTeaching.precedentialWeight.courtLevel, legalTeaching.precedentialWeight.binding, legalTeaching.precedentialWeight.clarity, legalTeaching.precedentialWeight.novelPrinciple, legalTeaching.precedentialWeight.confirmsExistingDoctrine, legalTeaching.precedentialWeight.distinguishesPriorCase, legalTeaching.relatedLegalIssuesId, legalTeaching.relatedCitedProvisionsId, legalTeaching.related_citedDecisionsId, legalTeaching.sourceAuthor, pool);
        }
        for (const legalTeachings of jsonData.relatedCitationsLegalTeachings.legalTeachings) {
            const decision_related_citations_legal_teachings_id = await (0, updateDecisions_1.insert_decisions_related_citations_legal_teachings)(decisionId, legalTeachings.teachingId, pool);
            for (const citation of legalTeachings.citations) {
                await (0, updateDecisions_1.insert_decisions_related_citations_legal_teachings_citations)(decisionId, decision_related_citations_legal_teachings_id, citation.blockId, citation.relevantSnippet, pool);
            }
        }
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