ALTER TABLE decisions1 
ADD COLUMN custom_keywords varchar(255)[];

ALTER TABLE decisions1 
ADD COLUMN micro_summary TEXT;



ALTER TABLE decisions1 
ADD COLUMN citation_reference varchar(255);

ALTER TABLE decisions1 
ADD COLUMN facts TEXT;

ALTER TABLE decisions1 
ADD COLUMN court_order TEXT;


ALTER TABLE decisions1 
ADD COLUMN outcome varchar(50);

CREATE TABLE decision_parties (
  id serial4 NOT NULL,
  party_id varchar(255) NOT NULL,
  decision_id INTEGER NOT NULL,
  party_name varchar(255) NOT NULL,
  party_type  varchar(255) NOT NULL,
  procedural_role varchar(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_parties_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_decision_parties_decision_id ON decision_parties(decision_id);
CREATE UNIQUE INDEX idx_decision_parties_party_id ON decision_parties(party_id);




CREATE TABLE decision_requests (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  party_id varchar(255) NOT NULL,
  requests varchar(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_requests_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_decision_requests_decision_id ON decision_requests(decision_id);

CREATE TABLE decision_arguments (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  party_id varchar(255) NOT NULL,
  argument TEXT,
  treatment varchar(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_arguments_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_decision_arguments_decision_id ON decision_arguments(decision_id);





CREATE TABLE cited_decisions (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,  -- The decision that contains this citation
  decision_sequence INTEGER NOT NULL,
  court_jurisdiction_code varchar(10),
  court_name varchar(255),
  cited_date DATE,
  case_number varchar(255),
  ecli varchar(255),
  treatment varchar(255),
  cited_type varchar(255),
  internal_decision_id varchar(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT cited_decisions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_cited_decisions_decision_id ON cited_decisions(decision_id);


CREATE TABLE decision_cited_provisions (
id serial4 NOT NULL,
decision_id INTEGER NOT NULL,
provision_id INTEGER,
parent_act_id INTEGER,
internal_provision_id varchar(255),
internal_parent_act_id varchar(255),
provision_number varchar(30),
provision_number_key varchar(30),
parent_act_type varchar(30),
parent_act_name TEXT,
parent_act_date DATE,
parent_act_number varchar(255),
provision_interpretation TEXT,
relevant_factual_context TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT decision_cited_provisions_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_decision_cited_provisions_decision_id ON decision_cited_provisions(decision_id);


CREATE TABLE decision_related_citations (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  internal_provision_id varchar(60),
  related_internal_provisions_id varchar(60)[],
  related_internal_decisions_id varchar(60)[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_related_citations_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_decision_related_citations_decision_id ON decision_related_citations(decision_id);


CREATE TABLE decision_related_citations_citations (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  decision_related_citations_id INTEGER NOT NULL,
  block_id varchar(60),
  relevant_snippet TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_related_citations_citations_pkey PRIMARY KEY (id)
);






CREATE TABLE decision_legal_teachings (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  teaching_id varchar(60) NOT NULL,
  teaching_text TEXT,
  court_verbatim TEXT,
  court_verbatim_language varchar(2),
  factual_trigger TEXT,
  relevant_factual_context TEXT,
  principle_type varchar(50),
  legal_area varchar(50),
  refines_parent_principle varchar(50),
  refined_by_child_principles varchar(50)[],
  exception_to_principle varchar(50),
  excepted_by_principles varchar(50)[],
  conflicts_with varchar(50)[],
  court_level varchar(50),
  teaching_binding boolean,
  clarity varchar(20),
  novel_principle boolean,
  confirms_existing_doctrine boolean,
  distinguishes_prior_case boolean,
  related_legal_issues_id varchar(60)[],
  related_cited_provisions_id varchar(60)[],
  related_cited_decisions_id varchar(60)[],
  source_author varchar(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_legal_teachings_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_decision_legal_teachings_decision_id 
  ON decision_legal_teachings(decision_id);
CREATE INDEX idx_decision_legal_teachings_teaching_id 
  ON decision_legal_teachings(teaching_id);



CREATE INDEX idx_decision_related_citations_citations_decision_id 
  ON decision_related_citations_citations(decision_id);
CREATE INDEX idx_decision_related_citations_citations_related_id 
  ON decision_related_citations_citations(decision_related_citations_id);


CREATE TABLE decision_related_citations_legal_teachings (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  teaching_id varchar(60) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_related_citations_legal_teachings_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_decision_related_citations_legal_teachings_decision_id 
  ON decision_related_citations_legal_teachings(decision_id);


CREATE TABLE decision_related_citations_legal_teachings_citations (
  id serial4 NOT NULL,
  decision_id INTEGER NOT NULL,
  decision_related_citations_legal_teachings_id INTEGER NOT NULL,
  block_id varchar(60),
  relevant_snippet TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT decision_related_citations_legal_teachings_citations_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_drcltc_decision_id 
  ON decision_related_citations_legal_teachings_citations(decision_id);
CREATE INDEX idx_drcltc_legal_teachings_id 
  ON decision_related_citations_legal_teachings_citations(decision_related_citations_legal_teachings_id);