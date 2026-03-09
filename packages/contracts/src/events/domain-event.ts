export interface DomainEvent<TName extends string = string, TPayload = unknown> {
  name: TName;
  payload: TPayload;
}
