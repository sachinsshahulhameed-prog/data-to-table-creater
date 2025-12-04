export interface FormField {
  id: number;
  name: string;
}

export type DataRow = Record<string, string | number | undefined>;

export enum View {
  FORM_EDITOR,
  DATA_VIEW,
}

export interface Table {
  id: number;
  name: string;
  fields: FormField[];
  data: DataRow[];
  spreadsheetId?: string;
  sheetUrl?: string;
}

export interface User {
  username: string;
  password?: string;
}