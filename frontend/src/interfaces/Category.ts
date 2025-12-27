export default interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  children?: Category[];
}
