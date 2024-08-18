type Resolve<T> = (value: T) => void;
type Reject = (reason?: any) => void;

export type SignalManager<T> = Promise<T> & { resolve: Resolve<T>, reject: Reject, state: { resolved: boolean, rejected: boolean } };

export function createSignalManager<T = undefined>(): SignalManager<T> {
  const state = {
    resolved: false,
    rejected: false,
  };

  let resolve: Resolve<T>;
  let reject: Reject;

  const promise = new Promise<T>((res, rej) => void ((resolve = res) && (reject = rej)));

  const signalManager: SignalManager<T> = promise as any;
  signalManager.resolve = (value: T) => void (resolve(value), state.resolved = true);
  signalManager.reject = (value: T) => void (reject(value), state.rejected = true);
  signalManager.state = state;

  return signalManager;
}

// const someSignalManager = createSignalManager<{ id: string }>();
// someSignalManager.then(({ id }) => console.log(id, someSignalManager.state.resolved));
// someSignalManager.resolve({ id: '123' });
