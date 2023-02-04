export type TVoid = () => void;
export interface IEffectAndOPt {
  (): void;
  _isEffect?: boolean;
  options?: IEffectOptions;
  raw?: TVoid;
}
export interface IEffectOptions {
  lazy?: boolean;
  schedule?: TVoid;
}

export type TKey = string | number | symbol;

export type TDep = Set<IEffectAndOPt>;
export type TDepMap = Map<any, TDep>;

export type TTriggerType = "SET" | "ADD" | "DELETE" | "CLEAR";

export interface IRef<T> {
  value: T;
}

export type TRefValue = string | number | Boolean;

// computed

export type TSetter = (newValue: any) => void;
export interface IComputedInt {
  get: TVoid;
  set: TSetter;
}
