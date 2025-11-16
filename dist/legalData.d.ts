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
    provision_id: string | null;
    parent_act_id: string | null;
    internal_provision_id: string;
    internal_parent_act_id: string;
    provision_number: string;
    provision_number_key: string;
    parent_act_type: string;
    parent_act_name: string;
    parent_act_date: Date | null;
    parent_act_number: string | null;
    provision_interpretation: string | null;
    relevant_factual_context: string | null;
}
interface CitedDecision {
    decision_id: number | null;
    cited_decision_id: number | null;
    decision_sequence: number;
    court_jurisdiction_code: string;
    court_name: string;
    cited_date: Date;
    case_number: string | null;
    ecli: string | null;
    treatment: string;
    cited_type: string;
    internal_decision_id: string;
}
interface HierarchicalRelationships {
    refines_parent_principle: string | null;
    refined_byChild_principles: string[];
    exception_to_principle: string | null;
    excepted_by_principles: string[];
    conflicts_with: string[];
}
interface PrecedentialWeight {
    court_level: string;
    binding: boolean;
    clarity: string;
    novel_principle: boolean;
    confirms_existing_doctrine: boolean;
    distinguishes_prior_case: boolean;
}
interface LegalTeaching {
    teaching_id: string;
    teaching_text: string;
    court_verbatim: string;
    court_verbatim_language: string;
    factual_trigger: string;
    relevant_factual_context: string;
    principle_type: string;
    legal_area: string;
    hierarchical_relationships: HierarchicalRelationships;
    precedential_weight: PrecedentialWeight;
    related_legal_issues_id: string[];
    related_cited_provisions_id: string[];
    related_cited_decisions_id: string[];
    source_author: string;
}
interface Citation {
    block_id: string;
    relevant_snippet: string;
}
interface ProvisionCitation {
    internal_provision_id: string;
    citations: Citation[];
    relatedInternal_provisions_id: string[];
    related_internal_decisions_id: string[];
}
interface TeachingCitation {
    teaching_id: string;
    citations: Citation[];
}
interface RelatedCitationsLegalProvisions {
    citedProvisions: ProvisionCitation[];
}
interface RelatedCitationsLegalTeachings {
    legalTeachings: TeachingCitation[];
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
}
export {};
//# sourceMappingURL=legalData.d.ts.map