/// <reference types="react" />
declare const _default: {
  Alert: import('react').ForwardRefExoticComponent<
    import('react').HTMLAttributes<HTMLDivElement> &
      import('class-variance-authority').VariantProps<
        (
          props?:
            | ({
                variant?: 'default' | 'destructive' | null | undefined;
              } & import('class-variance-authority/dist/types').ClassProp)
            | undefined,
        ) => string
      > &
      import('react').RefAttributes<HTMLDivElement>
  >;
  Checkbox: import('react').ForwardRefExoticComponent<
    Omit<
      import('@radix-ui/react-checkbox').CheckboxProps &
        import('react').RefAttributes<HTMLButtonElement>,
      'ref'
    > &
      import('react').RefAttributes<HTMLButtonElement>
  >;
  Button: import('react').ForwardRefExoticComponent<
    import('./button').ButtonProps &
      import('react').RefAttributes<HTMLButtonElement>
  >;
  Input: import('react').ForwardRefExoticComponent<
    Omit<
      import('react').DetailedHTMLProps<
        import('react').InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >,
      'ref'
    > &
      import('react').RefAttributes<HTMLInputElement>
  >;
};
export default _default;
