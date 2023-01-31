export type TEffect = () => void;
export type TVoid = () => void;
export interface IEffectOptions {
  lazy?: boolean;
}

export type TKey = string | number | symbol;

export type TDep = Set<TEffect>;
export type TDepMap = Map<any, TDep>;

export type TTriggerType = "SET" | "ADD" | "DELETE" | "CLEAR";

export interface IRef<T> {
  value: T;
}

export type TRefValue = string | number | Boolean;
