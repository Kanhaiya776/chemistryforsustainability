type SortingOption = {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
};


class Constants {
  static ELEMENTS_PER_PAGE: number = 15;

  static AVAILABLE_ELEMENTS_PER_PAGE: Array<number> = [5, 10, 15];

  static ACS_LABEL: string = 'ACS Pub';

  static TAB_LABELS: Record<string, string> = {
    'policy': 'Chemical Policies',
    'announcements': 'Community News',
    // 'learning_object': 'Educational Resources (GCTLC)',
    'event': 'Events',
    'funding_opportunity': 'Funding Opportunities',
    'organization': 'Organization',
    'professional_development': 'Professional Development',
    'publication': 'Publications & Reports (Internal)',
    'case_study': 'Safer Alternatives',
    'tool': 'Tools & Metrics',
  };


  static SORTING_OPTIONS: Record<string, SortingOption> = {
    'most_recent': { sortBy: 'created', sortOrder: 'DESC' },
    'least_recent': { sortBy: 'created', sortOrder: 'ASC' },
    'A_Z': { sortBy: 'title', sortOrder: 'ASC' },
    'Z_A': { sortBy: 'title', sortOrder: 'DESC' },
  };
}

export default Constants;
