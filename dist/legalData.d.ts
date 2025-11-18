interface Party {
    id: string;
    name: string;
    type: string;
    proceduralRole: string;
}
interface Request {
    partyId: string;
    requests: string;
}
interface Argument {
    partyId: string;
    argument: string;
    treatment: string;
}
interface CurrentInstance {
    facts: string;
    requests: Request[];
    arguments: Argument[];
    courtOrder: string;
    outcome: string;
}
interface CitedProvision {
    provisionId: string | null;
    parentActId: string | null;
    internalProvisionId: string;
    internalParentActId: string;
    provisionNumber: string;
    provisionNumberKey: string;
    parentActType: string;
    parentActName: string;
    parentActDate: Date | null;
    parentActNumber: string | null;
    provisionInterpretation: string | null;
    relevantFactualContext: string | null;
}
interface CitedDecision {
    decision_id: number | null;
    cited_decision_id: number | null;
    decisionSequence: number;
    courtJurisdictionCode: string;
    courtName: string;
    date: Date;
    caseNumber: string | null;
    ecli: string | null;
    treatment: string;
    type: string;
    internalDecisionId: string;
}
interface HierarchicalRelationships {
    refinesParentPrinciple: string | null;
    refinedByChildPrinciples: string[];
    exceptionToPrinciple: string | null;
    exceptedByPrinciples: string[];
    conflictsWith: string[];
}
interface PrecedentialWeight {
    courtLevel: string;
    binding: boolean;
    clarity: string;
    novelPrinciple: boolean;
    confirmsExistingDoctrine: boolean;
    distinguishesPriorCase: boolean;
}
interface LegalTeaching {
    teachingId: string;
    text: string;
    courtVerbatim: string;
    courtVerbatimLanguage: string;
    factualTrigger: string;
    relevantFactualContext: string;
    principleType: string;
    legalArea: string;
    hierarchicalRelationships: HierarchicalRelationships;
    precedentialWeight: PrecedentialWeight;
    relatedLegalIssuesId: string[];
    relatedCitedProvisionsId: string[];
    related_citedDecisionsId: string[];
    sourceAuthor: string;
}
interface Citation {
    blockId: string;
    relevantSnippet: string;
}
interface ProvisionCitation {
    internalProvisionId: string;
    citations: Citation[];
    relatedInternalProvisionsId: string[];
    relatedInternalDecisionsId: string[];
}
interface TeachingCitation {
    teachingId: string;
    citations: Citation[];
}
interface RelatedCitationsLegalProvisions {
    citedProvisions: ProvisionCitation[];
}
interface RelatedCitationsLegalTeachings {
    legalTeachings: TeachingCitation[];
}
interface ExtractedReferences {
    url_eu: string[];
    url_be: string[];
    reference_eu_extracted: string[];
    reference_be_verified: string[];
    reference_be_extracted: string[];
    reference_be_verified_numac: string[];
    reference_be_verified_fileNumber: string[];
}
export interface LegalDecisionData {
    decision_id: string;
    language: string;
    citation_reference: string;
    parties: Party[];
    currentInstance: CurrentInstance;
    citedProvisions: CitedProvision[];
    citedDecisions: CitedDecision[];
    customKeywords: string[];
    legalTeachings: LegalTeaching[];
    microSummary: string;
    relatedCitationsLegalProvisions: RelatedCitationsLegalProvisions;
    relatedCitationsLegalTeachings: RelatedCitationsLegalTeachings;
    extractedReferences: ExtractedReferences;
}
export {};
//# sourceMappingURL=legalData.d.ts.map