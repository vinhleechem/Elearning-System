
export interface MegaMenuColumn {
  title: string;
  items: string[];
}

export interface MegaMenuTopic {
  label: string;
  categoryId?: number;
  columns: MegaMenuColumn[];
}

export const megaMenuPrimaryTitle = "Explore by Goal";

