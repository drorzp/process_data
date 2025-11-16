import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { LegalDecisionData } from './legalData';
import { insert_decision_legal_teachings, insert_decision_related_citations, insert_decision_related_citations_citations, insert_decisions_cited_provisions, insert_decisions_related_citations_legal_teachings, insert_decisions_related_citations_legal_teachings_citations, insertArguments, insertCitedDecisions, insertParties, insertRequests, updateDecision } from './updateDecisions';
// Type definitions for Legal Decision JSON structure


export async function processFile(fileName: string, pool: Pool): Promise<void> {
  try {
    console.log(`Processing file: ${fileName}`);
    
    // Read the JSON file
    const filePath = path.join(__dirname, 'imported_files', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse JSON content into an object
    const jsonData: LegalDecisionData = JSON.parse(fileContent);
    
    console.log(`Parsed JSON for ${fileName}:`, jsonData.decision_id);
    const decisionId = await findById(jsonData.decision_id, pool);
    console.log(` decision id: ${decisionId}`);
    
    if (decisionId === -1) {
      console.log(`Decision not found in database: ${jsonData.decision_id}. Copying to errors folder.`);
      
      // Create errors directory if it doesn't exist
      const errorsDir = path.join(__dirname, 'errors');
      if (!fs.existsSync(errorsDir)) {
        fs.mkdirSync(errorsDir, { recursive: true });
      }
      
      // Copy file to errors folder
      const errorFilePath = path.join(errorsDir, fileName);
      fs.copyFileSync(filePath, errorFilePath);
      console.log(`File copied to: ${errorFilePath}`);
      
      return; // Skip to next file
    }

        await updateDecision(decisionId,  
            jsonData.customKeywords,
            jsonData.microSummary,
            jsonData.citation_reference,
            jsonData.currentInstance.facts,
            jsonData.currentInstance.courtOrder,
            jsonData.currentInstance.outcome,
             pool);

         for (const request of jsonData.currentInstance.requests) {
                await insertRequests(decisionId, request.partyId, request.requests, pool);
            }

            for (const argument of jsonData.currentInstance.arguments) {
                await insertArguments(decisionId, argument.partyId, argument.argument, argument.treatment, pool);
            }

          for (const party of jsonData.parties) {
            await insertParties(decisionId, party.id, party.name, party.type, party.proceduralRole, pool);
          }

          for (const citedDecision of jsonData.citedDecisions) {
            await insertCitedDecisions( 
                decisionId, 
                citedDecision.decisionSequence,
                citedDecision.courtJurisdictionCode, 
                citedDecision.courtName,
                 citedDecision.date, 
                 citedDecision.caseNumber, 
                 citedDecision.ecli, 
                 citedDecision.treatment, 
                 citedDecision.type, 
                 citedDecision.internalDecisionId,
                  pool);
          }

          for (const citedProvision of jsonData.citedProvisions) {
            await insert_decisions_cited_provisions(
                decisionId, 
                citedProvision.provisionId,
                citedProvision.parentActId, 
                citedProvision.internalProvisionId,
                 citedProvision.internalParentActId, 
                 citedProvision.provisionNumber, 
                 citedProvision.provisionNumberKey, 
                 citedProvision.parentActType, 
                 citedProvision.parentActName, 
                 citedProvision.parentActDate,
                 citedProvision.parentActName,
                 citedProvision.provisionInterpretation,
                 citedProvision.relevantFactualContext,
                  pool);
          }


        for (const citedProvision of jsonData.relatedCitationsLegalProvisions.citedProvisions) {
            const decisionRelatedCitationsId =  await insert_decision_related_citations(decisionId, 
                citedProvision.internalProvisionId,
                citedProvision.relatedInternalProvisionsId,
                 citedProvision.relatedInternalDecisionsId,
                  pool);
                  for (const citation of citedProvision.citations) {
                   await insert_decision_related_citations_citations(
                        decisionId, 
                        decisionRelatedCitationsId,
                        citation.blockId,
                         citation.relevantSnippet,
                          pool);
                  }
          }

          for (const legalTeaching of jsonData.legalTeachings) {
            await insert_decision_legal_teachings(decisionId, 
                legalTeaching.teachingId,
                legalTeaching.text,
                 legalTeaching.courtVerbatim,
                 legalTeaching.courtVerbatimLanguage,
                 legalTeaching.factualTrigger,
                 legalTeaching.relevantFactualContext,    
                 legalTeaching.principleType,
                 legalTeaching.legalArea,
                 legalTeaching.hierarchicalRelationships.refinesParentPrinciple,
                 legalTeaching.hierarchicalRelationships.refinedByChildPrinciples,
                 legalTeaching.hierarchicalRelationships.exceptionToPrinciple,
                 legalTeaching.hierarchicalRelationships.exceptedByPrinciples,
                 legalTeaching.hierarchicalRelationships.conflictsWith,
                 legalTeaching.precedentialWeight.courtLevel,
                 legalTeaching.precedentialWeight.binding,
                 legalTeaching.precedentialWeight.clarity,
                 legalTeaching.precedentialWeight.novelPrinciple,
                 legalTeaching.precedentialWeight.confirmsExistingDoctrine,
                 legalTeaching.precedentialWeight.distinguishesPriorCase,
                 legalTeaching.relatedLegalIssuesId,
                 legalTeaching.relatedCitedProvisionsId,
                 legalTeaching.related_citedDecisionsId,
                 legalTeaching.sourceAuthor,
                  pool);
          }

          for (const legalTeachings of jsonData.relatedCitationsLegalTeachings.legalTeachings) {
            const decision_related_citations_legal_teachings_id = await insert_decisions_related_citations_legal_teachings(decisionId, 
                legalTeachings.teachingId,
                pool);
            for (const citation of legalTeachings.citations) {
              await insert_decisions_related_citations_legal_teachings_citations(decisionId, 
                decision_related_citations_legal_teachings_id,
                citation.blockId,
                citation.relevantSnippet,
                pool);
            }
          }
    
  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    throw error;
  }
}

export async function findById(decision_id: string, pool: Pool): Promise<number> {
  try {
    const query = 'SELECT id FROM decisions1 WHERE decision_id = $1';
    const result = await pool.query(query, [decision_id]);
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    console.error(`Error finding decision_id ${decision_id}:`, error);
    throw error;
  }
}
