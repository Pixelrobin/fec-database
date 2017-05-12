// Since this compiles with two differet typescript options,
// I need to redeclare this file twice.
// One is in app/@types/
// One is in printer/

// Only need these 3 for now
export enum DISPLAYTYPE {
    HEADER = 0,
    TABLE = 1,
    MULTICOLUMN = 2
}

// Single table column
export interface TableColumn {
    header: string // Header to display on top of table
    id: string // Object data to refer to
}

export interface RenderElement {
    // Element type
    type: string

    // Used for headers 
    headerText?: string // The header text
    headerSize?: number

    // Used for tables
    tableCols?: TableColumn[]; // Table columns
    tableData?: any[]; // Data for table to display

    // Used for multicolumns
    columns?: RenderElement[][];
}