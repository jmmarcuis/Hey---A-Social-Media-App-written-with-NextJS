// utils/composeHOCs.ts
type HOC<P> = (Component: React.ComponentType<P>) => React.ComponentType<P>;

export function composeHOCs<P extends object>(...hocs: HOC<P>[]) {
  return (WrappedComponent: React.ComponentType<P>) => {
    return hocs.reduceRight((acc, hoc) => {
      return hoc(acc);
    }, WrappedComponent);
  };
}