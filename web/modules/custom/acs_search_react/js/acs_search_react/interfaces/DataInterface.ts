export interface Row {
  title: string;
  description: string;
  url: string;
  type: string | null;
}

export interface Data {
  rows: Row[];
  total_rows: number;
}

export interface Pager {
  current_page: number;
  items_per_page: string;
  total_items: number;
  total_pages: number;
}

export interface ApiResponse {
  rows: Row[];
  status: number;
  total_rows: number | null;
  pager?: Pager;
}
