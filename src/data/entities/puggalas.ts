import type { Puggala, PuggalaId } from '../types';

export const PUGGALAS: Puggala[] = [
  { id: 'duggati-ahetuka', nameSi: 'දුග්ගති අහේතුක' },
  { id: 'sugati-ahetuka', nameSi: 'සුගති අහේතුක' },
  { id: 'dvihetuka', nameSi: 'ද්විහේතුක' },
  { id: 'tihetuka', nameSi: 'ත්‍රිහේතුක පෘථග්ජන' },
  { id: 'sotapanna', nameSi: 'සෝතාපන්න' },
  { id: 'sakadagami', nameSi: 'සකදාගාමී' },
  { id: 'anagami', nameSi: 'අනාගාමී' },
  { id: 'arahant', nameSi: 'අර්හත්' },
];

export const puggalaById = new Map<PuggalaId, Puggala>(PUGGALAS.map((p) => [p.id, p]));
