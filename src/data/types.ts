export type Status = 'rule' | 'chart' | 'disputed';

export type Sphere = 'kamavacara' | 'rupavacara' | 'arupavacara' | 'lokuttara';
export type Jati = 'akusala' | 'kusala' | 'vipaka' | 'kiriya';
export type Vedana = 'somanassa' | 'domanassa' | 'upekkha' | 'sukha' | 'dukkha';
export type Hetu = 'ahetuka' | 'ekahetuka' | 'dvihetuka' | 'tihetuka';
export type Sankharika = 'asankharika' | 'sasankharika';
export type Sampayutta =
  | 'ditthi'
  | 'ditthi-vippayutta'
  | 'patigha'
  | 'vicikiccha'
  | 'uddhacca'
  | 'nana'
  | 'nana-vippayutta';
export type Category = 'akusala' | 'ahetuka' | 'kama-sobhana' | 'rupa' | 'arupa' | 'lokuttara';

export type GroupId =
  | 'lobhamula'
  | 'dosamula'
  | 'mohamula'
  | 'akusala-vipaka'
  | 'ahetuka-kusala-vipaka'
  | 'ahetuka-kiriya'
  | 'kama-kusala'
  | 'kama-vipaka'
  | 'kama-kiriya'
  | 'rupa-kusala'
  | 'rupa-vipaka'
  | 'rupa-kiriya'
  | 'arupa-kusala'
  | 'arupa-vipaka'
  | 'arupa-kiriya'
  | 'magga'
  | 'phala';

export interface Group {
  id: GroupId;
  nameSi: string;
  sphere: Sphere;
  category: Category;
}

export interface Citta {
  id: number;
  nameSi: string;
  short: string;
  group: GroupId;
  sphere: Sphere;
  jati: Jati;
  vedana: Vedana;
  hetu: Hetu;
  sankharika: Sankharika | null;
  sampayutta: Sampayutta | null;
  /** Jhāna-factor level: rūpa 1–5, arūpa 5, lokuttara 1 (89 scheme), else null. */
  jhana: 1 | 2 | 3 | 4 | 5 | null;
}

export type Band = 'annasamana' | 'akusala' | 'sobhana';
export type CetasikaSubgroup =
  | 'sabbacitta'
  | 'pakinnaka'
  | 'moha-catuka'
  | 'lobha-tika'
  | 'dosa-catuka'
  | 'thina-duka'
  | 'vicikiccha'
  | 'sobhana-sadharana'
  | 'virati'
  | 'appamanna'
  | 'panna';

export interface Cetasika {
  id: number;
  nameSi: string;
  band: Band;
  subgroup: CetasikaSubgroup;
}

export type KiccaId =
  | 'patisandhi'
  | 'bhavanga'
  | 'cuti'
  | 'avajjana'
  | 'dassana'
  | 'savana'
  | 'ghayana'
  | 'sayana'
  | 'phusana'
  | 'sampaticchana'
  | 'santirana'
  | 'votthapana'
  | 'javana'
  | 'tadarammana';

export interface Kicca {
  id: KiccaId;
  nameSi: string;
  /** Column in the vīthi strip; the five sense functions share column 4. */
  vithiOrder: number;
}

export type PsLinkId =
  | 'avijja-sankhara'
  | 'kusalamula-sankhara'
  | 'akusalamula-sankhara'
  | 'sankhara-vinnana'
  | 'vinnana-nama'
  | 'nama-chatthayatana'
  | 'chatthayatana-phassa'
  | 'phassa-vedana'
  | 'vedana-tanha'
  | 'vedana-patigha'
  | 'vedana-vicikiccha'
  | 'vedana-uddhacca'
  | 'vedana-pasada'
  | 'vedana-adhimokkha'
  | 'vedana-bhava'
  | 'tanha-upadana'
  | 'tanha-adhimokkha'
  | 'patigha-adhimokkha'
  | 'uddhacca-adhimokkha'
  | 'pasada-adhimokkha'
  | 'vicikiccha-bhava'
  | 'upadana-bhava'
  | 'adhimokkha-bhava'
  | 'bhava-jati'
  | 'jati-jaramarana';

export interface PsLink {
  id: PsLinkId;
  fromSi: string;
  toSi: string;
  /** Position 1–11 in the chain. */
  slot: number;
}

export type PuggalaId =
  | 'duggati-ahetuka'
  | 'sugati-ahetuka'
  | 'dvihetuka'
  | 'tihetuka'
  | 'sotapanna'
  | 'sakadagami'
  | 'anagami'
  | 'arahant';

export interface Puggala {
  id: PuggalaId;
  nameSi: string;
}

export type BhumiId = 'kama' | 'rupa' | 'arupa';

export interface Bhumi {
  id: BhumiId;
  nameSi: string;
}

export interface CetasikaRel {
  citta: number;
  cetasika: number;
  kind: 'niyata' | 'aniyata';
  status: Status;
  note?: string;
}

export interface KiccaRel {
  citta: number;
  kicca: KiccaId;
  status: Status;
  note?: string;
}

export interface PsRel {
  citta: number;
  psLink: PsLinkId;
  status: Status;
  note?: string;
}

export interface PuggalaRel {
  citta: number;
  puggala: PuggalaId;
  status: Status;
  note?: string;
}

export interface BhumiRel {
  citta: number;
  bhumi: BhumiId;
  status: Status;
  note?: string;
}
