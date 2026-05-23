export default function FormField({
  label,
  name,
  type = "text",
  as = "input",
  full = false,
  children,
  ...props
}) {
  const Control = as;

  return (
    <label className={full ? "full" : undefined}>
      {label}
      <Control name={name} type={as === "input" ? type : undefined} {...props}>
        {children}
      </Control>
    </label>
  );
}
