import TextField from '@mui/material/TextField';

// Wraps the value/onChange/onBlur/error/helperText wiring shared by every
// Formik-bound TextField in the form, instead of repeating it at each call
// site (see #60).
export default function FormikTextField({ formik, name, label, fullWidth, multiline, onChange }: {
  formik: any;
  name: string;
  label: React.ReactNode;
  fullWidth?: boolean;
  multiline?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      variant="standard"
      id={name}
      name={name}
      multiline={multiline}
      value={formik.values[name]}
      onChange={onChange ?? formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );
}
