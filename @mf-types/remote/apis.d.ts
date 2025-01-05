export type RemoteKeys = 'remote/Button' | 'remote/Components';
type PackageType<T> = T extends 'remote/Components'
  ? typeof import('remote/Components')
  : T extends 'remote/Button'
    ? typeof import('remote/Button')
    : any;
