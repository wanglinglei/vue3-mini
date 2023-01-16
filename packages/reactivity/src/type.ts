export type TEffect = () => void;

export interface IEffectOptions {
  lazy?: boolean;
}

export type TKey = string | number | symbol;

export type TDep = Set<TEffect>;
export type TDepMap = Map<any, TDep>;
