import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { LegalDecisionData } from './legalData';
import { insert_decision_legal_teachings, insert_decision_related_citations, insert_decision_related_citations_citations, insert_decisions_cited_provisions, insert_decisions_related_citations_legal_teachings, insert_decisions_related_citations_legal_teachings_citations, insert_extracted_references, insertArguments, insertCitedDecisions, insertParties, insertRequests, updateDecision } from './updateDecisions';
// Type definitions for Legal Decision JSON structure

/**
 * Validates a date string and returns it if valid, or null if invalid
 * @param dateString - The date string to validate (format: YYYY-MM-DD)
 * @param context - Context information for logging (e.g., file name, field name)
 * @returns A Date object if valid, null if invalid
 */
function validateDate(dateString: string | null | undefined, context: string): string | null {
  if (!dateString) {
    return null;
  }
  
  // Validate format: YYYY-MM-DD
  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateString.match(datePattern);
  
  if (!match) {
    console.warn(`Invalid date format "${dateString}" in ${context}. Expected YYYY-MM-DD. Setting to null.`);
    return null;
  }
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  
  // Validate ranges
  if (month < 1 || month > 12) {
    console.warn(`Invalid date "${dateString}" in ${context} (month out of range). Setting to null.`);
    return null;
  }
  
  // Days in each month (non-leap year)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Check for leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const maxDay = month === 2 && isLeapYear ? 29 : daysInMonth[month - 1];
  
  if (day < 1 || day > maxDay) {
    console.warn(`Invalid date "${dateString}" in ${context} (day out of range for ${year}-${month.toString().padStart(2, '0')}). Setting to null.`);
    return null;
  }
  
  // Create Date object - use UTC to avoid timezone issues
  const date = new Date(Date.UTC(year, month - 1, day));
  
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date "${dateString}" in ${context}. Setting to null.`);
    return null;
  }
  
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export async function processFile(fileName: string, pool: Pool): Promise<void> {
  try {
    
    // Read the JSON file
    const filePath = path.join(__dirname, 'imported_files', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse JSON content into an object
    const jsonData: LegalDecisionData = JSON.parse(fileContent);
    

    const decisionId = await findById(jsonData.decision_id, pool);

    
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
            const validatedDate = validateDate(
              citedDecision.date, 
              `${fileName} - citedDecision ${citedDecision.internalDecisionId}`
            );
            
            await insertCitedDecisions( 
                decisionId, 
                citedDecision.decisionSequence,
                citedDecision.courtJurisdictionCode, 
                citedDecision.courtName,
                 validatedDate, 
                 citedDecision.caseNumber, 
                 citedDecision.ecli, 
                 citedDecision.treatment, 
                 citedDecision.type, 
                 citedDecision.internalDecisionId,
                  pool);
          }

          for (const citedProvision of jsonData.citedProvisions) {
            const validatedParentActDate = validateDate(
              citedProvision.parentActDate,
              `${fileName} - citedProvision ${citedProvision.internalProvisionId}`
            );
            
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
                 validatedParentActDate,
                 citedProvision.parentActNumber,
                 citedProvision.provisionInterpretation,
                 citedProvision.relevantFactualContext,
                  pool);
          }


        
            await insert_extracted_references(
                decisionId  , 
                jsonData.extractedReferences.url_eu,
                jsonData.extractedReferences.url_be,
                 jsonData.extractedReferences.reference_eu_extracted,
                 jsonData.extractedReferences.reference_be_verified,
                 jsonData.extractedReferences.reference_be_extracted,
                 jsonData.extractedReferences.reference_be_verified_numac,
                 jsonData.extractedReferences.reference_be_verified_fileNumber,
                  pool);
        


        if (jsonData.relatedCitationsLegalProvisions?.citedProvisions) {
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

          if (jsonData.relatedCitationsLegalTeachings?.legalTeachings) {
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
