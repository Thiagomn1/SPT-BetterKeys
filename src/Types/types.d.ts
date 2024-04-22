interface Key {
  Extract: string[];
  Quest: string[];
  Loot: string[];
}

export type Keys = Record<string, Key>;

export interface Locale {
  mapString: string;
  questString: string;
  extractString: string;
  lootString: string;
  yes: string;
  no: string;
  Safe: string;
  Medbag: string;
  PC: string;
  Grenade: string;
  Drawer: string;
  CashReg: string;
  Ammo: string;
  Crate: string;
  WeaponBox: string;
  Jacket: string;
  Bag: string;
  Toolbox: string;
  LooseVal: string;
  LooseCash: string;
  LooseLoot: string;
  WeaponRack: string;
}
